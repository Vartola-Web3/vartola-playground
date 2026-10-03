import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import {
  loadBlockchainConfig,
  setBlockchainConfig,
  BLOCKCHAIN_CONFIG_KEYS,
  clearConfigCache,
} from '@/lib/config/blockchain-config';
import { resetStellarProvider } from '@/lib/stellar/providers/factory';
import { prisma } from '@/lib/db';
import { isAdminOperator } from '@/lib/auth/roles';

/**
 * GET /api/admin/blockchain/settings
 * Load current LIVE blockchain configuration
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !isAdminOperator(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await loadBlockchainConfig();

    return NextResponse.json({
      success: true,
      canConfigure: session.user.role === 'ADMIN',
      config: {
        alchemyApiKey: session.user.role === 'ADMIN' ? config.alchemyApiKey : '',
        stellarRpcUrl: config.stellarRpcUrl,
        stellarHorizonUrl: config.stellarHorizonUrl,
        stellarSorobanRpcUrl: config.stellarSorobanRpcUrl,
        enableSorobanContracts: config.enableSorobanContracts,
      },
    });
  } catch (error) {
    console.error('Failed to load blockchain settings:', error);
    return NextResponse.json(
      { error: 'Failed to load settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/blockchain/settings
 * Update LIVE blockchain configuration
 * This is the ACTIVE config that runtime uses
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      alchemyApiKey,
      stellarRpcUrl,
      stellarHorizonUrl,
      stellarSorobanRpcUrl,
      enableSorobanContracts,
    } = body;

    // Validate inputs
    if (stellarRpcUrl && !stellarRpcUrl.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Stellar RPC URL must start with https://' },
        { status: 400 }
      );
    }

    if (stellarHorizonUrl && !stellarHorizonUrl.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Horizon URL must start with https://' },
        { status: 400 }
      );
    }

    // Update settings in database (LIVE config)
    if (alchemyApiKey !== undefined) {
      await setBlockchainConfig(
        BLOCKCHAIN_CONFIG_KEYS.ALCHEMY_API_KEY,
        alchemyApiKey
      );
    }

    if (stellarRpcUrl !== undefined) {
      await setBlockchainConfig(
        BLOCKCHAIN_CONFIG_KEYS.STELLAR_RPC_URL,
        stellarRpcUrl
      );
    }

    if (stellarHorizonUrl !== undefined) {
      await setBlockchainConfig(
        BLOCKCHAIN_CONFIG_KEYS.STELLAR_HORIZON_URL,
        stellarHorizonUrl
      );
    }

    if (stellarSorobanRpcUrl !== undefined) {
      await setBlockchainConfig(
        BLOCKCHAIN_CONFIG_KEYS.STELLAR_SOROBAN_RPC_URL,
        stellarSorobanRpcUrl
      );
    }

    if (enableSorobanContracts !== undefined) {
      await setBlockchainConfig(
        BLOCKCHAIN_CONFIG_KEYS.ENABLE_SOROBAN_CONTRACTS,
        String(enableSorobanContracts)
      );
    }

    // Clear cache and reset provider to pick up new config
    clearConfigCache();
    resetStellarProvider();

    // Log the change
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'BLOCKCHAIN_SETTINGS_UPDATED',
        entityType: 'SystemSettings',
        entityId: 'blockchain',
        changes: JSON.stringify({
          alchemyApiKeyUpdated: alchemyApiKey !== undefined,
          stellarRpcUrlUpdated: stellarRpcUrl !== undefined,
          stellarHorizonUrlUpdated: stellarHorizonUrl !== undefined,
          stellarSorobanRpcUrlUpdated: stellarSorobanRpcUrl !== undefined,
          enableSorobanContractsUpdated: enableSorobanContracts !== undefined,
        }),
      },
    });

    // Load updated config
    const updatedConfig = await loadBlockchainConfig();

    return NextResponse.json({
      success: true,
      message: 'Blockchain settings updated successfully (LIVE config active)',
      config: updatedConfig,
    });
  } catch (error) {
    console.error('Failed to update blockchain settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
