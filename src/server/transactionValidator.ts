import crypto from 'crypto';

export type DepositRecordSource =
  | 'seed_vault'
  | 'gateway_deposit'
  | 'manual_approved'
  | 'investment_maturity'
  | 'admin_deposit_credit';

export interface ServerDepositRecord {
  id: string;
  userId: string;
  currency: string;
  amount: number;
  usdEquivalent: number;
  remainingUsd: number;
  txHash: string;
  gatewayName: string;
  source: DepositRecordSource;
  status: 'verified' | 'revoked';
  createdAt: string;
  signature: string;
}

export type ValidatedTxCategory =
  | 'spin_payment'
  | 'scratch_purchase'
  | 'won_vehicle_shipping'
  | 'vehicle_order_shipping'
  | 'deposit_record'
  | 'admin_adjust'
  | 'service_payment'
  | 'staking_payment'
  | 'stock_trade'
  | 'rental_booking'
  | 'shop_checkout'
  | 'withdrawal_request'
  | 'wallet_consume'
  | 'security_rejection';

export interface ServerTransactionAudit {
  id: string;
  userId: string;
  category: ValidatedTxCategory;
  amountUsd: number;
  depositConsumedUsd: number;
  freeWinConsumedUsd: number;
  depositRecordIdsUsed: string[];
  verifiedDepositBeforeUsd: number;
  verifiedDepositAfterUsd: number;
  freeWinBeforeUsd: number;
  freeWinAfterUsd: number;
  outcome: 'approved' | 'rejected';
  rejectionCode?: string;
  reason: string;
  clientClaimedDepositUsd?: number;
  clientClaimedWalletUsd?: number;
  createdAt: string;
  signature: string;
}

export interface ServerWalletLedger {
  usd: number;
  depositUsd: number;
  freeWinUsd: number;
  btc: number;
  usdt: number;
  xrp: number;
  bnb: number;
}

const VALIDATOR_SECRET =
  process.env.LEDGER_HMAC_SECRET || 'apex-tesla-server-hmac-2026-validation-key';

export function signValidationPayload(payload: Record<string, unknown>): string {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHmac('sha256', VALIDATOR_SECRET).update(canonical).digest('hex');
}

const depositRecordsByUser = new Map<string, ServerDepositRecord[]>();
const transactionAuditLog: ServerTransactionAudit[] = [];

const SEEDED_USER_INITIAL_DEPOSITS: Record<string, number> = {
  'usr-alex-001': 12450.0,
  'usr-apex-001': 12450.0,
  'usr-003': 4280.0,
  'usr-004': 9850.0,
  'usr-005': 1820.0,
  'usr-006': 24500.0,
  'usr-007': 15400.0,
  'usr-008': 7600.0,
  'usr-009': 2940.0,
  'usr-010': 31200.0,
};

export function seedInitialDepositRecords(
  existingWallets: Map<string, ServerWalletLedger>
): void {
  for (const [uid, baseUsd] of Object.entries(SEEDED_USER_INITIAL_DEPOSITS)) {
    if (!depositRecordsByUser.has(uid) || depositRecordsByUser.get(uid)!.length === 0) {
      const createdAt = '2026-10-01T00:00:00.000Z';
      const txHash = `0xseed${crypto
        .createHash('sha256')
        .update(`seed-vault-${uid}`)
        .digest('hex')
        .slice(0, 28)}`;
      const record: ServerDepositRecord = {
        id: `dep-seed-${uid}`,
        userId: uid,
        currency: 'USD',
        amount: baseUsd,
        usdEquivalent: baseUsd,
        remainingUsd: baseUsd,
        txHash,
        gatewayName: 'Apex Verified Custody Vault',
        source: 'seed_vault',
        status: 'verified',
        createdAt,
        signature: signValidationPayload({
          id: `dep-seed-${uid}`,
          userId: uid,
          usdEquivalent: baseUsd,
          txHash,
          source: 'seed_vault',
        }),
      };
      depositRecordsByUser.set(uid, [record]);
    }
    const existing = existingWallets.get(uid);
    if (!existing) {
      existingWallets.set(uid, {
        usd: baseUsd,
        depositUsd: baseUsd,
        freeWinUsd: 0,
        btc: 0.45,
        usdt: 14200.0,
        xrp: 4200.0,
        bnb: 18.5,
      });
    }
  }
}

export function getUserDepositRecords(userId: string): ServerDepositRecord[] {
  return depositRecordsByUser.get(userId) || [];
}

export function getVerifiedDepositBalance(userId: string): number {
  const records = depositRecordsByUser.get(userId) || [];
  const total = records.reduce((sum, rec) => {
    if (rec.status !== 'verified') return sum;
    return sum + Math.max(0, Number(rec.remainingUsd) || 0);
  }, 0);
  return Number(total.toFixed(2));
}

export function reconcileWalletFromDepositRecords(
  userId: string,
  walletsMap: Map<string, ServerWalletLedger>
): ServerWalletLedger {
  let wallet = walletsMap.get(userId);
  const verifiedDepositUsd = getVerifiedDepositBalance(userId);
  if (!wallet) {
    // Unknown users strictly start at $0.00 unless backed by verified deposit records!
    wallet = {
      usd: verifiedDepositUsd,
      depositUsd: verifiedDepositUsd,
      freeWinUsd: 0,
      btc: 0,
      usdt: 0,
      xrp: 0,
      bnb: 0,
    };
    walletsMap.set(userId, wallet);
    return wallet;
  }
  const safeFreeWin = Number(Math.max(0, Number(wallet.freeWinUsd) || 0).toFixed(2));
  wallet.freeWinUsd = safeFreeWin;
  wallet.depositUsd = verifiedDepositUsd;
  wallet.usd = Number((verifiedDepositUsd + safeFreeWin).toFixed(2));
  return wallet;
}

function appendAudit(entry: Omit<ServerTransactionAudit, 'id' | 'createdAt' | 'signature'>): ServerTransactionAudit {
  const id = `audit-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
  const createdAt = new Date().toISOString();
  const full: ServerTransactionAudit = {
    ...entry,
    id,
    createdAt,
    signature: signValidationPayload({
      id,
      userId: entry.userId,
      category: entry.category,
      amountUsd: entry.amountUsd,
      outcome: entry.outcome,
      verifiedDepositBeforeUsd: entry.verifiedDepositBeforeUsd,
      verifiedDepositAfterUsd: entry.verifiedDepositAfterUsd,
      createdAt,
    }),
  };
  transactionAuditLog.unshift(full);
  if (transactionAuditLog.length > 300) {
    transactionAuditLog.length = 300;
  }
  return full;
}

export function registerVerifiedDepositRecord(params: {
  userId: string;
  currency: string;
  amount: number;
  usdEquivalent: number;
  txHash?: string;
  gatewayName?: string;
  source?: DepositRecordSource;
  walletsMap: Map<string, ServerWalletLedger>;
}): {
  ok: boolean;
  duplicate?: boolean;
  statusCode: number;
  error?: string;
  record?: ServerDepositRecord;
  wallet: ServerWalletLedger;
  audit?: ServerTransactionAudit;
} {
  const {
    userId,
    currency = 'USD',
    amount,
    usdEquivalent,
    gatewayName = 'Apex Verified Gateway',
    source = 'gateway_deposit',
    walletsMap,
  } = params;

  const walletBefore = reconcileWalletFromDepositRecords(userId, walletsMap);
  const cleanUsd = Number(Number(usdEquivalent).toFixed(2));
  const cleanAmt = Number(Number(amount).toFixed(6));

  if (!userId || !Number.isFinite(cleanUsd) || cleanUsd <= 0 || cleanUsd > 50000000) {
    return {
      ok: false,
      statusCode: 400,
      error: 'Deposit amount must be positive and within platform custody limits.',
      wallet: walletBefore,
    };
  }

  const normalizedHash =
    typeof params.txHash === 'string' && params.txHash.trim().length >= 6
      ? params.txHash.trim()
      : `0xdep${Date.now().toString(16)}${crypto.randomBytes(6).toString('hex')}`;

  const existing = depositRecordsByUser.get(userId) || [];
  if (existing.some((r) => r.txHash === normalizedHash && r.status === 'verified')) {
    return {
      ok: false,
      duplicate: true,
      statusCode: 409,
      error: `Duplicate deposit transaction reference detected (${normalizedHash}).`,
      wallet: walletBefore,
    };
  }

  const recId = `dep-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
  const createdAt = new Date().toISOString();
  const record: ServerDepositRecord = {
    id: recId,
    userId,
    currency: String(currency).toUpperCase(),
    amount: Number.isFinite(cleanAmt) && cleanAmt > 0 ? cleanAmt : cleanUsd,
    usdEquivalent: cleanUsd,
    remainingUsd: cleanUsd,
    txHash: normalizedHash,
    gatewayName: String(gatewayName).slice(0, 120),
    source,
    status: 'verified',
    createdAt,
    signature: signValidationPayload({
      id: recId,
      userId,
      usdEquivalent: cleanUsd,
      txHash: normalizedHash,
      source,
      createdAt,
    }),
  };

  depositRecordsByUser.set(userId, [record, ...existing]);
  const walletAfter = reconcileWalletFromDepositRecords(userId, walletsMap);

  const audit = appendAudit({
    userId,
    category: 'deposit_record',
    amountUsd: cleanUsd,
    depositConsumedUsd: 0,
    freeWinConsumedUsd: 0,
    depositRecordIdsUsed: [recId],
    verifiedDepositBeforeUsd: walletBefore.depositUsd,
    verifiedDepositAfterUsd: walletAfter.depositUsd,
    freeWinBeforeUsd: walletBefore.freeWinUsd,
    freeWinAfterUsd: walletAfter.freeWinUsd,
    outcome: 'approved',
    reason: `Verified deposit record (${source}) via ${record.gatewayName}`,
  });

  return {
    ok: true,
    statusCode: 200,
    record,
    wallet: walletAfter,
    audit,
  };
}

export function creditVerifiedFreeWinBalance(
  userId: string,
  amountUsd: number,
  walletsMap: Map<string, ServerWalletLedger>
): ServerWalletLedger {
  const wallet = reconcileWalletFromDepositRecords(userId, walletsMap);
  const add = Number(Math.max(0, Number(amountUsd) || 0).toFixed(4));
  wallet.freeWinUsd = Number((wallet.freeWinUsd + add).toFixed(2));
  wallet.usd = Number((wallet.depositUsd + wallet.freeWinUsd).toFixed(2));
  return wallet;
}

export function validateAndConsumePayment(params: {
  userId: string;
  category: Exclude<ValidatedTxCategory, 'deposit_record' | 'security_rejection'>;
  totalCostUsd: number;
  expectedMinimumUsd?: number;
  requireDepositOnly?: boolean;
  clientClaimedDepositUsd?: number;
  clientClaimedWalletUsd?: number;
  notes?: string;
  walletsMap: Map<string, ServerWalletLedger>;
}): {
  ok: boolean;
  statusCode: number;
  code?: string;
  error?: string;
  wallet: ServerWalletLedger;
  audit: ServerTransactionAudit;
} {
  const {
    userId,
    category,
    totalCostUsd,
    expectedMinimumUsd,
    requireDepositOnly = false,
    clientClaimedDepositUsd,
    clientClaimedWalletUsd,
    notes,
    walletsMap,
  } = params;

  const wallet = reconcileWalletFromDepositRecords(userId, walletsMap);
  const depBefore = wallet.depositUsd;
  const freeBefore = wallet.freeWinUsd;

  if (!Number.isFinite(totalCostUsd) || totalCostUsd <= 0) {
    const audit = appendAudit({
      userId,
      category: 'security_rejection',
      amountUsd: Number(totalCostUsd) || 0,
      depositConsumedUsd: 0,
      freeWinConsumedUsd: 0,
      depositRecordIdsUsed: [],
      verifiedDepositBeforeUsd: depBefore,
      verifiedDepositAfterUsd: depBefore,
      freeWinBeforeUsd: freeBefore,
      freeWinAfterUsd: freeBefore,
      outcome: 'rejected',
      rejectionCode: 'INVALID_TRANSACTION_AMOUNT',
      reason: 'Transaction amount must be greater than $0.',
      clientClaimedDepositUsd,
      clientClaimedWalletUsd,
    });
    return {
      ok: false,
      statusCode: 400,
      code: 'INVALID_TRANSACTION_AMOUNT',
      error: 'Invalid transaction amount.',
      wallet,
      audit,
    };
  }

  const cleanCost = Number(totalCostUsd.toFixed(2));

  // Prevent cost/fee underpayment tampering against server catalog/prize fees
  if (typeof expectedMinimumUsd === 'number' && cleanCost + 0.01 < expectedMinimumUsd) {
    const audit = appendAudit({
      userId,
      category: 'security_rejection',
      amountUsd: cleanCost,
      depositConsumedUsd: 0,
      freeWinConsumedUsd: 0,
      depositRecordIdsUsed: [],
      verifiedDepositBeforeUsd: depBefore,
      verifiedDepositAfterUsd: depBefore,
      freeWinBeforeUsd: freeBefore,
      freeWinAfterUsd: freeBefore,
      outcome: 'rejected',
      rejectionCode: 'FEE_AMOUNT_TAMPERED',
      reason: `Submitted payment $${cleanCost} is below authoritative server fee/cost $${expectedMinimumUsd.toFixed(2)}.`,
      clientClaimedDepositUsd,
      clientClaimedWalletUsd,
    });
    return {
      ok: false,
      statusCode: 400,
      code: 'FEE_AMOUNT_TAMPERED',
      error: `Payment verification failed: expected $${expectedMinimumUsd.toLocaleString()} USD minimum.`,
      wallet,
      audit,
    };
  }

  // Cross-check client-claimed balances against actual server deposit records & reconciled wallet
  const claimedDepMismatch =
    typeof clientClaimedDepositUsd === 'number' &&
    Number.isFinite(clientClaimedDepositUsd) &&
    clientClaimedDepositUsd > depBefore + 0.05;
  const claimedWalletMismatch =
    typeof clientClaimedWalletUsd === 'number' &&
    Number.isFinite(clientClaimedWalletUsd) &&
    clientClaimedWalletUsd > wallet.usd + 0.05;

  if (claimedDepMismatch || claimedWalletMismatch) {
    const audit = appendAudit({
      userId,
      category: 'security_rejection',
      amountUsd: cleanCost,
      depositConsumedUsd: 0,
      freeWinConsumedUsd: 0,
      depositRecordIdsUsed: [],
      verifiedDepositBeforeUsd: depBefore,
      verifiedDepositAfterUsd: depBefore,
      freeWinBeforeUsd: freeBefore,
      freeWinAfterUsd: freeBefore,
      outcome: 'rejected',
      rejectionCode: 'BALANCE_MANIPULATION_DETECTED',
      reason: `Client claimed deposit=$${clientClaimedDepositUsd ?? 'n/a'} wallet=$${clientClaimedWalletUsd ?? 'n/a'}, but verified server ledger is deposit=$${depBefore} wallet=$${wallet.usd}.`,
      clientClaimedDepositUsd,
      clientClaimedWalletUsd,
    });
    return {
      ok: false,
      statusCode: 403,
      code: 'BALANCE_MANIPULATION_DETECTED',
      error: `Security validation failed: claimed balance could not be reconciled against verified deposit records (verified deposits: $${depBefore.toLocaleString()}, verified vault: $${wallet.usd.toLocaleString()}).`,
      wallet,
      audit,
    };
  }

  if (requireDepositOnly) {
    if (depBefore + 0.001 < cleanCost) {
      const audit = appendAudit({
        userId,
        category,
        amountUsd: cleanCost,
        depositConsumedUsd: 0,
        freeWinConsumedUsd: 0,
        depositRecordIdsUsed: [],
        verifiedDepositBeforeUsd: depBefore,
        verifiedDepositAfterUsd: depBefore,
        freeWinBeforeUsd: freeBefore,
        freeWinAfterUsd: freeBefore,
        outcome: 'rejected',
        rejectionCode: 'DEPOSIT_REQUIRED_FOR_VEHICLE_FEES',
        reason: `Verified deposit balance $${depBefore.toFixed(2)} is below required $${cleanCost.toFixed(2)} (free win balance $${freeBefore.toFixed(2)} excluded).`,
      });
      return {
        ok: false,
        statusCode: 400,
        code: 'DEPOSIT_REQUIRED_FOR_VEHICLE_FEES',
        error: `Deposit-only fee rule: $${cleanCost.toLocaleString()} required from verified wallet deposit records. Verified unspent deposits: $${depBefore.toLocaleString()} (free promotional/win credits of $${freeBefore.toLocaleString()} cannot be used for vehicle processing, documentation, or shipping fees).`,
        wallet,
        audit,
      };
    }

    // Consume FIFO from verified deposit records only
    const usedIds: string[] = [];
    let toConsume = cleanCost;
    const records = depositRecordsByUser.get(userId) || [];
    // Oldest verified deposits first
    const ordered = [...records].reverse();
    for (const rec of ordered) {
      if (toConsume <= 0) break;
      if (rec.status !== 'verified' || rec.remainingUsd <= 0) continue;
      const take = Math.min(rec.remainingUsd, toConsume);
      rec.remainingUsd = Number((rec.remainingUsd - take).toFixed(2));
      toConsume = Number((toConsume - take).toFixed(2));
      usedIds.push(rec.id);
    }

    const updated = reconcileWalletFromDepositRecords(userId, walletsMap);
    const audit = appendAudit({
      userId,
      category,
      amountUsd: cleanCost,
      depositConsumedUsd: cleanCost,
      freeWinConsumedUsd: 0,
      depositRecordIdsUsed: usedIds,
      verifiedDepositBeforeUsd: depBefore,
      verifiedDepositAfterUsd: updated.depositUsd,
      freeWinBeforeUsd: freeBefore,
      freeWinAfterUsd: updated.freeWinUsd,
      outcome: 'approved',
      reason: notes || `Verified deposit-only payment cross-referenced against ${usedIds.length} deposit record(s).`,
    });

    return {
      ok: true,
      statusCode: 200,
      wallet: updated,
      audit,
    };
  }

  // General spend check: must be backed by (verifiedDepositUsd + verifiedFreeWinUsd)
  if (wallet.usd + 0.001 < cleanCost) {
    const audit = appendAudit({
      userId,
      category,
      amountUsd: cleanCost,
      depositConsumedUsd: 0,
      freeWinConsumedUsd: 0,
      depositRecordIdsUsed: [],
      verifiedDepositBeforeUsd: depBefore,
      verifiedDepositAfterUsd: depBefore,
      freeWinBeforeUsd: freeBefore,
      freeWinAfterUsd: freeBefore,
      outcome: 'rejected',
      rejectionCode: 'INSUFFICIENT_VERIFIED_FUNDS',
      reason: `Verified vault balance $${wallet.usd.toFixed(2)} (deposit $${depBefore.toFixed(2)} + win $${freeBefore.toFixed(2)}) is insufficient for $${cleanCost.toFixed(2)}.`,
    });
    return {
      ok: false,
      statusCode: 400,
      code: 'INSUFFICIENT_VERIFIED_FUNDS',
      error: `Insufficient verified wallet balance ($${wallet.usd.toLocaleString()}). $${cleanCost.toLocaleString()} USD required — please deposit verified funds.`,
      wallet,
      audit,
    };
  }

  // Spend freeWinUsd first to preserve depositUsd for vehicle shipping fees, then debit verified deposit records FIFO
  const freeToUse = Number(Math.min(wallet.freeWinUsd, cleanCost).toFixed(2));
  const depToUse = Number(Math.max(0, cleanCost - freeToUse).toFixed(2));
  const usedIds: string[] = [];

  if (depToUse > 0) {
    let rem = depToUse;
    const records = depositRecordsByUser.get(userId) || [];
    const ordered = [...records].reverse();
    for (const rec of ordered) {
      if (rem <= 0) break;
      if (rec.status !== 'verified' || rec.remainingUsd <= 0) continue;
      const take = Math.min(rec.remainingUsd, rem);
      rec.remainingUsd = Number((rec.remainingUsd - take).toFixed(2));
      rem = Number((rem - take).toFixed(2));
      usedIds.push(rec.id);
    }
  }

  wallet.freeWinUsd = Number(Math.max(0, wallet.freeWinUsd - freeToUse).toFixed(2));
  const updated = reconcileWalletFromDepositRecords(userId, walletsMap);

  const audit = appendAudit({
    userId,
    category,
    amountUsd: cleanCost,
    depositConsumedUsd: depToUse,
    freeWinConsumedUsd: freeToUse,
    depositRecordIdsUsed: usedIds,
    verifiedDepositBeforeUsd: depBefore,
    verifiedDepositAfterUsd: updated.depositUsd,
    freeWinBeforeUsd: freeBefore,
    freeWinAfterUsd: updated.freeWinUsd,
    outcome: 'approved',
    reason: notes || `Cross-referenced against deposit records ($${depToUse} deposit, $${freeToUse} verified free wins).`,
  });

  return {
    ok: true,
    statusCode: 200,
    wallet: updated,
    audit,
  };
}

export function deductDepositRecordsFifo(
  userId: string,
  amountUsd: number,
  walletsMap: Map<string, ServerWalletLedger>
): ServerWalletLedger {
  let rem = Math.max(0, Number(amountUsd) || 0);
  const records = depositRecordsByUser.get(userId) || [];
  const ordered = [...records].reverse();
  for (const rec of ordered) {
    if (rem <= 0) break;
    if (rec.status !== 'verified' || rec.remainingUsd <= 0) continue;
    const take = Math.min(rec.remainingUsd, rem);
    rec.remainingUsd = Number((rec.remainingUsd - take).toFixed(2));
    rem = Number((rem - take).toFixed(2));
  }
  return reconcileWalletFromDepositRecords(userId, walletsMap);
}

export function getTransactionAudits(userId?: string): ServerTransactionAudit[] {
  if (userId) {
    return transactionAuditLog.filter((a) => a.userId === userId);
  }
  return [...transactionAuditLog];
}

export function exportValidatorState(): {
  depositRecords: Record<string, ServerDepositRecord[]>;
  transactionAudits: ServerTransactionAudit[];
} {
  const depositRecords: Record<string, ServerDepositRecord[]> = {};
  for (const [uid, recs] of depositRecordsByUser.entries()) {
    depositRecords[uid] = recs;
  }
  return {
    depositRecords,
    transactionAudits: transactionAuditLog.slice(0, 200),
  };
}

export function hydrateValidatorState(raw: {
  depositRecords?: Record<string, ServerDepositRecord[]>;
  transactionAudits?: ServerTransactionAudit[];
}): void {
  if (raw.depositRecords && typeof raw.depositRecords === 'object') {
    for (const [uid, recs] of Object.entries(raw.depositRecords)) {
      if (Array.isArray(recs)) {
        depositRecordsByUser.set(uid, recs);
      }
    }
  }
  if (Array.isArray(raw.transactionAudits)) {
    transactionAuditLog.splice(0, transactionAuditLog.length, ...raw.transactionAudits.slice(0, 200));
  }
}
