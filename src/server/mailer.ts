import nodemailer from 'nodemailer';

export interface RuntimeSmtpConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  username?: string;
  pass?: string;
  password?: string;
  from?: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
}

export interface EmailDispatchLog {
  id: string;
  type: 'registration_welcome' | 'deposit_confirmation' | 'maturity_settlement' | 'test_dispatch';
  recipient: string;
  subject: string;
  amountUsd: number;
  investmentId: string;
  certificateId: string;
  dispatchedAt: string;
  status: 'delivered' | 'simulated' | 'failed';
  host?: string;
  detail?: string;
}

let runtimeSmtpOverride: RuntimeSmtpConfig = {};
const dispatchedEmailLogs: EmailDispatchLog[] = [];

function recordLog(entry: EmailDispatchLog) {
  dispatchedEmailLogs.unshift(entry);
  if (dispatchedEmailLogs.length > 200) {
    dispatchedEmailLogs.length = 200;
  }
}

export function setRuntimeSmtpConfig(config: RuntimeSmtpConfig) {
  runtimeSmtpOverride = { ...runtimeSmtpOverride, ...config };
}

export function getResolvedSmtpSettings(explicitOverride?: RuntimeSmtpConfig) {
  const host = (
    explicitOverride?.host ||
    runtimeSmtpOverride.host ||
    process.env.SMTP_HOST ||
    ''
  ).trim();

  const port = Number(
    explicitOverride?.port ||
      runtimeSmtpOverride.port ||
      process.env.SMTP_PORT ||
      587
  );

  const secureRaw =
    explicitOverride?.secure ??
    runtimeSmtpOverride.secure ??
    (process.env.SMTP_SECURE === 'true' || port === 465);
  const secure = Boolean(secureRaw);

  const user = (
    explicitOverride?.username ||
    explicitOverride?.user ||
    runtimeSmtpOverride.username ||
    runtimeSmtpOverride.user ||
    process.env.SMTP_USER ||
    ''
  ).trim();

  const passCandidate = (
    explicitOverride?.password ||
    explicitOverride?.pass ||
    runtimeSmtpOverride.password ||
    runtimeSmtpOverride.pass ||
    process.env.SMTP_PASS ||
    ''
  ).trim();

  const pass = passCandidate && !passCandidate.includes('•••') ? passCandidate : (process.env.SMTP_PASS || '').trim();

  const envFrom = (process.env.SMTP_FROM || '').trim();
  const fromName = (
    explicitOverride?.fromName ||
    runtimeSmtpOverride.fromName ||
    'Apex Tesla Hub Concierge'
  ).trim();
  const fromEmail = (
    explicitOverride?.fromEmail ||
    runtimeSmtpOverride.fromEmail ||
    (envFrom.includes('<') ? envFrom.match(/<([^>]+)>/)?.[1] : envFrom) ||
    user ||
    'concierge@apex-tesla.io'
  ).trim();

  const fromHeader = envFrom.includes('<') ? envFrom : `"${fromName}" <${fromEmail}>`;

  return {
    host,
    port,
    secure,
    user,
    pass,
    fromName,
    fromEmail,
    fromHeader,
    replyTo: explicitOverride?.replyTo || runtimeSmtpOverride.replyTo || fromEmail,
    hasLiveCredentials: Boolean(host && user && pass),
  };
}

export function getEffectiveSmtpSummary() {
  const s = getResolvedSmtpSettings();
  return {
    configured: s.hasLiveCredentials,
    host: s.host || 'unconfigured (local simulation fallback)',
    port: s.port,
    secure: s.secure,
    user: s.user || '',
    fromEmail: s.fromEmail,
    fromName: s.fromName,
    envConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
  };
}

export function getDispatchedEmailLogs(): EmailDispatchLog[] {
  return [...dispatchedEmailLogs];
}

export async function sendSmtpNotification(options: {
  type: EmailDispatchLog['type'];
  to: string;
  subject: string;
  text: string;
  html: string;
  amountUsd?: number;
  investmentId?: string;
  certificateId?: string;
  smtpOverride?: RuntimeSmtpConfig;
}): Promise<{
  success: boolean;
  status: 'delivered' | 'simulated' | 'failed';
  messageId: string;
  host: string;
  detail: string;
  logEntry: EmailDispatchLog;
}> {
  const smtp = getResolvedSmtpSettings(options.smtpOverride);
  const nowIso = new Date().toISOString();
  const baseId = `mail-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  if (smtp.hasLiveCredentials) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: { user: smtp.user, pass: smtp.pass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
      });

      const info = await transporter.sendMail({
        from: smtp.fromHeader,
        replyTo: smtp.replyTo,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      const logEntry: EmailDispatchLog = {
        id: baseId,
        type: options.type,
        recipient: options.to,
        subject: options.subject,
        amountUsd: options.amountUsd || 0,
        investmentId: options.investmentId || 'N/A',
        certificateId: options.certificateId || `REF-${Date.now()}`,
        dispatchedAt: nowIso,
        status: 'delivered',
        host: smtp.host,
        detail: `SMTP 250 OK • MessageID: ${info.messageId}`,
      };
      recordLog(logEntry);

      return {
        success: true,
        status: 'delivered',
        messageId: info.messageId || baseId,
        host: smtp.host,
        detail: logEntry.detail || 'Delivered via live SMTP',
        logEntry,
      };
    } catch (err: any) {
      const errMsg = err?.message || 'SMTP relay error';
      console.warn(`[Mailer] Live SMTP send failed (${smtp.host}:${smtp.port}): ${errMsg}`);
      const logEntry: EmailDispatchLog = {
        id: baseId,
        type: options.type,
        recipient: options.to,
        subject: options.subject,
        amountUsd: options.amountUsd || 0,
        investmentId: options.investmentId || 'N/A',
        certificateId: options.certificateId || `SIM-${Date.now()}`,
        dispatchedAt: nowIso,
        status: 'simulated',
        host: smtp.host,
        detail: `SMTP fallback logged (${errMsg})`,
      };
      recordLog(logEntry);

      return {
        success: true,
        status: 'simulated',
        messageId: baseId,
        host: smtp.host,
        detail: logEntry.detail || 'Simulated fallback logged',
        logEntry,
      };
    }
  }

  // Graceful simulated delivery when .env SMTP_PASS is unset
  const logEntry: EmailDispatchLog = {
    id: baseId,
    type: options.type,
    recipient: options.to,
    subject: options.subject,
    amountUsd: options.amountUsd || 0,
    investmentId: options.investmentId || 'N/A',
    certificateId: options.certificateId || `LOG-${Date.now()}`,
    dispatchedAt: nowIso,
    status: 'simulated',
    host: smtp.host || 'local-mailer-queue',
    detail: 'Queued & logged via .env SMTP pipeline (configure SMTP_HOST/USER/PASS in .env for external relay delivery)',
  };
  recordLog(logEntry);

  return {
    success: true,
    status: 'simulated',
    messageId: `<sim-${Date.now()}@apex-tesla.io>`,
    host: logEntry.host || 'local-mailer-queue',
    detail: logEntry.detail || 'Simulated queue',
    logEntry,
  };
}

export async function sendRegistrationNotificationEmail(params: {
  email: string;
  name: string;
  tier?: string;
  location?: string;
  referralCode?: string;
  provider?: 'email' | 'google';
}) {
  const subject = `Welcome to Apex Tesla Hub, ${params.name} — Account Activated`;
  const text = [
    `Hello ${params.name},`,
    '',
    `Your Apex Tesla Hub member account (${params.email}) has been successfully created via ${params.provider === 'google' ? 'Google OAuth' : 'Email Registration'}.`,
    `Membership Tier: ${params.tier || 'Standard'}`,
    `Home Region: ${params.location || 'United States'}`,
    `Personal Referral Code: ${params.referralCode || 'N/A'}`,
    '',
    'You can now access your Member Dashboard, book Tesla service & wraps, enter Wheel & Scratch promotions, and manage your fleet vault.',
    '',
    'Apex Tesla Hub Concierge Desk',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #f4f4f5; padding: 28px; border-radius: 16px; border: 1px solid #dc2626;">
      <div style="border-bottom: 1px solid #27272a; padding-bottom: 14px; margin-bottom: 18px;">
        <span style="color: #ef4444; font-weight: bold; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase;">Apex Tesla Hub • Account Security</span>
        <h2 style="margin: 6px 0 0; color: #ffffff; font-size: 20px;">Welcome Aboard, ${params.name}</h2>
      </div>
      <p style="font-size: 14px; color: #d4d4d8; line-height: 1.6;">
        Your member profile <strong>${params.email}</strong> is now verified and active. Sign in anytime to access your member dashboard, book service bays, trade TSLA allocations, and claim promotions.
      </p>
      <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 14px; margin: 16px 0; font-family: monospace; font-size: 12px;">
        <div>Tier: <strong style="color: #10b981;">${params.tier || 'Standard'}</strong></div>
        <div>Region: <strong>${params.location || 'United States'}</strong></div>
        <div>Referral Code: <strong style="color: #f59e0b;">${params.referralCode || 'N/A'}</strong></div>
      </div>
      <p style="font-size: 11px; color: #71717a;">Automated alert dispatched via Apex Tesla Hub SMTP Notification Utility.</p>
    </div>
  `;

  return sendSmtpNotification({
    type: 'registration_welcome',
    to: params.email,
    subject,
    text,
    html,
    certificateId: `REG-${Date.now().toString().slice(-6)}`,
  });
}

export async function sendDepositNotificationEmail(params: {
  email: string;
  name?: string;
  currency: string;
  amount: number;
  usdEquivalent: number;
  txHash: string;
  newBalanceUsd?: number;
}) {
  const formattedUsd = `$${Number(params.usdEquivalent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const subject = `Deposit Confirmed: ${params.amount} ${params.currency} (${formattedUsd} USD) Credited`;
  const text = [
    `Hello ${params.name || 'Tesla Member'},`,
    '',
    `We have received and confirmed your vault deposit of ${params.amount} ${params.currency} (${formattedUsd} USD).`,
    `Transaction Reference / Hash: ${params.txHash}`,
    params.newBalanceUsd !== undefined ? `Updated Vault USD Balance: $${params.newBalanceUsd.toLocaleString()}` : '',
    '',
    'Your funds are immediately available for vehicle purchases, service scheduling, investments, wheel spins, and scratch cards.',
    '',
    'Apex Tesla Hub Treasury',
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #f4f4f5; padding: 28px; border-radius: 16px; border: 1px solid #10b981;">
      <div style="border-bottom: 1px solid #27272a; padding-bottom: 14px; margin-bottom: 18px;">
        <span style="color: #10b981; font-weight: bold; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase;">Apex Vault Treasury • Deposit Alert</span>
        <h2 style="margin: 6px 0 0; color: #ffffff; font-size: 20px;">Deposit Confirmed: ${formattedUsd}</h2>
      </div>
      <p style="font-size: 14px; color: #d4d4d8; line-height: 1.6;">
        Hello ${params.name || 'Member'}, your deposit into your Apex Tesla Hub vault has been settled on-ledger.
      </p>
      <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 14px; margin: 16px 0; font-family: monospace; font-size: 12px;">
        <div>Asset Credited: <strong style="color: #10b981;">${params.amount} ${params.currency}</strong></div>
        <div>USD Equivalent: <strong>${formattedUsd} USD</strong></div>
        <div>TX Reference: <strong style="color: #38bdf8;">${params.txHash}</strong></div>
        ${params.newBalanceUsd !== undefined ? `<div>New Vault USD Balance: <strong style="color: #ffffff;">$${params.newBalanceUsd.toLocaleString()}</strong></div>` : ''}
      </div>
      <p style="font-size: 11px; color: #71717a;">Automated treasury alert dispatched via Apex Tesla Hub SMTP Notification Utility.</p>
    </div>
  `;

  return sendSmtpNotification({
    type: 'deposit_confirmation',
    to: params.email,
    subject,
    text,
    html,
    amountUsd: params.usdEquivalent,
    certificateId: params.txHash,
  });
}

export async function sendMaturityNotificationEmail(params: {
  recipientEmail: string;
  recipientName: string;
  investmentId: string;
  poolTitle: string;
  principalUsd: number;
  yieldUsd: number;
  certificateId: string;
}) {
  const totalReturn = Number((params.principalUsd + params.yieldUsd).toFixed(2));
  const subject = `✅ Investment Matured: +$${totalReturn.toLocaleString()} Credited (Cert #${params.certificateId})`;
  const text = `Congratulations ${params.recipientName}! Your investment in "${params.poolTitle}" has matured. Principal $${params.principalUsd} + ROI $${params.yieldUsd.toFixed(2)} = $${totalReturn} credited to your wallet. Certificate ID: ${params.certificateId}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #f4f4f5; padding: 28px; border-radius: 16px; border: 1px solid #dc2626;">
      <h2 style="color: #ef4444; margin-top: 0;">⚡ Apex Tesla Hub — Investment Matured</h2>
      <p>Dear ${params.recipientName}, your stake in <strong>${params.poolTitle}</strong> has completed its lock period.</p>
      <div style="background: #18181b; padding: 14px; border-radius: 10px; font-family: monospace; font-size: 13px; color: #10b981;">
        PRINCIPAL: $${params.principalUsd.toLocaleString()}<br/>
        ROI YIELD: +$${params.yieldUsd.toFixed(2)}<br/>
        TOTAL CREDITED: $${totalReturn.toLocaleString()}<br/>
        CERTIFICATE: ${params.certificateId}
      </div>
    </div>
  `;

  return sendSmtpNotification({
    type: 'maturity_settlement',
    to: params.recipientEmail,
    subject,
    text,
    html,
    amountUsd: totalReturn,
    investmentId: params.investmentId,
    certificateId: params.certificateId,
  });
}
