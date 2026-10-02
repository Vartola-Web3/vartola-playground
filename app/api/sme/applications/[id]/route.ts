import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { calculateRisk } from "@/lib/risk-engine";
import { AssetType } from "@/lib/types";

async function loadApplication(id: string) {
  return prisma.application.findUnique({
    where: { id },
    include: { company: true, documents: true, facility: { include: { payments: true } } },
  });
}

async function assertAccess(userId: string, role: string, id: string, write: boolean) {
  const application = await loadApplication(id);
  if (!application) return { error: NextResponse.json({ error: "Application not found" }, { status: 404 }) };

  if (role === "SME") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });
    if (user?.companyId !== application.companyId || application.status === "ARCHIVED") {
      return { error: NextResponse.json({ error: "Application not found" }, { status: 404 }) };
    }
    return { application };
  }

  if (!write && (role === "UNDERWRITER" || role === "ADMIN")) {
    return { application };
  }

  return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const owned = await assertAccess(session.user.id, session.user.role, id, false);
    if (owned.error) return owned.error;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        company: true,
        documents: { orderBy: { uploadedAt: "desc" } },
        reviews: {
          include: { reviewer: { select: { name: true, role: true } } },
          orderBy: { reviewedAt: "asc" },
        },
        facility: true,
      },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Application fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const owned = await assertAccess(session.user.id, session.user.role, id, true);
    if (owned.error) return owned.error;

    const current = owned.application!;
    const locked = ["APPROVED", "REJECTED", "FUNDED", "CLOSED"].includes(current.status);
    if (locked) {
      return NextResponse.json(
        { error: `Cannot edit application in status ${current.status}` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.assetType === "string") updates.assetType = body.assetType;
    if (body.unitCount != null) updates.unitCount = Math.max(1, Math.floor(Number(body.unitCount) || 1));
    if (typeof body.assetDescription === "string") updates.assetDescription = body.assetDescription;
    if (body.assetValue != null) updates.assetValue = Number(body.assetValue);
    if (body.smeContribution != null) updates.smeContribution = Number(body.smeContribution);
    if (body.financeAmount != null) updates.financeAmount = Number(body.financeAmount);
    if (body.requestedTerm != null) updates.requestedTerm = Number(body.requestedTerm);

    if (typeof body.status === "string") {
      const allowed = ["DRAFT", "SUBMITTED", "DELETION_REQUESTED"];
      if (!allowed.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      // SME can move to draft/submitted/archived only
      updates.status = body.status;
    }

    const moneyChanged =
      updates.assetValue != null || updates.financeAmount != null || updates.requestedTerm != null || updates.assetType != null;
    if (moneyChanged) {
      const risk = calculateRisk({
        company: {
          establishedDate: current.company.establishedDate,
          monthlyRevenue: current.company.monthlyRevenue || 0,
          monthlyExpenses: current.company.monthlyExpenses || 0,
          liabilities: current.company.liabilities || 0,
          industry: current.company.industry,
        },
        asset: {
          assetType: ((updates.assetType as string) || current.assetType) as AssetType,
          assetDescription: (updates.assetDescription as string) || current.assetDescription,
          assetValue: Number(updates.assetValue ?? current.assetValue),
        },
        deal: {
          financeAmount: Number(updates.financeAmount ?? current.financeAmount),
          assetValue: Number(updates.assetValue ?? current.assetValue),
          requestedTerm: Number(updates.requestedTerm ?? current.requestedTerm),
        },
        application: { documents: current.documents },
      });
      updates.companyRiskScore = risk.companyRiskScore;
      updates.assetRiskScore = risk.assetRiskScore;
      updates.dealRiskScore = risk.dealRiskScore;
      updates.riskTier = risk.riskTier;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const application = await prisma.application.update({
      where: { id },
      data: updates,
      include: { documents: true, reviews: { include: { reviewer: { select: { name: true, role: true } } }, orderBy: { reviewedAt: "asc" } } },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "APPLICATION_UPDATED",
        entityType: "Application",
        entityId: application.id,
        changes: JSON.stringify(updates),
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Application update error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only an admin can permanently delete an application" }, { status: 403 });
    }

    const owned = await assertAccess(session.user.id, session.user.role, id, false);
    if (owned.error) return owned.error;

    const current = owned.application!;
    if (["FUNDED", "APPROVED"].includes(current.status)) {
      return NextResponse.json(
        { error: "Cannot delete an approved/funded application. Archive it instead." },
        { status: 400 }
      );
    }

    if (current.facility) {
      const paymentIds = current.facility.payments.map((payment) => payment.id);
      if (paymentIds.length > 0) {
        await prisma.distribution.deleteMany({ where: { paymentId: { in: paymentIds } } });
        await prisma.payment.deleteMany({ where: { facilityId: current.facility.id } });
      }
      await prisma.facility.delete({ where: { id: current.facility.id } });
    }
    await prisma.document.deleteMany({ where: { applicationId: id } });
    await prisma.underwritingReview.deleteMany({ where: { applicationId: id } });
    await prisma.application.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "APPLICATION_DELETED",
        entityType: "Application",
        entityId: id,
        changes: JSON.stringify({ applicationNo: current.applicationNo }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Application delete error:", error);
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
  }
}
