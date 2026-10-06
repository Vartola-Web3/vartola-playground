import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as bcrypt from 'bcryptjs';
import { isAlphaMode } from '@/lib/config/app-mode';
import { ensureEmbeddedWallet } from '@/lib/stellar/wallets/provider';
import { rateLimit } from '@/lib/security/rate-limit';
import { assertSameOrigin } from '@/lib/security/origin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      role,
      emiratesId,
      phone,
      companyName,
      tradeLicenseNo,
      country,
      residency,
      investorType,
    } = body;

    assertSameOrigin(request);
    rateLimit(request, 'register', 8);

    if (!email || !password || !name || !role || !emiratesId || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (isAlphaMode() && role === 'INVESTOR' && (!country || !residency || !investorType)) {
      return NextResponse.json({ error: 'Country, residency, and investor type are required' }, { status: 400 });
    }

    if (role !== 'SME' && role !== 'INVESTOR') {
      return NextResponse.json(
        { error: 'Role must be SME or INVESTOR' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let companyId = null;
    if (role === 'SME') {
      if (!companyName || !tradeLicenseNo) {
        return NextResponse.json(
          { error: 'Company details required for SME role' },
          { status: 400 }
        );
      }

      const existingCompany = await prisma.company.findUnique({
        where: { tradeLicenseNo },
      });

      if (existingCompany) {
        return NextResponse.json(
          { error: 'Trade license already registered' },
          { status: 400 }
        );
      }

      const company = await prisma.company.create({
        data: {
          tradeLicenseNo,
          legalName: companyName,
          emirate: 'Dubai',
          industry: 'Other',
          establishedDate: new Date(),
          contactEmail: email,
          contactPhone: phone,
          address: 'To be updated',
        },
      });

      companyId = company.id;
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        companyId,
        phone,
        country: country || null,
        residency: residency || null,
        investorType: investorType || null,
        accountStatus: isAlphaMode() ? 'EMAIL_PENDING' : 'ACTIVE',
      },
    });
    if (isAlphaMode()) {
      try {
        await ensureEmbeddedWallet(user.id);
      } catch (error) {
        console.error('Embedded wallet creation failed:', error);
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        entityType: 'User',
        entityId: user.id,
        changes: JSON.stringify({ email, role }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
