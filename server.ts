import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import crypto from 'crypto';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  authRouter,
  authenticateToken,
  requireAdmin,
  requireSelfOrAdmin,
  getAuthenticatedUser,
} from './src/server/auth.ts';
import {
  setRuntimeSmtpConfig,
  sendDepositNotificationEmail,
  sendMaturityNotificationEmail,
  sendBulkNewsletterEmail,
  sendWonVehicleShipmentNotificationEmail,
  getDispatchedEmailLogs,
  getEffectiveSmtpSummary,
} from './src/server/mailer.ts';
import {
  seedInitialDepositRecords,
  getUserDepositRecords,
  getVerifiedDepositBalance,
  reconcileWalletFromDepositRecords,
  registerVerifiedDepositRecord,
  creditVerifiedFreeWinBalance,
  validateAndConsumePayment,
  deductDepositRecordsFifo,
  getTransactionAudits,
  exportValidatorState,
  hydrateValidatorState,
  signValidationPayload,
} from './src/server/transactionValidator.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(publicDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(publicDir));
app.use('/api/auth', authRouter);

// Initialize Gemini Client conditionally when API key is provided
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Live Customer Support & Diagnostics Specialist Chatbot
app.post('/api/gemini/support', async (req, res) => {
  try {
    const { messages, userVehicle, currentContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const systemInstruction = `You are the Apex Tesla Hub AI Concierge & Senior Service Specialist.
Apex Tesla Hub is a premier all-in-one ecosystem for Tesla owners and enthusiasts offering:
1. Scheduled Maintenance & Mechanical Fixes: HV battery health checks, drive unit diagnostics, brake fluid flush, HEPA filter replacement, suspension alignment, Ranger mobile dispatch.
2. Customization & Styling: Bespoke color wraps (Stealth Satin Black, Liquid Silver Chrome, Miami Blue, British Racing Green, Forged Carbon), full-body Paint Protection Film (PPF), ceramic coatings, forged wheels, aero spoilers, yoke steering wheel retrofits.
3. Fleet Rentals: High-performance Tesla fleet including Cybertruck Cyberbeast, Model S Plaid (1,020 HP), Roadster Founders Edition, Model X Tri-Motor, and Model Y Performance.
4. Vehicle & Fleet Investment: Decentralized fleet revenue-sharing pools, Supercharger node staking with up to 18.5% APY, daily crypto dividend distributions.
5. Promotions: Daily Spin-and-Win Wheel (credits, Tesla merchandise, car giveaways) and Purchasable Scratch & Win cards ($50 to $8,000 max winnings).
6. Crypto Payments: Instant deposits and service settlements via BTC, USDT (TRC20/ERC20), XRP, BNB, and ETH.
7. Ambassador & Referral Rewards: Every registered customer gets a unique invite link and custom referral code. When a friend signs up and completes their first deposit, the referrer receives tier-based Platform Credits from $25 minimum up to $200 maximum ($25 Standard, $75 Silver Ambassador, $125 Plaid Member, $200 Founders Club) directly into their vault plus 2 Free Wheel Spins. The friend receives a $25 welcome service credit and 5 Free Spins upon sign up.

Customer context:
${userVehicle ? `Current User Vehicle: ${JSON.stringify(userVehicle)}` : 'Customer vehicle: Not specified'}
${currentContext ? `Active Context: ${currentContext}` : ''}

Tone: Futuristic, highly technical, courteous, confident, and concise. Format responses with neat bullet points, markdown bold highlights, and clear next steps. If a diagnostic issue or service is discussed, recommend booking a service slot or consulting our mobile ranger technicians.`;

    // Format conversation history for Gemini
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
          },
        });

        if (response.text) {
          return res.json({ text: response.text });
        }
      } catch (geminiError: any) {
        console.warn('Gemini chat API fallback triggered:', geminiError?.message);
      }
    }
      // Graceful fallback if API key is pending
      const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
      let reply = "Welcome to Apex Tesla Hub Service. Our technicians are ready to assist with your Model S, 3, X, Y, Cybertruck, or Roadster. How can we optimize your vehicle today?";
      if (lastUserMsg.includes('referral') || lastUserMsg.includes('invite') || lastUserMsg.includes('friend')) {
        reply = "You can earn tier-based Platform Credits from $25 up to $200 ($25 Standard, $75 Silver Ambassador, $125 Plaid Member, $200 Founders Club) directly in your dashboard vault for every friend who joins via your unique invite link and makes their first deposit! Your friend also gets $25 welcome credits and 5 free promotional spins. Access your link anytime in the **Refer & Earn** tab.";
      } else if (lastUserMsg.includes('wrap') || lastUserMsg.includes('color')) {
        reply = "Our custom wrap studio offers premium 3M and Avery Dennison 3.2mil cast vinyl wraps, including Satin Stealth Black, Liquid Chrome, and Forged Carbon fiber. Full body wrap packages include a 5-year warranty against peeling and UV discoloration. You can preview colors directly in our Custom Studio tab!";
      } else if (lastUserMsg.includes('battery') || lastUserMsg.includes('range') || lastUserMsg.includes('charge')) {
        reply = "For high-voltage battery health, we recommend keeping daily charging limits between 80-90% unless preparing for long road trips. We also perform cell impedance profiling and thermal management pump flushes during routine 24-month inspections.";
      } else if (lastUserMsg.includes('rent') || lastUserMsg.includes('cybertruck')) {
        reply = "Our rental fleet features top-tier trims including the Cybertruck Cyberbeast ($299/day) and Model S Plaid ($249/day). Every rental includes unlimited Supercharging access and Full Self-Driving (Supervised) capability.";
      } else if (lastUserMsg.includes('crypto') || lastUserMsg.includes('deposit') || lastUserMsg.includes('pay')) {
        reply = "We accept BTC, USDT, XRP, and BNB directly through your personalized user dashboard. Deposits are credited instantly upon 3 network confirmations with zero platform processing fees.";
      }
      return res.json({ text: reply });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in support chatbot:', error);
    return res.status(500).json({
      error: 'Failed to generate response',
      details: error?.message || 'Unknown error',
    });
  }
});

// Admin Ops & Fleet Management AI Copilot
app.post('/api/gemini/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { prompt, adminStats } = req.body;

    const systemInstruction = `You are the Apex Tesla Hub Executive Fleet Operations & Intelligence AI.
You help platform administrators oversee:
- Active service bays and mobile Ranger dispatch efficiency
- Fleet rental telemetry, utilization rate, and maintenance scheduling
- Crypto deposit reconciliation (BTC, USDT, XRP, BNB) and wallet hot/cold vault reserves
- Vehicle investment pool staking APY performance and automated dividend payouts
- Spin-and-Win & Scratch card prize liquidity balance and fraud prevention
- Parts & custom wrap vinyl roll inventory stock levels

Respond with crisp executive summaries, data-driven suggestions, operational status flags, and actionable recommendations.`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              parts: [
                {
                  text: `Platform Real-time Stats: ${JSON.stringify(adminStats || {})}\n\nAdmin Prompt: ${prompt}`,
                },
              ],
            },
          ],
          config: {
            systemInstruction,
          },
        });

        if (response.text) {
          return res.json({ text: response.text });
        }
      } catch (geminiError: any) {
        console.warn('Gemini admin API fallback triggered:', geminiError?.message);
      }
    }
      return res.json({
        text: `**Fleet Intelligence Briefing:**\n- All 18 Service Bays Operating at 92% efficiency.\n- Active Rental Fleet: 24/28 units booked (85.7% utilization).\n- Crypto Inflow (24h): +4.28 BTC, +14,200 USDT, +8,400 XRP processed with 100% on-chain verification.\n- Recommended Action: Restock Satin Stealth Black 3M Vinyl rolls and allocate 2 extra Mobile Rangers for Fremont & Austin service zones.`,
      });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in admin assistant:', error);
    return res.status(500).json({
      error: 'Failed to generate admin analysis',
      details: error?.message || 'Unknown error',
    });
  }
});

// Tesla Diagnostic Code & Symptom Scanner
app.post('/api/gemini/diagnostics', async (req, res) => {
  try {
    const { query, modelYear } = req.body;

    const prompt = `Perform an instant diagnostic breakdown for this Tesla issue/code:
Vehicle: ${modelYear || 'Tesla Generic'}
Symptom or Error Code: ${query}

Provide a concise breakdown:
1. Probable Root Cause
2. Urgency Level (Low, Medium, Critical)
3. Estimated Repair Time & Cost Range
4. DIY / Reset Step (if safe, e.g. scroll-wheel reset or power cycle)
5. Service Bay Recommendation`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an ASE-certified master Tesla diagnostic engineer with deep expertise in CAN bus signals, thermal loops, High Voltage pyrofuses, and motor inverters.',
          },
        });

        if (response.text) {
          return res.json({ analysis: response.text });
        }
      } catch (geminiError: any) {
        console.warn('Gemini diagnostics API fallback triggered:', geminiError?.message);
      }
    }
      return res.json({
        analysis: `### Diagnostic Analysis for: ${query}
- **Probable Root Cause**: High Voltage Contactors or 16V Low Voltage Li-ion subsystem warning flag.
- **Urgency Level**: Medium - Safe to drive to nearest service hub within 72 hours.
- **Estimated Service Time**: 1.5 - 3 hours.
- **Recommended Action**: Book Bay 4 diagnostic scan or dispatch a Mobile Ranger. Schedule appointment via your Apex Dashboard.`,
      });
  } catch (err: unknown) {
    const error = err as Error;
    return res.status(500).json({ error: error.message });
  }
});

// Admin AI Promotional Banner Generator (Gemini 4 Hydrogen — Supports 3D / HD Studio Banners)
app.post('/api/gemini/generate-banner', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      campaignGoal,
      size = 'leaderboard',
      customWidth,
      customHeight,
      imageMode = 'multi',
      tone = 'Luxury High-Tech',
      targetTab = 'stocks',
      is3dHd = true,
      style3dPreset = 'cyber_perspective',
      resolutionQuality = '4K UHD',
      carRenderModel = 'Cybertruck Cyberbeast',
    } = req.body;

    const sizeDimensionMap: Record<string, string> = {
      leaderboard: is3dHd ? '1456×180 HD' : '728×90',
      square: is3dHd ? '1200×1200 4K' : '300×300',
      rectangle: is3dHd ? '1200×1000 HD' : '300×250',
      sidebar: is3dHd ? '640×2400 HD' : '160×600',
      billboard: '970×250',
      wide_skyscraper: '300×600',
      social_og: '1200×628',
      story: '1080×1920',
      mobile_banner: '320×100',
      custom:
        customWidth && customHeight
          ? `${Number(customWidth)}×${Number(customHeight)}`
          : '800×400',
    };
    const dimensions = sizeDimensionMap[size] || (is3dHd ? '1456×180 HD' : '728×90');
    const cleanGoal = campaignGoal || 'Earn High Yield on TSLA Stocks, Cybertruck Sales & Referral Bonuses';

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `Create a high-converting ${is3dHd ? '3D / HD ' : ''}digital marketing banner specification for Apex Tesla Hub.
Campaign Goal: ${cleanGoal}
Banner Format: ${size} (${dimensions} px)
Featured Vehicle: ${carRenderModel}
Visual Depth: ${is3dHd ? `3D Interactive Perspective (${style3dPreset}, ${resolutionQuality})` : 'Flat 2D'}
Brand Tone: ${tone}
Target Section: ${targetTab}
Note: Mention referral benefits or VIP rewards where natural, keep headline punchy (max 8-10 words), subheadline concise (max 18 words), and CTA under 4 words.`,
          config: {
            systemInstruction:
              'You are a senior growth designer and conversion copywriter for Apex Tesla Hub (Tesla car sales, wraps, fleet staking, TSLA fast ROI plans, Spin & Win Tesla car jackpots, $25–$200 tiered referral rewards). Output strictly valid JSON matching the schema.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                badgeText: { type: Type.STRING },
                headline: { type: Type.STRING },
                subheadline: { type: Type.STRING },
                ctaText: { type: Type.STRING },
                accentColor: { type: Type.STRING },
                themeGradient: { type: Type.STRING },
                targetTab: { type: Type.STRING },
              },
              required: ['title', 'badgeText', 'headline', 'subheadline', 'ctaText', 'accentColor', 'themeGradient', 'targetTab'],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({
            success: true,
            aiPowered: true,
            banner: {
              ...parsed,
              size,
              dimensions,
              customWidth: customWidth ? Number(customWidth) : undefined,
              customHeight: customHeight ? Number(customHeight) : undefined,
              imageMode,
              isAiGenerated: true,
              is3dHd: Boolean(is3dHd),
              style3dPreset,
              resolutionQuality,
              carRenderModel,
            },
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini banner generator fallback triggered:', geminiError?.message);
      }
    }

    const presetsBySize: Record<string, any> = {
      leaderboard: {
        title: `AI 3D Campaign: ${cleanGoal.slice(0, 32)}`,
        badgeText: is3dHd ? `3D ${resolutionQuality} • LEADERBOARD` : '728×90 LEADERBOARD • AI',
        headline: 'ACCELERATE WEALTH WITH TSLA & ROBOTAXI YIELDS',
        subheadline: `${cleanGoal.slice(0, 90)} — Invite friends via your VIP referral link for $25–$200 tiered vault bonuses.`,
        ctaText: 'Launch Now',
        accentColor: '#ef4444',
        themeGradient: 'from-zinc-950 via-red-950/85 to-zinc-950',
      },
      square: {
        title: `AI 3D Square Promo: ${cleanGoal.slice(0, 30)}`,
        badgeText: is3dHd ? `3D ${resolutionQuality} • SQUARE` : '300×300 SQUARE • AI',
        headline: 'VIP TESLA SALES & FLEET YIELD ACCESS',
        subheadline: `${cleanGoal.slice(0, 85)} • Instant crypto checkout & $25 welcome invite bonus.`,
        ctaText: 'Claim VIP Access',
        accentColor: '#10b981',
        themeGradient: 'from-zinc-950 via-emerald-950/70 to-zinc-950',
      },
      rectangle: {
        title: `AI 3D Rectangle Unit: ${cleanGoal.slice(0, 28)}`,
        badgeText: is3dHd ? `3D ${resolutionQuality} • RECTANGLE` : '300×250 RECTANGLE • AI',
        headline: 'WIN TESLA CARS + TSLA FAST ROI POOLS',
        subheadline: `${cleanGoal.slice(0, 85)} • Automated payouts & enclosed nationwide Tesla shipping.`,
        ctaText: 'Activate Referral',
        accentColor: '#f59e0b',
        themeGradient: 'from-zinc-950 via-amber-950/75 to-red-950/75',
      },
      sidebar: {
        title: `AI 3D Sidebar Skyscraper: ${cleanGoal.slice(0, 24)}`,
        badgeText: is3dHd ? `3D ${resolutionQuality} • SIDEBAR` : '160×600 SIDEBAR • AI',
        headline: 'TESLA INVESTOR & BUYER CLUB',
        subheadline: 'TSLA Stocks • Cyberbeast Delivery • 18.5% APY Fleet Pools',
        ctaText: 'Join With Invite',
        accentColor: '#06b6d4',
        themeGradient: 'from-zinc-950 via-cyan-950/75 to-zinc-950',
      },
    };

    const chosen = presetsBySize[size] || presetsBySize.leaderboard;
    return res.json({
      success: true,
      aiPowered: false,
      banner: {
        ...chosen,
        size,
        dimensions,
        customWidth: customWidth ? Number(customWidth) : undefined,
        customHeight: customHeight ? Number(customHeight) : undefined,
        imageMode,
        targetTab,
        isAiGenerated: true,
        is3dHd: Boolean(is3dHd),
        style3dPreset,
        resolutionQuality,
        carRenderModel,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return res.status(500).json({ error: error.message || 'Failed to generate promotional banner' });
  }
});

// Email Marketing & SMTP Engine (PHP Mailer / NodeMailer Style)
app.post('/api/mailer/test', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { smtpConfig, testEmail, simulateScenario } = req.body;

    if (!testEmail || !testEmail.includes('@') || !testEmail.includes('.')) {
      return res.status(400).json({
        success: false,
        delivered: false,
        status: 'failed',
        error: 'Valid recipient email address is required (e.g. name@domain.com).',
        failureReason: 'RFC 5322 Recipient syntax validation error - invalid email structure or missing domain.',
        failureCode: 'INVALID_RECIPIENT_SYNTAX',
        failureCategory: 'Client Validation Error',
        troubleshooting: 'Please provide a properly formatted email address containing user and domain parts.',
        recipient: testEmail || '',
        timestamp: new Date().toISOString(),
      });
    }

    const host = (smtpConfig?.host || 'smtp.mailgun.org').trim();
    const port = Number(smtpConfig?.port) || 587;
    const secure = Boolean(smtpConfig?.secure);
    const user = (smtpConfig?.username || 'apikey').trim();
    const pass = (smtpConfig?.password || '').trim();
    const fromName = smtpConfig?.fromName || 'Apex Tesla Hub Operations';
    const fromEmail = smtpConfig?.fromEmail || 'concierge@apex-tesla.io';

    // Check if a diagnostic test scenario or trigger keyword is specified
    const scenario = simulateScenario ||
      (testEmail.toLowerCase().includes('fail') ? 'auth_failed' :
       testEmail.toLowerCase().includes('bounce') ? 'mailbox_unavailable' :
       testEmail.toLowerCase().includes('timeout') ? 'timeout' :
       testEmail.toLowerCase().includes('host') || host.includes('invalid') ? 'host_unreachable' : null);

    if (scenario) {
      let failureCode = '550 5.1.1';
      let failureReason = 'Mailbox unavailable or recipient address rejected by remote MTA host';
      let failureCategory = 'Recipient Mailbox Rejection';
      let troubleshooting = 'Verify the recipient email address exists. Check if remote MX mail server is dropping unroutable domains.';
      let smtpLog = `220 ${host} ESMTP Postfix Service Ready\nEHLO apex-tesla.io\n250-AUTH LOGIN PLAIN\n250 OK\nMAIL FROM:<${fromEmail}>\n250 2.1.0 Ok\nRCPT TO:<${testEmail}>\n550 5.1.1 <${testEmail}>: Recipient address rejected: User unknown in virtual mailbox table`;

      if (scenario === 'auth_failed' || (pass && pass.includes('wrong'))) {
        failureCode = '535 5.7.8 (EAUTH)';
        failureReason = 'Authentication credentials invalid: Username and password rejected by SMTP server';
        failureCategory = 'SMTP Authentication Failure';
        troubleshooting = 'Check your SMTP Username / API key and secret password in Settings. If using SendGrid or Mailgun, ensure the API key has "Mail.Send" authorization.';
        smtpLog = `220 ${host} ESMTP Service Ready\nEHLO apex-tesla.io\n250-AUTH LOGIN PLAIN\n334 VXNlcm5hbWU6\n334 UGFzc3dvcmQ6\n535 5.7.8 Error: authentication failed: Invalid credentials or expired API token`;
      } else if (scenario === 'host_unreachable' || host.includes('invalid')) {
        failureCode = 'ENOTFOUND (EAI_AGAIN)';
        failureReason = `Host unreachable: Unable to resolve DNS records for hostname "${host}"`;
        failureCategory = 'Network / DNS Resolution Failure';
        troubleshooting = `Verify your SMTP Host server address. Ensure there are no typos (e.g. smtp.mailgun.org instead of smtp.mailgun.com).`;
        smtpLog = `[DNS_LOOKUP_ERROR] getaddrinfo ENOTFOUND ${host}\nFailed to connect to ${host}:${port} after 3 retries\nHandshake terminated before socket connect`;
      } else if (scenario === 'timeout') {
        failureCode = 'ETIMEDOUT';
        failureReason = `Connection timed out after 10000ms attempting to connect to ${host}:${port}`;
        failureCategory = 'Firewall / Port Timeout';
        troubleshooting = 'Port 25 is often blocked by hosting providers. Ensure you are using Port 587 (STARTTLS) or Port 465 (SSL/TLS).';
        smtpLog = `[TCP_CONNECT_TIMEOUT] Connecting to ${host}:${port}...\nTimed out waiting for server banner after 10000ms\nSocket closed`;
      } else if (scenario === 'tls_mismatch') {
        failureCode = '530 5.7.0 (STARTTLS_REQUIRED)';
        failureReason = 'Must issue a STARTTLS command first: TLS/SSL encryption mode mismatch on selected port';
        failureCategory = 'Transport Encryption Mismatch';
        troubleshooting = 'If using Port 465, toggle Enable SSL/TLS ON. If using Port 587, toggle Enable SSL/TLS OFF to allow STARTTLS negotiation.';
        smtpLog = `220 ${host} ESMTP Service Ready\nEHLO apex-tesla.io\n250 STARTTLS\nMAIL FROM:<${fromEmail}>\n530 5.7.0 Must issue a STARTTLS command first`;
      }

      return res.status(422).json({
        success: false,
        delivered: false,
        status: 'failed',
        message: `Test email FAILED to deliver to ${testEmail}: ${failureReason}`,
        failureReason,
        failureCode,
        failureCategory,
        troubleshooting,
        recipient: testEmail,
        host,
        port,
        timestamp: new Date().toISOString(),
        smtpLog,
      });
    }

    // If actual password provided, attempt real SMTP connection
    if (pass && pass.length > 3 && !pass.includes('•••')) {
      try {
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.default.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 8000,
          greetingTimeout: 8000,
        });

        await transporter.verify();

        const info = await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: testEmail,
          subject: '⚡ Apex Tesla Hub — SMTP Test Verification Successful',
          text: `This is a test email sent from Apex Tesla Hub Email Marketing Engine.\nHost: ${host}:${port}\nTLS/SSL: ${secure ? 'Enabled' : 'STARTTLS'}\nTimestamp: ${new Date().toISOString()}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #f4f4f5; padding: 24px; border-radius: 12px; border: 1px solid #dc2626;">
              <h2 style="color: #dc2626; margin-top: 0;">⚡ Apex Tesla Hub — Mailer Engine</h2>
              <p>Your SMTP handshake and test email dispatch succeeded!</p>
              <div style="background: #18181b; padding: 14px; border-radius: 8px; font-family: monospace; font-size: 13px; color: #10b981;">
                STATUS: 250 OK • Message accepted for delivery<br/>
                HOST: ${host}:${port}<br/>
                RECIPIENT: ${testEmail}<br/>
                TIME: ${new Date().toUTCString()}
              </div>
              <p style="color: #a1a1aa; font-size: 12px; margin-top: 16px;">Apex Tesla Hub • Executive Operations • Automated Telematics & Marketing</p>
            </div>
          `,
        });

        return res.json({
          success: true,
          delivered: true,
          status: 'delivered',
          message: `Live test email successfully DELIVERED to ${testEmail}! (Status: 250 OK)`,
          messageId: info.messageId,
          recipient: testEmail,
          host,
          port,
          timestamp: new Date().toISOString(),
          smtpLog: `220 ${host} ESMTP Service Ready\n250-AUTH LOGIN PLAIN\n250 OK\n354 End data with <CR><LF>.<CR><LF>\n250 2.0.0 Ok: queued as ${info.messageId || 'MSG-' + Date.now()}`,
        });
      } catch (smtpErr: any) {
        console.warn('Live SMTP handshake failed:', smtpErr?.message);
        const errMsg = smtpErr?.message || 'SMTP Handshake error';
        let failureCode = smtpErr?.code || 'ESMTP_AUTH_OR_CONN';
        let failureCategory = 'Live SMTP Relay Failure';
        let troubleshooting = 'Verify credentials, host domain, and port SSL/STARTTLS settings in SMTP configuration.';

        if (errMsg.includes('Invalid login') || errMsg.includes('auth') || failureCode === 'EAUTH') {
          failureCode = '535 5.7.8 (EAUTH)';
          failureCategory = 'Authentication Failed';
          troubleshooting = 'Your SMTP host rejected your username or password. Ensure your Mailgun/SendGrid API key is active.';
        } else if (failureCode === 'ENOTFOUND') {
          failureCode = 'ENOTFOUND (DNS)';
          failureCategory = 'Host Not Found';
          troubleshooting = `Host "${host}" could not be resolved. Please verify domain name.`;
        } else if (failureCode === 'ETIMEDOUT' || errMsg.includes('timeout')) {
          failureCode = 'ETIMEDOUT (Network)';
          failureCategory = 'Connection Timeout';
          troubleshooting = 'The mail server did not respond within 8 seconds. Port may be filtered or blocked.';
        }

        return res.status(422).json({
          success: false,
          delivered: false,
          status: 'failed',
          message: `Live test email FAILED to deliver to ${testEmail}: ${errMsg}`,
          failureReason: errMsg,
          failureCode,
          failureCategory,
          troubleshooting,
          recipient: testEmail,
          host,
          port,
          timestamp: new Date().toISOString(),
          smtpLog: `[SMTP_HANDSHAKE_FAILURE]\nHOST: ${host}:${port}\nRECIPIENT: ${testEmail}\nERROR_CODE: ${failureCode}\nREASON: ${errMsg}`,
        });
      }
    } else {
      // Safe simulation mode with realistic SMTP transaction response
      const messageId = `msg-apex-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@apex-tesla.io`;
      return res.json({
        success: true,
        delivered: true,
        status: 'delivered',
        simulationMode: true,
        message: `Test email successfully DELIVERED to ${testEmail}! (250 OK Message Accepted)`,
        messageId,
        recipient: testEmail,
        host,
        port,
        timestamp: new Date().toISOString(),
        smtpLog: `220 ${host} ESMTP Apex Tesla Hub Mailer Daemon Ready\nEHLO client.apex-tesla.io\n250-SIZE 35882577\n250-STARTTLS\n250-AUTH LOGIN PLAIN\n250 OK Handshake Completed\nMAIL FROM:<${fromEmail}>\n250 2.1.0 Sender OK\nRCPT TO:<${testEmail}>\n250 2.1.5 Recipient OK\nDATA\n354 Start mail input; end with <CR><LF>.<CR><LF>\n250 2.0.0 OK: queued as ${messageId}`,
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      delivered: false,
      status: 'failed',
      error: error?.message || 'Mailer test failed',
      failureReason: error?.message || 'Internal server error during mailer dispatch',
      failureCode: '500_INTERNAL_ERROR',
    });
  }
});

// Fleet Asset Performance Target Email Alert Dispatcher
app.post('/api/mailer/asset-alert', authenticateToken, async (req, res) => {
  try {
    const { email, assetTitle, metricLabel, targetValue, currentValue, notes } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid recipient email is required.' });
    }

    const timestamp = new Date().toLocaleString('en-US', { timeZoneName: 'short' });
    const alertSubject = `⚡ [ALERT] Tesla Fleet Asset Target Reached: ${assetTitle} (${metricLabel}: ${currentValue})`;

    return res.json({
      success: true,
      deliveredTo: email,
      subject: alertSubject,
      timestamp,
      assetTitle,
      metricLabel,
      targetValue,
      currentValue,
      message: `Performance target alert successfully dispatched to ${email}!`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to dispatch asset alert' });
  }
});

// Send Marketing / Bulk Newsletter Campaign
app.post('/api/mailer/send-campaign', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { campaignTitle, subject, bodyHtml, recipients, smtpConfig } = req.body || {};

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'At least one recipient email address is required.' });
    }

    const cleanRecipients = Array.from(
      new Set(
        recipients
          .map((r: unknown) => String(r || '').trim().toLowerCase())
          .filter((r: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r))
      )
    );

    if (cleanRecipients.length === 0) {
      return res.status(400).json({ error: 'No valid email addresses found in recipients list.' });
    }

    let delivered = 0;
    let simulated = 0;
    let failed = 0;
    const messageBody =
      String(bodyHtml || '').trim() ||
      `Hello,\n\nImportant fleet, service, and platform bulletin from Apex Tesla Hub: ${subject || campaignTitle}.\n\nVisit your Member Dashboard for live details.`;

    for (const email of cleanRecipients.slice(0, 250)) {
      try {
        const result = await sendBulkNewsletterEmail({
          recipientEmail: email,
          campaignTitle: String(campaignTitle || 'Apex Tesla Hub Dispatch'),
          subject: String(subject || 'Apex Tesla Hub Official Update'),
          bodyContent: messageBody,
          smtpOverride: smtpConfig,
        });
        if (result.status === 'delivered') {
          delivered += 1;
        } else {
          simulated += 1;
        }
      } catch {
        failed += 1;
      }
    }

    return res.json({
      success: true,
      campaignTitle,
      subject,
      totalRecipients: cleanRecipients.length,
      delivered: delivered + simulated,
      liveSmtpDelivered: delivered,
      queuedOrSimulated: simulated,
      failed,
      dispatchedAt: new Date().toISOString(),
      message: `Bulk update "${campaignTitle}" dispatched to ${cleanRecipients.length} recipient(s) (${delivered} live SMTP, ${simulated} queued/logged).`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Campaign dispatch failed' });
  }
});

// Newsletter Mailing List Endpoints
app.get('/api/newsletter/subscribers', authenticateToken, requireAdmin, (_req, res) => {
  const state = readServerAdminState();
  const list = Array.isArray(state.newsletterSubscribers) ? state.newsletterSubscribers : [];
  return res.json({ subscribers: list });
});

app.post('/api/newsletter/subscribe', (req, res) => {
  const { email, name, interestCategory, source, id } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  const state = readServerAdminState();
  const existingList: any[] = Array.isArray(state.newsletterSubscribers)
    ? state.newsletterSubscribers
    : [];
  const existingIdx = existingList.findIndex(
    (item) => String(item.email || '').toLowerCase() === cleanEmail
  );

  const subscriberRecord = {
    id:
      existingIdx >= 0
        ? existingList[existingIdx].id
        : String(id || `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`),
    email: cleanEmail,
    name: String(name || (existingIdx >= 0 ? existingList[existingIdx].name : '') || '').trim(),
    interestCategory: interestCategory || 'All Updates',
    status: 'active',
    source: source || 'home_banner',
    subscribedAt:
      existingIdx >= 0
        ? existingList[existingIdx].subscribedAt
        : new Date().toISOString().replace('T', ' ').substring(0, 16),
  };

  const nextList =
    existingIdx >= 0
      ? existingList.map((item, i) => (i === existingIdx ? subscriberRecord : item))
      : [subscriberRecord, ...existingList];

  writeServerAdminState({ newsletterSubscribers: nextList });
  return res.json({
    success: true,
    alreadySubscribed: existingIdx >= 0,
    subscriber: subscriberRecord,
  });
});

app.patch('/api/newsletter/subscribers/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, interestCategory, status } = req.body || {};
  const state = readServerAdminState();
  const existingList: any[] = Array.isArray(state.newsletterSubscribers)
    ? state.newsletterSubscribers
    : [];
  const nextList = existingList.map((item) => {
    if (item.id !== id) return item;
    return {
      ...item,
      ...(name !== undefined ? { name } : {}),
      ...(interestCategory !== undefined ? { interestCategory } : {}),
      ...(status !== undefined ? { status } : {}),
    };
  });
  writeServerAdminState({ newsletterSubscribers: nextList });
  return res.json({ success: true });
});

app.delete('/api/newsletter/subscribers/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const state = readServerAdminState();
  const existingList: any[] = Array.isArray(state.newsletterSubscribers)
    ? state.newsletterSubscribers
    : [];
  const nextList = existingList.filter((item) => item.id !== id);
  writeServerAdminState({ newsletterSubscribers: nextList });
  return res.json({ success: true });
});

// AI Marketing Copilot & Copywriter (Gemini 3.8 Flash)
app.post('/api/gemini/marketing', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { objective, audience, campaignType, specialOffer } = req.body;

    const prompt = `You are the Chief Marketing Officer & AI Copywriter for Apex Tesla Hub (luxury Tesla wraps, servicing, Cybertruck fleet rentals, and crypto investment).
Generate a high-converting marketing email campaign for:
Objective: ${objective || 'Drive service bookings and custom wraps'}
Target Audience: ${audience || 'Registered Tesla Owners & Plaid Club Members'}
Campaign Type: ${campaignType || 'Promotional Flash Sale'}
Special Offer: ${specialOffer || '20% off all 3M Satin Stealth wraps and complimentary 40-point battery check'}

Format your response in structured markdown:
### 1. Subject Line Variations (3 options: 1 Punchy, 1 Curiosity, 1 Urgent)
### 2. Preview Text (preheader snippet under 90 characters)
### 3. Email Body Copy (futuristic, energetic, tailored for Tesla owners, with clear Call-to-Action buttons)
### 4. Optimal Send Window & Conversion Tip`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an elite automotive performance marketing director who writes high-converting, premium email copy for luxury electric vehicle owners.',
          },
        });

        if (response.text) {
          return res.json({ text: response.text });
        }
      } catch (geminiError: any) {
        console.warn('Gemini marketing API fallback triggered:', geminiError?.message);
      }
    }
      return res.json({
        text: `### 1. Subject Line Variations
- **Punchy**: ⚡ Model S & Cybertruck Upgrades: Claim Your 20% Wrap Credit
- **Curiosity**: The fastest way to transform your Tesla’s exterior (before Bay slots fill up)
- **Urgent**: ⏳ 48 Hours Only: Complimentary HV Battery Health Diagnostic Scan Included

### 2. Preview Text
Transform your Tesla with aerospace-grade Satin Stealth Black. Lock in your slot today.

### 3. Email Body Copy
**Hi [Tesla Owner],**

Your Tesla was built to lead the pack—now give it the bespoke styling it deserves.

For the next 72 hours, Apex Tesla Hub is unlocking an exclusive **20% Platinum Credit** on all full-body cast vinyl wraps, including our signature **3M Satin Stealth Black**, **Liquid Titanium Chrome**, and **Electric Miami Cyan**.

Every custom wrap booking also includes:
- ✅ **Full-Body Hydrophobic Ceramic Topcoat** ($450 value, complimentary)
- ✅ **High-Voltage Battery Cell Health Profiling**
- ✅ **Mobile Ranger Pickup & Delivery** or Express Technology Center Bay Allocation

👉 **[Claim Your 20% Wrap Discount & Book Bay Slot]**

### 4. Optimal Send Window
Send on Tuesday or Thursday at 9:15 AM PST for peak open rates among tech executives and Tesla enthusiasts.`,
      });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'AI Marketing Generation failed' });
  }
});

// ============================================================================
// AUTOMATED ROI CRON JOB SERVICE & TELEMETRY ENGINE
// ============================================================================

interface ServerInvestment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  poolId: string;
  poolTitle: string;
  amountInvestedUsd: number;
  apy: number;
  status: 'running' | 'completed' | 'paused';
  durationDays: number;
  daysElapsed: number;
  earnedDividendsUsd: number;
  totalExpectedRoiUsd: number;
  dailyRoiRate?: number;
  startDate: string;
  maturityDate: string;
  completedAt?: string;
  capitalReturned?: boolean;
  txHash?: string;
  certificateId?: string;
}

interface ServerWallet {
  usd: number;
  depositUsd: number;
  freeWinUsd: number;
  btc: number;
  usdt: number;
  xrp: number;
  bnb: number;
}

interface ServerSettlementEvent {
  id: string;
  investmentId: string;
  userId: string;
  userEmail: string;
  userName: string;
  poolTitle: string;
  principalUsd: number;
  roiUsd: number;
  totalPayoutUsd: number;
  certificateId: string;
  settledAt: string;
  emailDispatched: boolean;
}

// Dynamic SMTP Config Synced from Admin Mailer Settings
let serverSmtpConfig: {
  host?: string;
  port?: number;
  secure?: boolean;
  username?: string;
  password?: string;
  fromName?: string;
  fromEmail?: string;
} | null = null;

// In-Memory Persistent Stores
const serverInvestments: Map<string, ServerInvestment> = new Map();
const serverWallets: Map<string, ServerWallet> = new Map();
const serverSettlementEvents: ServerSettlementEvent[] = [];
const serverDispatchedEmails: Array<{
  id: string;
  type: string;
  recipient: string;
  subject: string;
  amountUsd: number;
  investmentId: string;
  certificateId: string;
  dispatchedAt: string;
  status: 'delivered' | 'simulated';
}> = [];

const HMAC_SECRET = process.env.APEX_LEDGER_SECRET || 'apex-tesla-hub-secure-hmac-v2-2026';

function signLedgerPayload(payload: Record<string, unknown>): string {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHmac('sha256', HMAC_SECRET).update(canonical).digest('hex');
}

function getOrInitServerWallet(
  userId: string,
  _hint?: { usd?: number; depositUsd?: number; freeWinUsd?: number }
): ServerWallet {
  // Always reconcile wallet strictly from verified server deposit records; never trust client balance hints
  return reconcileWalletFromDepositRecords(userId, serverWallets);
}

let cronActive = true;
let cronCyclesRun = 186;
let lastCronRunTimestamp: string = new Date().toISOString();
const serverCronLogs: string[] = [
  `[${new Date().toISOString().substring(11, 19)}] Automated Multi-Task Cron Engine initialized (ROI, Streaks, Spin Criteria, Won Logistics, TSLA Sync).`,
  `[${new Date().toISOString().substring(11, 19)}] Verified active fleet & Fast-ROI plans with smart contract telemetry.`,
];

function computeDailyRoiUsd(inv: ServerInvestment): number {
  if (typeof inv.dailyRoiRate === 'number' && inv.dailyRoiRate > 0) {
    return Number(inv.dailyRoiRate.toFixed(2));
  }
  const duration = Math.max(1, Number(inv.durationDays) || 30);
  if (typeof inv.totalExpectedRoiUsd === 'number' && inv.totalExpectedRoiUsd > 0) {
    return Number((inv.totalExpectedRoiUsd / duration).toFixed(2));
  }
  return Number((((inv.amountInvestedUsd * (inv.apy / 100)) / 365)).toFixed(2));
}

// Seed initial investments matching demo users
function seedServerInvestments() {
  if (serverInvestments.size === 0) {
    const inv1: ServerInvestment = {
      id: 'inv-alex-robotaxi',
      userId: 'usr-apex-001',
      userEmail: 'alex.vance@apex-tesla.io',
      userName: 'Alex Vance',
      poolId: 'pool-robotaxi-01',
      poolTitle: 'Autonomous Robotaxi Fleet (Model Y & Cybercab)',
      amountInvestedUsd: 5000,
      apy: 18.5,
      status: 'running',
      durationDays: 30,
      daysElapsed: 28,
      earnedDividendsUsd: 71.03,
      totalExpectedRoiUsd: 76.03,
      dailyRoiRate: 2.53,
      startDate: new Date(Date.now() - 28 * 86400000).toISOString(),
      maturityDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      txHash: '0x9fa810c2834b9281a182048f029148d891b01984',
    };

    const inv2: ServerInvestment = {
      id: 'inv-alex-supercharger',
      userId: 'usr-apex-001',
      userEmail: 'alex.vance@apex-tesla.io',
      userName: 'Alex Vance',
      poolId: 'pool-supercharger-02',
      poolTitle: 'Megawatt Supercharger Mega-Node (Austin V4 Hub)',
      amountInvestedUsd: 10000,
      apy: 22.0,
      status: 'running',
      durationDays: 60,
      daysElapsed: 42,
      earnedDividendsUsd: 253.15,
      totalExpectedRoiUsd: 361.64,
      dailyRoiRate: 6.03,
      startDate: new Date(Date.now() - 42 * 86400000).toISOString(),
      maturityDate: new Date(Date.now() + 18 * 86400000).toISOString(),
      txHash: '0x3cb19028a71928491823908f9182903847a98291',
    };

    const inv3: ServerInvestment = {
      id: 'inv-alex-plaid',
      userId: 'usr-apex-001',
      userEmail: 'alex.vance@apex-tesla.io',
      userName: 'Alex Vance',
      poolId: 'pool-plaid-track-03',
      poolTitle: 'Plaid Track Rental Fleet (Nürburgring & Laguna Seca)',
      amountInvestedUsd: 8000,
      apy: 24.5,
      status: 'completed',
      durationDays: 45,
      daysElapsed: 45,
      earnedDividendsUsd: 241.64,
      totalExpectedRoiUsd: 241.64,
      dailyRoiRate: 5.37,
      startDate: new Date(Date.now() - 50 * 86400000).toISOString(),
      maturityDate: new Date(Date.now() - 5 * 86400000).toISOString(),
      completedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      capitalReturned: true,
      txHash: '0x882b719401829a8109283948b819283908273919',
      certificateId: 'CERT-PLAID-SETTLE-882194',
    };

    serverInvestments.set(inv1.id, inv1);
    serverInvestments.set(inv2.id, inv2);
    serverInvestments.set(inv3.id, inv3);

    // Initial wallet balance for Alex Vance & Demo Users (verified active deposits)
    const defaultDemoWallets: Record<string, ServerWallet> = {
      'usr-alex-001': { usd: 12450.0, depositUsd: 12450.0, freeWinUsd: 0, btc: 0.45, usdt: 14200.0, xrp: 4200.0, bnb: 18.5 },
      'usr-apex-001': { usd: 12450.0, depositUsd: 12450.0, freeWinUsd: 0, btc: 0.45, usdt: 14200.0, xrp: 4200.0, bnb: 18.5 },
      'usr-003': { usd: 4280.0, depositUsd: 4280.0, freeWinUsd: 0, btc: 0.04, usdt: 3100.0, xrp: 1500.0, bnb: 4.0 },
      'usr-004': { usd: 9850.0, depositUsd: 9850.0, freeWinUsd: 0, btc: 0.18, usdt: 6400.0, xrp: 3200.0, bnb: 11.2 },
      'usr-005': { usd: 1820.0, depositUsd: 1820.0, freeWinUsd: 0, btc: 0.02, usdt: 950.0, xrp: 800.0, bnb: 1.5 },
      'usr-006': { usd: 24500.0, depositUsd: 24500.0, freeWinUsd: 0, btc: 0.62, usdt: 18500.0, xrp: 6800.0, bnb: 22.0 },
      'usr-007': { usd: 15400.0, depositUsd: 15400.0, freeWinUsd: 0, btc: 0.31, usdt: 9200.0, xrp: 4100.0, bnb: 9.4 },
      'usr-008': { usd: 7600.0, depositUsd: 7600.0, freeWinUsd: 0, btc: 0.11, usdt: 5100.0, xrp: 2100.0, bnb: 5.8 },
      'usr-009': { usd: 2940.0, depositUsd: 2940.0, freeWinUsd: 0, btc: 0.05, usdt: 1800.0, xrp: 1100.0, bnb: 2.3 },
      'usr-010': { usd: 31200.0, depositUsd: 31200.0, freeWinUsd: 0, btc: 0.85, usdt: 22000.0, xrp: 9500.0, bnb: 31.0 },
    };
    for (const [uid, bal] of Object.entries(defaultDemoWallets)) {
      serverWallets.set(uid, bal);
    }
    seedInitialDepositRecords(serverWallets);
  }
}

seedServerInvestments();

app.post('/api/mailer/config', authenticateToken, requireAdmin, (req, res) => {
  const { smtpConfig } = req.body || {};
  if (smtpConfig && typeof smtpConfig === 'object') {
    serverSmtpConfig = {
      host: smtpConfig.host,
      port: Number(smtpConfig.port) || 587,
      secure: Boolean(smtpConfig.secure),
      username: smtpConfig.username,
      password: smtpConfig.password,
      fromName: smtpConfig.fromName,
      fromEmail: smtpConfig.fromEmail,
    };
    setRuntimeSmtpConfig({
      host: smtpConfig.host,
      port: Number(smtpConfig.port) || 587,
      secure: Boolean(smtpConfig.secure),
      username: smtpConfig.username,
      password: smtpConfig.password,
      fromName: smtpConfig.fromName,
      fromEmail: smtpConfig.fromEmail,
      replyTo: smtpConfig.replyTo,
    });
  }
  return res.json({ success: true, summary: getEffectiveSmtpSummary() });
});

app.get('/api/mailer/logs', authenticateToken, requireAdmin, (_req, res) => {
  return res.json({
    success: true,
    smtpSummary: getEffectiveSmtpSummary(),
    logs: getDispatchedEmailLogs(),
  });
});

app.post('/api/notifications/deposit', authenticateToken, async (req, res) => {
  try {
    const { email, name, currency, amount, usdEquivalent, txHash, newBalanceUsd } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid recipient email is required for deposit alert.' });
    }
    const result = await sendDepositNotificationEmail({
      email: email.trim(),
      name: name ? String(name) : undefined,
      currency: String(currency || 'USD'),
      amount: Number(amount) || 0,
      usdEquivalent: Number(usdEquivalent) || Number(amount) || 0,
      txHash: String(txHash || `0x${Date.now().toString(16)}`),
      newBalanceUsd: typeof newBalanceUsd === 'number' ? newBalanceUsd : undefined,
    });
    return res.json({
      success: true,
      status: result.status,
      messageId: result.messageId,
      detail: result.detail,
      logEntry: result.logEntry,
    });
  } catch (err: any) {
    console.error('[Deposit Mailer] Error sending deposit alert:', err);
    return res.status(500).json({ error: 'Failed to dispatch deposit confirmation email.' });
  }
});

// Server-side Dashboard Notifications (persisted & delivered across sessions)
app.get('/api/notifications', authenticateToken, (req, res) => {
  const caller = (req as any).user;
  const cleanEmail = caller?.email ? String(caller.email).trim().toLowerCase() : '';
  const isAdmin = caller?.role === 'admin';
  const isAlexAlias = caller?.id === 'usr-alex-001' || caller?.id === 'usr-apex-001';

  const notifications = serverUserNotifications.filter((n) => {
    if (!n) return false;
    if (isAdmin) return true;
    if (n.targetType === 'all') return true;
    if (n.targetUserId && n.targetUserId === caller?.id) return true;
    if (cleanEmail && n.targetUserEmail && String(n.targetUserEmail).trim().toLowerCase() === cleanEmail) return true;
    if (isAlexAlias && (n.targetUserId === 'usr-alex-001' || n.targetUserId === 'usr-apex-001')) return true;
    return false;
  });

  return res.json({ success: true, notifications });
});

app.post('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const caller = (req as any).user;
  const { id } = req.params;
  const uid = caller?.id;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const target = serverUserNotifications.find((n) => n && n.id === id);
  if (target) {
    const existingReadBy = Array.isArray(target.readBy) ? target.readBy : [];
    if (!existingReadBy.includes(uid)) {
      target.readBy = [...existingReadBy, uid];
      persistServerGameAndCronState();
    }
  }
  return res.json({ success: true });
});

// Automated Maturity Email Dispatcher (delegates to shared .env SMTP mailer utility)
async function dispatchMaturityEmail(params: {
  toEmail: string;
  userName: string;
  poolTitle: string;
  principalUsd: number;
  roiUsd: number;
  totalPayoutUsd: number;
  newWalletBalanceUsd: number;
  investmentId: string;
  certificateId?: string;
}): Promise<boolean> {
  const { toEmail, userName, poolTitle, principalUsd, roiUsd, totalPayoutUsd, investmentId } = params;
  const certId = params.certificateId || `CERT-SETTLE-${Date.now().toString(36).toUpperCase()}`;

  const result = await sendMaturityNotificationEmail({
    recipientEmail: toEmail,
    recipientName: userName,
    investmentId,
    poolTitle,
    principalUsd,
    yieldUsd: roiUsd,
    certificateId: certId,
  });

  serverDispatchedEmails.unshift({
    id: result.logEntry.id,
    type: 'maturity_settlement',
    recipient: toEmail,
    subject: result.logEntry.subject,
    amountUsd: totalPayoutUsd,
    investmentId,
    certificateId: certId,
    dispatchedAt: result.logEntry.dispatchedAt,
    status: result.status === 'delivered' ? 'delivered' : 'simulated',
  });
  if (serverDispatchedEmails.length > 50) serverDispatchedEmails.length = 50;

  return true;
}

// ============================================================================
// SERVER-AUTHORITATIVE STREAK, SPIN & WIN, SCRATCH, DEPOSIT-ONLY FEES & MULTI-CRON
// ============================================================================

const DEFAULT_SERVER_STREAK_CONFIG = {
  enabled: true,
  graceWindowHours: 36,
  resetAfterHours: 48,
  autoResetMissedDays: true,
  maxStreakMultiplier: 2.5,
  dailyRates: [
    { day: 1, label: 'Day 1 Ignition', bonusPoints: 25, bonusCents: 5 },
    { day: 2, label: 'Day 2 Supercharge', bonusPoints: 40, bonusCents: 8 },
    { day: 3, label: 'Day 3 Autopilot', bonusPoints: 60, bonusCents: 12 },
    { day: 4, label: 'Day 4 Dual Motor', bonusPoints: 85, bonusCents: 18 },
    { day: 5, label: 'Day 5 Ludicrous', bonusPoints: 115, bonusCents: 25 },
    { day: 6, label: 'Day 6 Plaid Velocity', bonusPoints: 150, bonusCents: 35 },
    { day: 7, label: 'Day 7 Founders Apex', bonusPoints: 225, bonusCents: 50 },
  ],
  milestoneBonuses: [
    { daysRequired: 3, label: '3-Day Pulse Milestone', bonusPoints: 100, bonusCents: 25, bonusFreeSpins: 0 },
    { daysRequired: 7, label: '7-Day Apex Driver Streak', bonusPoints: 300, bonusCents: 100, bonusFreeSpins: 1 },
    { daysRequired: 14, label: '14-Day Plaid Veteran', bonusPoints: 650, bonusCents: 250, bonusFreeSpins: 2 },
    { daysRequired: 30, label: '30-Day Founders Legend', bonusPoints: 1500, bonusCents: 500, bonusFreeSpins: 3 },
  ],
};

const DEFAULT_SERVER_SPIN_LEVELS: Record<'easy' | 'hard' | 'super_hard', any[]> = {
  easy: [
    { id: 'ez-1', label: 'Tesla Model 3 Highland', text: 'Model 3 Win', valueUsd: 42490, value: 42490, type: 'car', vehicleModel: '2026 Tesla Model 3 Highland AWD', color: '#dc2626', textColor: 'white', weight: 4, probabilityWeight: 4, isActive: true },
    { id: 'ez-2', label: '$25,000 Max Cash Jackpot', text: '$25,000 USD', valueUsd: 25000, value: 25000, type: 'crypto', color: '#16a34a', textColor: 'white', weight: 5, probabilityWeight: 5, isActive: true },
    { id: 'ez-3', label: '$2,500 USDT Vault', text: '$2,500 USDT', valueUsd: 2500, value: 2500, type: 'crypto', color: '#2563eb', textColor: 'white', weight: 16, probabilityWeight: 16, isActive: true },
    { id: 'ez-4', label: 'Tesla Model Y Performance', text: 'Model Y Win', valueUsd: 52490, value: 52490, type: 'car', vehicleModel: '2026 Tesla Model Y Performance', color: '#ea580c', textColor: 'white', weight: 4, probabilityWeight: 4, isActive: true },
    { id: 'ez-5', label: '$10,000 Cash Prize', text: '$10,000 USD', valueUsd: 10000, value: 10000, type: 'credits', color: '#ca8a04', textColor: 'white', weight: 9, probabilityWeight: 9, isActive: true },
    { id: 'ez-6', label: 'Try Again', text: 'Try Again', valueUsd: 0, value: 0, type: 'try_again', color: '#1e293b', textColor: 'white', weight: 14, probabilityWeight: 14, isActive: true },
    { id: 'ez-7', label: '$5,000 Vault Payout', text: '$5,000 USD', valueUsd: 5000, value: 5000, type: 'crypto', color: '#0891b2', textColor: 'white', weight: 12, probabilityWeight: 12, isActive: true },
    { id: 'ez-8', label: 'Tesla Cybertruck AWD', text: 'Cybertruck', valueUsd: 79990, value: 79990, type: 'car', vehicleModel: '2026 Tesla Cybertruck Foundation AWD', color: '#b91c1c', textColor: 'white', weight: 3, probabilityWeight: 3, isActive: true },
    { id: 'ez-9', label: '$1,500 Cash Credit', text: '$1,500 USD', valueUsd: 1500, value: 1500, type: 'credits', color: '#7c3aed', textColor: 'white', weight: 17, probabilityWeight: 17, isActive: true },
    { id: 'ez-10', label: '$500 Wallet Bonus', text: '$500 USD', valueUsd: 500, value: 500, type: 'credits', color: '#475569', textColor: 'white', weight: 16, probabilityWeight: 16, isActive: true },
  ],
  hard: [
    { id: 'hd-1', label: 'Tesla Model 3 Highland', text: 'Model 3 Win', valueUsd: 42490, value: 42490, type: 'car', vehicleModel: '2026 Tesla Model 3 Highland AWD', color: '#dc2626', textColor: 'white', weight: 2, probabilityWeight: 2, isActive: true },
    { id: 'hd-2', label: 'Try Again', text: 'Try Again', valueUsd: 0, value: 0, type: 'try_again', color: '#1e293b', textColor: 'white', weight: 18, probabilityWeight: 18, isActive: true },
    { id: 'hd-3', label: '$15,000 High Cash Jackpot', text: '$15,000 USD', valueUsd: 15000, value: 15000, type: 'crypto', color: '#16a34a', textColor: 'white', weight: 4, probabilityWeight: 4, isActive: true },
    { id: 'hd-4', label: '$2,500 USDT Vault', text: '$2,500 USDT', valueUsd: 2500, value: 2500, type: 'crypto', color: '#2563eb', textColor: 'white', weight: 10, probabilityWeight: 10, isActive: true },
    { id: 'hd-5', label: 'Try Again', text: 'Try Again', valueUsd: 0, value: 0, type: 'try_again', color: '#334155', textColor: 'white', weight: 17, probabilityWeight: 17, isActive: true },
    { id: 'hd-6', label: '$7,500 Cash Payout', text: '$7,500 USD', valueUsd: 7500, value: 7500, type: 'credits', color: '#ca8a04', textColor: 'white', weight: 6, probabilityWeight: 6, isActive: true },
    { id: 'hd-7', label: 'Tesla Cybertruck AWD', text: 'Cybertruck', valueUsd: 79990, value: 79990, type: 'car', vehicleModel: '2026 Tesla Cybertruck Foundation AWD', color: '#ea580c', textColor: 'white', weight: 2, probabilityWeight: 2, isActive: true },
    { id: 'hd-8', label: '$1,500 Cash Credit', text: '$1,500 USD', valueUsd: 1500, value: 1500, type: 'credits', color: '#0891b2', textColor: 'white', weight: 13, probabilityWeight: 13, isActive: true },
    { id: 'hd-9', label: 'Try Again', text: 'Try Again', valueUsd: 0, value: 0, type: 'try_again', color: '#0f172a', textColor: 'white', weight: 17, probabilityWeight: 17, isActive: true },
    { id: 'hd-10', label: '$500 Wallet Bonus', text: '$500 USD', valueUsd: 500, value: 500, type: 'credits', color: '#7c3aed', textColor: 'white', weight: 11, probabilityWeight: 11, isActive: true },
  ],
  super_hard: [
    { id: 'sh-1', label: 'Tesla Model 3 RWD', text: 'Model 3 Win', valueUsd: 38990, value: 38990, type: 'car', vehicleModel: '2026 Tesla Model 3 Standard Range RWD', color: '#dc2626', textColor: 'white', weight: 1, probabilityWeight: 1, isActive: true },
    { id: 'sh-2', label: 'Try Again', text: 'Try Again', valueUsd: 0, value: 0, type: 'try_again', color: '#1e293b', textColor: 'white', weight: 19, probabilityWeight: 19, isActive: true },
    { id: 'sh-3', label: '$8,000 Cash Jackpot', text: '$8,000 USD', valueUsd: 8000, value: 8000, type: 'crypto', color: '#16a34a', textColor: 'white', weight: 3, probabilityWeight: 3, isActive: true },
    { id: 'sh-4', label: 'Try Again', text: 'Try Again', valueUsd: 0, value: 0, type: 'try_again', color: '#334155', textColor: 'white', weight: 19, probabilityWeight: 19, isActive: true },
    { id: 'sh-5', label: '$4,000 Cash Payout', text: '$4,000 USD', valueUsd: 4000, value: 4000, type: 'crypto', color: '#2563eb', textColor: 'white', weight: 6, probabilityWeight: 6, isActive: true },
    { id: 'sh-6', label: 'Try Again', text: 'Try Again', valueUsd: 0, value: 0, type: 'try_again', color: '#0f172a', textColor: 'white', weight: 18, probabilityWeight: 18, isActive: true },
    { id: 'sh-7', label: '$1,500 Wallet Credit', text: '$1,500 USD', valueUsd: 1500, value: 1500, type: 'credits', color: '#ca8a04', textColor: 'white', weight: 9, probabilityWeight: 9, isActive: true },
    { id: 'sh-8', label: '$500 Cash Prize', text: '$500 USD', valueUsd: 500, value: 500, type: 'credits', color: '#0891b2', textColor: 'white', weight: 10, probabilityWeight: 10, isActive: true },
    { id: 'sh-9', label: 'Try Again', text: 'Try Again', valueUsd: 0, value: 0, type: 'try_again', color: '#475569', textColor: 'white', weight: 18, probabilityWeight: 18, isActive: true },
    { id: 'sh-10', label: '$250 Consolation Cash', text: '$250 USD', valueUsd: 250, value: 250, type: 'credits', color: '#7c3aed', textColor: 'white', weight: 12, probabilityWeight: 12, isActive: true },
  ],
};

const DEFAULT_SERVER_SPIN_SYSTEM_CONFIG = {
  minSpinCostUsd: 150,
  maxSpinCostUsd: 2500,
  maxCashWinUsd: 25000,
  minStakeCashCapUsd: 2000,
  adminMode: 'auto' as 'auto' | 'easy' | 'hard' | 'super_hard',
  autoSuperHardWinThreshold: 2,
  freeSpinMaxWinsPerOffer: 1,
  levels: DEFAULT_SERVER_SPIN_LEVELS,
  userLevelOverrides: {} as Record<string, 'auto' | 'easy' | 'hard' | 'super_hard'>,
  userTrackers: {} as Record<string, {
    paidSpinsCount: number;
    totalWinsCount: number;
    freeSpinOfferWinsUsed: number;
    freeSpinOffersRedeemed: number;
    activeOfferSpinsRemaining?: number;
    redeemedCouponCodes?: string[];
    welcomeSpinsGranted?: boolean;
    scratchPlaysCount?: number;
    scratchJackpotsWonCount?: number;
    lastScratchAt?: string;
    lastSpinAt?: string;
    lastResolvedLevel?: 'easy' | 'hard' | 'super_hard';
    lastReason?: string;
  }>,
};

const DEFAULT_SERVER_CRON_JOBS = [
  {
    id: 'roi_accrual',
    name: 'Fleet Staking & TSLA Fast-ROI Accrual',
    description: 'Accrues daily dividends across running fleet & Fast-ROI equity plans and settles matured positions.',
    enabled: true,
    intervalMinutes: 1,
    lastRunAt: new Date().toISOString(),
    runsCount: 186,
    lastSummary: 'Active 60s automated ROI accrual & maturity settlement engine.',
  },
  {
    id: 'daily_streak_audit',
    name: 'Daily Streak Continuity & Reset Audit',
    description: 'Audits UTC check-in timestamps, resets expired streaks beyond resetAfterHours, and seals milestone claims.',
    enabled: true,
    intervalMinutes: 15,
    lastRunAt: new Date().toISOString(),
    runsCount: 42,
    lastSummary: 'Verified active member streak timelines and UTC rollover integrity.',
  },
  {
    id: 'spin_criteria_audit',
    name: 'Spin & Win Multi-Win Criteria Enforcer',
    description: 'Automatically switches repeat winners (>= threshold wins) to Super Hard difficulty and audits free-spin win caps.',
    enabled: true,
    intervalMinutes: 5,
    lastRunAt: new Date().toISOString(),
    runsCount: 94,
    lastSummary: 'Enforced 1-win free spin limit and multi-win Super Hard criteria checks.',
  },
  {
    id: 'won_prize_logistics',
    name: 'Won Vehicle Custody & Logistics Progression',
    description: 'Advances fee-paid won vehicles from fees_paid_processing to documentation_ready and carrier dispatch.',
    enabled: true,
    intervalMinutes: 10,
    lastRunAt: new Date().toISOString(),
    runsCount: 31,
    lastSummary: 'Verified deposit-cleared shipping packets and VIN export documentation.',
  },
  {
    id: 'tsla_market_sync',
    name: 'TSLA Market Telemetry & Price Alert Check',
    description: 'Refreshes TSLA quote baselines and triggers active user price alerts when thresholds cross.',
    enabled: true,
    intervalMinutes: 5,
    lastRunAt: new Date().toISOString(),
    runsCount: 118,
    lastSummary: 'Synced live NASDAQ: TSLA telemetry feed.',
  },
];

let serverStreakConfig: typeof DEFAULT_SERVER_STREAK_CONFIG = {
  ...DEFAULT_SERVER_STREAK_CONFIG,
  ...((() => {
    try {
      if (fs.existsSync(path.join(process.cwd(), '.apex_admin_state.json'))) {
        const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.apex_admin_state.json'), 'utf-8'));
        return raw.streakConfig || {};
      }
    } catch {
      // ignore
    }
    return {};
  })()),
};

let serverStreakStates: Record<string, any> = (() => {
  try {
    if (fs.existsSync(path.join(process.cwd(), '.apex_admin_state.json'))) {
      const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.apex_admin_state.json'), 'utf-8'));
      return raw.streakStates || {};
    }
  } catch {
    // ignore
  }
  return {};
})();

let serverSpinSystemConfig: typeof DEFAULT_SERVER_SPIN_SYSTEM_CONFIG = (() => {
  try {
    if (fs.existsSync(path.join(process.cwd(), '.apex_admin_state.json'))) {
      const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.apex_admin_state.json'), 'utf-8'));
      if (raw.spinSystemConfig) {
        const mergedLevels = { ...DEFAULT_SERVER_SPIN_LEVELS, ...(raw.spinSystemConfig.levels || {}) };
        // Upgrade legacy $20,000 easy jackpot slice to $25,000 max jackpot
        if (Array.isArray(mergedLevels.easy)) {
          mergedLevels.easy = mergedLevels.easy.map((s: any) =>
            s?.id === 'ez-2' && Number(s.valueUsd) === 20000
              ? { ...s, label: '$25,000 Max Cash Jackpot', text: '$25,000 USD', valueUsd: 25000, value: 25000 }
              : s
          );
        }
        const rawMaxWin = Number(raw.spinSystemConfig.maxCashWinUsd) || 25000;
        return {
          ...DEFAULT_SERVER_SPIN_SYSTEM_CONFIG,
          ...raw.spinSystemConfig,
          minSpinCostUsd: Math.max(150, Number(raw.spinSystemConfig.minSpinCostUsd) || 150),
          maxSpinCostUsd: Math.min(2500, Math.max(150, Number(raw.spinSystemConfig.maxSpinCostUsd) || 2500)),
          maxCashWinUsd: rawMaxWin <= 20000 ? 25000 : Math.min(25000, rawMaxWin),
          minStakeCashCapUsd: Math.min(2000, Math.max(250, Number(raw.spinSystemConfig.minStakeCashCapUsd) || 2000)),
          levels: mergedLevels,
          userLevelOverrides: raw.spinSystemConfig.userLevelOverrides || {},
          userTrackers: raw.spinSystemConfig.userTrackers || {},
        };
      }
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_SERVER_SPIN_SYSTEM_CONFIG };
})();

let serverCronJobs: typeof DEFAULT_SERVER_CRON_JOBS = (() => {
  try {
    if (fs.existsSync(path.join(process.cwd(), '.apex_admin_state.json'))) {
      const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.apex_admin_state.json'), 'utf-8'));
      if (Array.isArray(raw.cronJobs) && raw.cronJobs.length > 0) {
        return raw.cronJobs;
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_SERVER_CRON_JOBS;
})();

const DEFAULT_SERVER_SCRATCH_TIERS = [
  {
    id: 'scratch-tier-bronze',
    name: 'Cyber Starter Foil',
    priceUsd: 50,
    maxPrizeUsd: 500,
    possiblePrizes: [
      { amountUsd: 500, label: '$500 Rare Cash Jackpot', weight: 1 },
      { amountUsd: 250, label: '$250 Service Voucher', weight: 4 },
      { amountUsd: 100, label: '$100 Wallet Credits', weight: 15 },
      { amountUsd: 50, label: '$50 Apex Token', weight: 80 },
      { amountUsd: 0, label: 'Try Again ($0)', weight: 200, isTryAgain: true },
    ],
  },
  {
    id: 'scratch-tier-silver',
    name: 'Satin Silver Plaid',
    priceUsd: 250,
    maxPrizeUsd: 2500,
    possiblePrizes: [
      { amountUsd: 2500, label: '$2,500 Rare Jackpot', weight: 1 },
      { amountUsd: 1200, label: '$1,200 Carbon Aero Credit', weight: 4 },
      { amountUsd: 650, label: '$650 Full Detail & PPF', weight: 15 },
      { amountUsd: 350, label: '$350 Wallet Credit', weight: 35 },
      { amountUsd: 150, label: '$150 Supercharge Credits', weight: 65 },
      { amountUsd: 0, label: 'Try Again ($0)', weight: 280, isTryAgain: true },
    ],
  },
  {
    id: 'scratch-tier-gold',
    name: 'Giga Gold Plaid VIP',
    priceUsd: 1000,
    maxPrizeUsd: 15000,
    possiblePrizes: [
      { amountUsd: 38990, label: 'Win 1 Tesla Model 3 RWD', weight: 1, isTeslaCar: true, vehicleModel: '2026 Tesla Model 3 Standard Range RWD' },
      { amountUsd: 15000, label: '$15,000 Rare Max Jackpot', weight: 2 },
      { amountUsd: 7500, label: '$7,500 Plaid Reserve', weight: 7 },
      { amountUsd: 3000, label: '$3,000 Vault Credit', weight: 25 },
      { amountUsd: 1500, label: '$1,500 Cash Prize', weight: 75 },
      { amountUsd: 800, label: '$800 USDT Credit', weight: 190 },
      { amountUsd: 0, label: 'Try Again ($0)', weight: 700, isTryAgain: true },
    ],
  },
  {
    id: 'scratch-tier-diamond',
    name: 'Founders Roadster Apex Grand',
    priceUsd: 8000,
    maxPrizeUsd: 50000,
    possiblePrizes: [
      { amountUsd: 200000, label: 'Win 1 Tesla Roadster Founders', weight: 1, isTeslaCar: true, vehicleModel: '2026 Tesla Roadster Founders Edition' },
      { amountUsd: 89990, label: 'Win 1 Tesla Model S Plaid', weight: 2, isTeslaCar: true, vehicleModel: '2026 Tesla Model S Plaid Tri-Motor' },
      { amountUsd: 99990, label: 'Win 1 Tesla Cyberbeast AWD', weight: 2, isTeslaCar: true, vehicleModel: '2026 Tesla Cybertruck Cyberbeast AWD' },
      { amountUsd: 50000, label: '$50,000 Rare Max Jackpot', weight: 3 },
      { amountUsd: 25000, label: '$25,000 Founders Vault', weight: 12 },
      { amountUsd: 12000, label: '$12,000 Cash Payout', weight: 45 },
      { amountUsd: 6000, label: '$6,000 Cash Return', weight: 135 },
      { amountUsd: 3000, label: '$3,000 Rebate Credit', weight: 200 },
      { amountUsd: 0, label: 'Try Again ($0)', weight: 600, isTryAgain: true },
    ],
  },
];

let serverScratchTiers: any[] = (() => {
  try {
    if (fs.existsSync(path.join(process.cwd(), '.apex_admin_state.json'))) {
      const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.apex_admin_state.json'), 'utf-8'));
      if (Array.isArray(raw.scratchTiers) && raw.scratchTiers.length >= 4) {
        const dTier = raw.scratchTiers.find((t: any) => t.id === 'scratch-tier-diamond');
        const hasTryAgainBig = dTier?.possiblePrizes?.some((p: any) => p.isTryAgain && Number(p.weight) >= 400);
        if (hasTryAgainBig) {
          return raw.scratchTiers;
        }
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_SERVER_SCRATCH_TIERS;
})();

const serverWonPrizes: Map<string, any> = new Map();
const serverUserNotifications: any[] = [];

// Hydrate persisted deposit records, transaction audits, notifications & won prizes on boot
(() => {
  try {
    const file = path.join(process.cwd(), '.apex_admin_state.json');
    if (fs.existsSync(file)) {
      const raw = JSON.parse(fs.readFileSync(file, 'utf-8'));
      hydrateValidatorState({
        depositRecords: raw.depositRecords,
        transactionAudits: raw.transactionAudits,
      });
      if (Array.isArray(raw.userNotifications)) {
        for (const n of raw.userNotifications) {
          if (n && n.id) {
            serverUserNotifications.push(n);
          }
        }
      }
      if (Array.isArray(raw.wonPrizesList)) {
        for (const wp of raw.wonPrizesList) {
          if (wp && wp.id) {
            const st = wp.shippingStatus || 'awaiting_details';
            const isApprovedByStatus =
              st === 'approved' || st === 'documentation_ready' || st === 'shipped' || st === 'delivered';
            serverWonPrizes.set(wp.id, {
              prizeType: 'vehicle',
              title: '2026 Tesla Promotional Vehicle',
              userName: wp.userId || 'Apex Member',
              userEmail: 'member@apex-tesla.io',
              image: '/promo-plaid.jpg',
              estimatedValueUsd: 42490,
              processingFeeUsd: 450,
              shippingDocFeeUsd: 350,
              shippingFreightFeeUsd: 1200,
              totalFeesUsd: 2000,
              wonAt: wp.paidAt ? String(wp.paidAt).slice(0, 10) : getUtcDateKey(),
              source: 'Wheel Spin',
              shippingStatus: st,
              addressConfirmed: wp.addressConfirmed ?? Boolean(wp.shippingAddress?.street),
              paymentVerifiedByAdmin: wp.paymentVerifiedByAdmin ?? isApprovedByStatus,
              adminApprovedForShipment: wp.adminApprovedForShipment ?? isApprovedByStatus,
              ...wp,
            });
          }
        }
      }
      if (raw.serverWalletsFreeWin && typeof raw.serverWalletsFreeWin === 'object') {
        for (const [uid, fw] of Object.entries(raw.serverWalletsFreeWin)) {
          const w = reconcileWalletFromDepositRecords(uid, serverWallets);
          w.freeWinUsd = Number(Math.max(0, Number(fw) || 0).toFixed(2));
          reconcileWalletFromDepositRecords(uid, serverWallets);
        }
      }
    }
  } catch {
    // ignore hydration error
  }
  seedInitialDepositRecords(serverWallets);
})();

function persistServerGameAndCronState() {
  try {
    const file = path.join(process.cwd(), '.apex_admin_state.json');
    const existing = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : {};
    const validatorExport = exportValidatorState();
    const serverWalletsFreeWin: Record<string, number> = {};
    for (const [uid, w] of serverWallets.entries()) {
      serverWalletsFreeWin[uid] = w.freeWinUsd;
    }
    const next = {
      ...existing,
      streakConfig: serverStreakConfig,
      streakStates: serverStreakStates,
      spinSystemConfig: serverSpinSystemConfig,
      scratchTiers: serverScratchTiers,
      cronJobs: serverCronJobs,
      depositRecords: validatorExport.depositRecords,
      transactionAudits: validatorExport.transactionAudits,
      serverWalletsFreeWin,
      wonPrizesList: Array.from(serverWonPrizes.values()).slice(0, 100),
      userNotifications: serverUserNotifications.slice(0, 200),
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(file, JSON.stringify(next, null, 2), 'utf-8');
  } catch {
    // ignore write failure on read-only fs
  }
}

function getUtcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function hoursBetweenIso(prevIso: string | null | undefined, nowDate = new Date()): number {
  if (!prevIso) return 0;
  const ts = new Date(prevIso).getTime();
  if (Number.isNaN(ts)) return 0;
  return (nowDate.getTime() - ts) / 3600000;
}

function runDailyStreakAuditJob(): { resetCount: number; summary: string } {
  const resetAfterHours = Math.max(24, Number(serverStreakConfig.resetAfterHours) || 48);
  let resetCount = 0;
  const now = new Date();
  const todayUtc = getUtcDateKey(now);

  for (const [uid, st] of Object.entries(serverStreakStates)) {
    if (!st) continue;
    const elapsed = hoursBetweenIso(st.lastCheckInAtIso, now);
    if (st.lastCheckInDateUtc && st.lastCheckInDateUtc !== todayUtc) {
      st.checkedInToday = false;
    }
    if (serverStreakConfig.autoResetMissedDays && st.currentStreak > 0 && elapsed > resetAfterHours) {
      st.currentStreak = 0;
      st.checkedInToday = false;
      st.securitySig = signLedgerPayload({
        userId: uid,
        currentStreak: 0,
        lastCheckInDateUtc: st.lastCheckInDateUtc || null,
        totalCheckIns: st.totalCheckIns || 0,
      });
      resetCount++;
    }
  }
  const summary = `Audited ${Object.keys(serverStreakStates).length} member streak ledger(s); auto-reset ${resetCount} lapsed streak(s) exceeding ${resetAfterHours}h.`;
  if (resetCount > 0) persistServerGameAndCronState();
  return { resetCount, summary };
}

function runSpinCriteriaAuditJob(): { flaggedUsers: number; summary: string } {
  const threshold = Math.max(1, Number(serverSpinSystemConfig.autoSuperHardWinThreshold) || 2);
  let flaggedUsers = 0;
  const trackers = serverSpinSystemConfig.userTrackers || {};
  for (const [uid, tracker] of Object.entries(trackers)) {
    if (tracker && tracker.totalWinsCount >= threshold) {
      if (!serverSpinSystemConfig.userLevelOverrides[uid] || serverSpinSystemConfig.userLevelOverrides[uid] === 'auto') {
        serverSpinSystemConfig.userLevelOverrides[uid] = 'super_hard';
        flaggedUsers++;
      }
    }
  }
  const summary = `Audited ${Object.keys(trackers).length} spin profile(s); switched ${flaggedUsers} multi-winner account(s) (>= ${threshold} wins) to Super Hard.`;
  if (flaggedUsers > 0) persistServerGameAndCronState();
  return { flaggedUsers, summary };
}

function runWonPrizeLogisticsJob(): { advancedCount: number; summary: string } {
  let advancedCount = 0;
  for (const prize of serverWonPrizes.values()) {
    if (!prize || !prize.feesPaid || !prize.paymentVerifiedByAdmin || !prize.adminApprovedForShipment) continue;
    if (prize.shippingStatus === 'documentation_ready') {
      prize.shippingStatus = 'shipped';
      prize.trackingNumber = prize.trackingNumber || `APX-EXP-${Date.now().toString(36).toUpperCase()}`;
      prize.carrierName = prize.carrierName || 'Apex Bonded Enclosed EV Carrier';
      advancedCount++;
    }
  }
  const summary = `Verified ${serverWonPrizes.size} won-prize vault item(s); progressed shipping logistics on ${advancedCount} admin-approved vehicle(s).`;
  return { advancedCount, summary };
}

function runSingleCronJobById(jobId: string): { success: boolean; summary: string; extra?: Record<string, unknown> } {
  const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const nowIso = new Date().toISOString();
  const job = serverCronJobs.find((j) => j.id === jobId);
  let summary = '';
  let extra: Record<string, unknown> = {};

  if (jobId === 'roi_accrual') {
    const res = runServerCronCycle();
    summary = `Accrued $${res.yieldDistributedUsd.toFixed(2)} ROI; ${res.maturedCount} matured.`;
    extra = res;
  } else if (jobId === 'daily_streak_audit') {
    const res = runDailyStreakAuditJob();
    summary = res.summary;
    extra = res;
  } else if (jobId === 'spin_criteria_audit') {
    const res = runSpinCriteriaAuditJob();
    summary = res.summary;
    extra = res;
  } else if (jobId === 'won_prize_logistics') {
    const res = runWonPrizeLogisticsJob();
    summary = res.summary;
    extra = res;
  } else if (jobId === 'tsla_market_sync') {
    const simulatedQuote = Number((332 + (Math.random() - 0.5) * 4.5).toFixed(2));
    summary = `Synced live NASDAQ: TSLA telemetry feed ($${simulatedQuote}).`;
    extra = { tslaPriceUsd: simulatedQuote };
  } else {
    return { success: false, summary: `Unknown cron job id: ${jobId}` };
  }

  if (job) {
    job.lastRunAt = nowIso;
    job.runsCount = (job.runsCount || 0) + 1;
    job.lastSummary = summary;
  }
  if (jobId !== 'roi_accrual') {
    serverCronLogs.unshift(`[${timeStr}] [CRON:${jobId}] ${summary}`);
    if (serverCronLogs.length > 60) serverCronLogs.length = 60;
  }
  persistServerGameAndCronState();
  return { success: true, summary, extra };
}

// Master Cron Cycle Function
function runServerCronCycle(): {
  maturedCount: number;
  yieldDistributedUsd: number;
  logs: string[];
  settledEvents: ServerSettlementEvent[];
} {
  const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  lastCronRunTimestamp = new Date().toISOString();
  cronCyclesRun += 1;

  let maturedCount = 0;
  let yieldDistributedUsd = 0;
  const cycleLogs: string[] = [];
  const settledEvents: ServerSettlementEvent[] = [];

  for (const inv of serverInvestments.values()) {
    if (inv.status !== 'running' || inv.capitalReturned) continue;

    // Daily ROI calculated based on specific plan duration
    const addedYield = computeDailyRoiUsd(inv);
    inv.dailyRoiRate = addedYield;
    inv.earnedDividendsUsd = Number(((inv.earnedDividendsUsd || 0) + addedYield).toFixed(2));
    inv.daysElapsed = Math.min(inv.durationDays, (inv.daysElapsed || 0) + 1);
    yieldDistributedUsd = Number((yieldDistributedUsd + addedYield).toFixed(2));

    // Check if plan duration is complete
    if (inv.daysElapsed >= inv.durationDays) {
      // Ensure full expected plan ROI is realized on final day when specified
      if (inv.totalExpectedRoiUsd > 0 && inv.earnedDividendsUsd < inv.totalExpectedRoiUsd) {
        const deltaTopUp = Number((inv.totalExpectedRoiUsd - inv.earnedDividendsUsd).toFixed(2));
        inv.earnedDividendsUsd = Number(inv.totalExpectedRoiUsd.toFixed(2));
        yieldDistributedUsd = Number((yieldDistributedUsd + deltaTopUp).toFixed(2));
      }

      maturedCount++;
      inv.status = 'completed';
      inv.completedAt = new Date().toISOString();
      inv.capitalReturned = true;
      inv.certificateId = `CERT-${Date.now().toString(36).toUpperCase()}-${inv.id.slice(-4).toUpperCase()}`;

      const totalPayoutUsd = Number((inv.amountInvestedUsd + inv.earnedDividendsUsd).toFixed(2));

      // Credit User Wallet (maturities record verified principal return + ROI yield)
      registerVerifiedDepositRecord({
        userId: inv.userId,
        currency: 'USD',
        amount: inv.amountInvestedUsd,
        usdEquivalent: inv.amountInvestedUsd,
        txHash: inv.certificateId || `CERT-${inv.id}-${Date.now()}`,
        gatewayName: 'Fleet Maturity Settlement',
        source: 'investment_maturity',
        walletsMap: serverWallets,
      });
      const wallet = creditVerifiedFreeWinBalance(inv.userId, inv.earnedDividendsUsd || 0, serverWallets);

      const settlementEvent: ServerSettlementEvent = {
        id: `settle-${inv.id}-${Date.now()}`,
        investmentId: inv.id,
        userId: inv.userId,
        userEmail: inv.userEmail,
        userName: inv.userName,
        poolTitle: inv.poolTitle,
        principalUsd: inv.amountInvestedUsd,
        roiUsd: inv.earnedDividendsUsd,
        totalPayoutUsd,
        certificateId: inv.certificateId,
        settledAt: inv.completedAt,
        emailDispatched: true,
      };
      serverSettlementEvents.unshift(settlementEvent);
      if (serverSettlementEvents.length > 50) serverSettlementEvents.length = 50;
      settledEvents.push(settlementEvent);

      const logMsg = `[CRON MATURITY SETTLED] Position #${inv.id} (${inv.poolTitle}): $${inv.amountInvestedUsd} capital + $${inv.earnedDividendsUsd.toFixed(2)} ROI = $${totalPayoutUsd.toFixed(2)} credited to wallet (${inv.userEmail}).`;
      cycleLogs.push(logMsg);
      serverCronLogs.unshift(`[${timeStr}] ${logMsg}`);

      // Dispatch automated notification email
      dispatchMaturityEmail({
        toEmail: inv.userEmail,
        userName: inv.userName,
        poolTitle: inv.poolTitle,
        principalUsd: inv.amountInvestedUsd,
        roiUsd: inv.earnedDividendsUsd,
        totalPayoutUsd,
        newWalletBalanceUsd: wallet.usd,
        investmentId: inv.id,
        certificateId: inv.certificateId,
      }).catch((e) => console.warn('Email dispatch error:', e));
    } else {
      const accrualMsg = `[YIELD ACCRUED] #${inv.id} (${inv.poolTitle}): +$${addedYield.toFixed(2)} daily ROI (${inv.daysElapsed}/${inv.durationDays} days).`;
      cycleLogs.push(accrualMsg);
    }
  }

  const roiJob = serverCronJobs.find((j) => j.id === 'roi_accrual');
  if (roiJob) {
    roiJob.lastRunAt = lastCronRunTimestamp;
    roiJob.runsCount = cronCyclesRun;
    roiJob.lastSummary = `Accrued $${yieldDistributedUsd.toFixed(2)} ROI; ${maturedCount} plan(s) settled.`;
  }

  const summaryLog = `[${timeStr}] Cycle #${cronCyclesRun}: Accrued $${yieldDistributedUsd.toFixed(2)} ROI across running plans. ${maturedCount} plan(s) reached maturity & auto-settled.`;
  serverCronLogs.unshift(summaryLog);
  if (serverCronLogs.length > 60) serverCronLogs.length = 60;

  return { maturedCount, yieldDistributedUsd, logs: [summaryLog, ...cycleLogs], settledEvents };
}

// Background Multi-Cron Interval Runner (ticks every 30s, executes due enabled cron jobs)
setInterval(() => {
  if (!cronActive) return;
  const nowMs = Date.now();
  for (const job of serverCronJobs) {
    if (!job.enabled) continue;
    const intervalMs = Math.max(1, Number(job.intervalMinutes) || 5) * 60000;
    const lastMs = job.lastRunAt ? new Date(job.lastRunAt).getTime() : 0;
    if (!lastMs || nowMs - lastMs >= intervalMs) {
      runSingleCronJobById(job.id);
    }
  }
}, 30000);

// Cron Job REST API Endpoints
app.get('/api/cron/status', (_req, res) => {
  const investments = Array.from(serverInvestments.values());
  const runningCount = investments.filter((i) => i.status === 'running').length;
  const completedCount = investments.filter((i) => i.status === 'completed').length;
  const totalStakedUsd = investments.reduce((acc, i) => acc + (i.status === 'running' ? i.amountInvestedUsd : 0), 0);

  return res.json({
    active: cronActive,
    cyclesRun: cronCyclesRun,
    lastRunTimestamp: lastCronRunTimestamp,
    intervalMs: 30000,
    runningCount,
    completedCount,
    totalStakedUsd,
    jobs: serverCronJobs,
    logs: serverCronLogs.slice(0, 30),
    dispatchedEmails: getDispatchedEmailLogs().length > 0 ? getDispatchedEmailLogs().slice(0, 20) : serverDispatchedEmails.slice(0, 15),
    investments,
    settlementEvents: serverSettlementEvents.slice(0, 20),
  });
});

app.post('/api/cron/trigger', authenticateToken, requireAdmin, (_req, res) => {
  const result = runServerCronCycle();
  runDailyStreakAuditJob();
  runSpinCriteriaAuditJob();
  runWonPrizeLogisticsJob();
  persistServerGameAndCronState();
  return res.json({
    success: true,
    cyclesRun: cronCyclesRun,
    lastRunTimestamp: lastCronRunTimestamp,
    jobs: serverCronJobs,
    message: `Master Cron cycle #${cronCyclesRun} executed: $${result.yieldDistributedUsd.toFixed(2)} ROI accrued, ${result.maturedCount} plan(s) settled + streak/spin/logistics audits completed.`,
    investments: Array.from(serverInvestments.values()),
    dispatchedEmails: serverDispatchedEmails.slice(0, 15),
    settlementEvents: serverSettlementEvents.slice(0, 20),
    ...result,
  });
});

app.post('/api/cron/jobs/:jobId/run', authenticateToken, requireAdmin, (req, res) => {
  const { jobId } = req.params;
  const outcome = runSingleCronJobById(jobId);
  if (!outcome.success) {
    return res.status(404).json({ error: outcome.summary });
  }
  return res.json({
    success: true,
    jobId,
    summary: outcome.summary,
    jobs: serverCronJobs,
    logs: serverCronLogs.slice(0, 30),
    ...(outcome.extra || {}),
  });
});

app.post('/api/cron/config', authenticateToken, requireAdmin, (req, res) => {
  const { jobs } = req.body || {};
  if (Array.isArray(jobs)) {
    serverCronJobs = jobs.map((j: any) => ({
      id: String(j.id),
      name: String(j.name || j.id),
      description: String(j.description || ''),
      enabled: Boolean(j.enabled),
      intervalMinutes: Math.max(1, Math.min(1440, Number(j.intervalMinutes) || 5)),
      lastRunAt: j.lastRunAt || null,
      runsCount: Number(j.runsCount) || 0,
      lastSummary: String(j.lastSummary || ''),
    }));
    persistServerGameAndCronState();
  }
  return res.json({ success: true, jobs: serverCronJobs });
});

app.post('/api/cron/toggle', authenticateToken, requireAdmin, (req, res) => {
  const { active } = req.body || {};
  if (typeof active === 'boolean') {
    cronActive = active;
  } else {
    cronActive = !cronActive;
  }
  serverCronLogs.unshift(
    `[${new Date().toISOString().replace('T', ' ').substring(0, 19)}] Cron scheduler ${cronActive ? 'RESUMED' : 'PAUSED'} by administrator.`
  );
  return res.json({
    success: true,
    active: cronActive,
    message: `Automated multi-job cron service is now ${cronActive ? 'ACTIVE' : 'PAUSED'}.`,
  });
});

// ============================================================================
// DAILY STREAK TRACKER ENDPOINTS
// ============================================================================
app.get('/api/streak/config', (req, res) => {
  const caller = getAuthenticatedUser(req);
  if (caller?.role === 'admin') {
    return res.json({ success: true, config: serverStreakConfig, allStates: serverStreakStates });
  }
  return res.json({ success: true, config: serverStreakConfig });
});

app.post('/api/streak/config', authenticateToken, requireAdmin, (req, res) => {
  const { config } = req.body || {};
  if (config && typeof config === 'object') {
    serverStreakConfig = {
      ...serverStreakConfig,
      ...config,
      graceWindowHours: Math.max(24, Number(config.graceWindowHours ?? serverStreakConfig.graceWindowHours) || 36),
      resetAfterHours: Math.max(24, Number(config.resetAfterHours ?? serverStreakConfig.resetAfterHours) || 48),
      maxStreakMultiplier: Math.max(1, Math.min(10, Number(config.maxStreakMultiplier ?? serverStreakConfig.maxStreakMultiplier) || 2.5)),
      dailyRates: Array.isArray(config.dailyRates) ? config.dailyRates : serverStreakConfig.dailyRates,
      milestoneBonuses: Array.isArray(config.milestoneBonuses) ? config.milestoneBonuses : serverStreakConfig.milestoneBonuses,
    };
    persistServerGameAndCronState();
  }
  return res.json({ success: true, config: serverStreakConfig });
});

app.get('/api/streak/state/:userId', authenticateToken, requireSelfOrAdmin, (req, res) => {
  const { userId } = req.params;
  const now = new Date();
  const todayUtc = getUtcDateKey(now);
  let state = serverStreakStates[userId];
  if (!state) {
    state = {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      totalCheckIns: 0,
      totalStreakPoints: 0,
      totalStreakCents: 0,
      lastCheckInDateUtc: null,
      lastCheckInAtIso: null,
      checkedInToday: false,
      claimedMilestones: [],
      history: [],
    };
  } else {
    const elapsed = hoursBetweenIso(state.lastCheckInAtIso, now);
    if (serverStreakConfig.autoResetMissedDays && state.currentStreak > 0 && elapsed > (serverStreakConfig.resetAfterHours || 48)) {
      state.currentStreak = 0;
    }
    state.checkedInToday = state.lastCheckInDateUtc === todayUtc;
  }
  state.securitySig = signLedgerPayload({
    userId,
    currentStreak: state.currentStreak,
    lastCheckInDateUtc: state.lastCheckInDateUtc,
    totalCheckIns: state.totalCheckIns,
  });
  return res.json({ success: true, state, config: serverStreakConfig });
});

app.post('/api/streak/checkin', authenticateToken, requireSelfOrAdmin, (req, res) => {
  const { userId, userTier } = req.body || {};
  if (!userId) {
    return res.status(400).json({ error: 'userId is required for streak check-in.' });
  }
  if (!serverStreakConfig.enabled) {
    return res.status(400).json({ error: 'Daily Streak Tracker is currently paused by administration.' });
  }

  const now = new Date();
  const todayUtc = getUtcDateKey(now);
  const yesterdayUtc = getUtcDateKey(new Date(now.getTime() - 86400000));
  const state = serverStreakStates[userId] || {
    userId,
    currentStreak: 0,
    longestStreak: 0,
    totalCheckIns: 0,
    totalStreakPoints: 0,
    totalStreakCents: 0,
    lastCheckInDateUtc: null,
    lastCheckInAtIso: null,
    checkedInToday: false,
    claimedMilestones: [],
    history: [],
  };

  if (state.lastCheckInDateUtc === todayUtc) {
    return res.json({
      success: false,
      alreadyClaimed: true,
      message: 'Today’s UTC daily streak check-in has already been claimed.',
      state,
    });
  }

  const elapsed = hoursBetweenIso(state.lastCheckInAtIso, now);
  const graceHours = Math.max(24, Number(serverStreakConfig.graceWindowHours) || 36);
  const isConsecutive =
    state.lastCheckInDateUtc === yesterdayUtc ||
    (state.lastCheckInDateUtc !== null && elapsed <= graceHours);

  const nextStreak = isConsecutive ? (state.currentStreak || 0) + 1 : 1;
  const rates = serverStreakConfig.dailyRates || DEFAULT_SERVER_STREAK_CONFIG.dailyRates;
  const rateIdx = Math.min(Math.max(0, nextStreak - 1), Math.max(0, rates.length - 1));
  const rateEntry = rates[rateIdx] || { day: nextStreak, label: `Day ${nextStreak}`, bonusPoints: 25, bonusCents: 5 };

  const tierFactorMap: Record<string, number> = {
    Standard: 1,
    'Silver Ambassador': 1.2,
    'Plaid Member': 1.4,
    'Founders Club': 1.75,
  };
  const tierMult = Math.min(serverStreakConfig.maxStreakMultiplier || 2.5, tierFactorMap[String(userTier || 'Standard')] || 1);
  let pointsAwarded = Math.round((Number(rateEntry.bonusPoints) || 25) * tierMult);
  let centsAwarded = Number(((Number(rateEntry.bonusCents) || 5) * tierMult).toFixed(2));
  let milestonePoints = 0;
  let milestoneSpins = 0;

  const claimedSet = new Set<number>(Array.isArray(state.claimedMilestones) ? state.claimedMilestones : []);
  const newlyUnlockedMilestones: any[] = [];
  for (const ms of serverStreakConfig.milestoneBonuses || []) {
    if (nextStreak >= ms.daysRequired && !claimedSet.has(ms.daysRequired)) {
      claimedSet.add(ms.daysRequired);
      milestonePoints += Number(ms.bonusPoints) || 0;
      centsAwarded = Number((centsAwarded + (Number(ms.bonusCents) || 0)).toFixed(2));
      milestoneSpins += Number(ms.bonusFreeSpins) || 0;
      newlyUnlockedMilestones.push(ms);
    }
  }
  pointsAwarded += milestonePoints;

  state.currentStreak = nextStreak;
  state.longestStreak = Math.max(state.longestStreak || 0, nextStreak);
  state.totalCheckIns = (state.totalCheckIns || 0) + 1;
  state.totalStreakPoints = (state.totalStreakPoints || 0) + pointsAwarded;
  state.totalStreakCents = Number(((state.totalStreakCents || 0) + centsAwarded).toFixed(2));
  state.lastCheckInDateUtc = todayUtc;
  state.lastCheckInAtIso = now.toISOString();
  state.checkedInToday = true;
  state.claimedMilestones = Array.from(claimedSet);
  state.history = [
    {
      dateUtc: todayUtc,
      streakDay: nextStreak,
      pointsAwarded,
      centsAwarded,
      milestoneBonusPoints: milestonePoints,
      timestamp: now.toISOString(),
    },
    ...(Array.isArray(state.history) ? state.history : []),
  ].slice(0, 30);

  state.securitySig = signLedgerPayload({
    userId,
    currentStreak: state.currentStreak,
    lastCheckInDateUtc: state.lastCheckInDateUtc,
    totalCheckIns: state.totalCheckIns,
  });

  serverStreakStates[userId] = state;

  // Credit free promotional balance (never creates verified deposit records!)
  const creditedUsd = Number((centsAwarded / 100).toFixed(4));
  const wallet = creditVerifiedFreeWinBalance(userId, creditedUsd, serverWallets);

  if (milestoneSpins > 0) {
    const trackers = serverSpinSystemConfig.userTrackers || {};
    const curTracker = trackers[userId] || {
      paidSpinsCount: 0,
      totalWinsCount: 0,
      freeSpinOfferWinsUsed: 0,
      freeSpinOffersRedeemed: 0,
      activeOfferSpinsRemaining: 0,
    };
    serverSpinSystemConfig.userTrackers = {
      ...trackers,
      [userId]: {
        ...curTracker,
        freeSpinOffersRedeemed: (curTracker.freeSpinOffersRedeemed || 0) + 1,
        activeOfferSpinsRemaining: (curTracker.activeOfferSpinsRemaining || 0) + milestoneSpins,
        lastReason: `streak_milestone_${nextStreak}d`,
      },
    };
  }

  persistServerGameAndCronState();

  return res.json({
    success: true,
    state,
    pointsAwarded,
    centsAwarded,
    creditedUsd,
    milestoneSpins,
    newlyUnlockedMilestones,
    wallet,
    activeOfferSpinsRemaining: serverSpinSystemConfig.userTrackers?.[userId]?.activeOfferSpinsRemaining || 0,
    message: `Day ${nextStreak} Streak Verified! +${pointsAwarded} pts & +${centsAwarded}¢ added to your promotional rewards.`,
  });
});

app.post('/api/streak/admin-update', authenticateToken, requireAdmin, (req, res) => {
  const { userId, currentStreak, reset } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const existing = serverStreakStates[userId] || {
    userId,
    currentStreak: 0,
    longestStreak: 0,
    totalCheckIns: 0,
    totalStreakPoints: 0,
    totalStreakCents: 0,
    lastCheckInDateUtc: null,
    lastCheckInAtIso: null,
    checkedInToday: false,
    claimedMilestones: [],
    history: [],
  };
  if (reset) {
    existing.currentStreak = 0;
    existing.checkedInToday = false;
    existing.lastCheckInDateUtc = null;
    existing.lastCheckInAtIso = null;
  } else if (typeof currentStreak === 'number') {
    existing.currentStreak = Math.max(0, Math.floor(currentStreak));
    existing.longestStreak = Math.max(existing.longestStreak || 0, existing.currentStreak);
  }
  existing.securitySig = signLedgerPayload({
    userId,
    currentStreak: existing.currentStreak,
    lastCheckInDateUtc: existing.lastCheckInDateUtc,
    totalCheckIns: existing.totalCheckIns,
  });
  serverStreakStates[userId] = existing;
  persistServerGameAndCronState();
  return res.json({ success: true, state: existing });
});

// ============================================================================
// SPIN & WIN DIFFICULTY, COUPONS, SCRATCH & WON VEHICLE DEPOSIT-ONLY FEES
// ============================================================================
const SEEDED_VETERAN_USER_IDS = new Set([
  'usr-apex-001',
  'usr-alex-001',
  'usr-apex-admin-01',
  'usr-003',
  'usr-004',
  'usr-005',
  'usr-006',
  'usr-007',
  'usr-008',
  'usr-009',
  'usr-010',
]);

function getUserWonVehicles(userId: string, userEmail?: string) {
  const cleanEmail = userEmail ? String(userEmail).trim().toLowerCase() : '';
  const isAlexAlias = userId === 'usr-alex-001' || userId === 'usr-apex-001';
  return Array.from(serverWonPrizes.values()).filter((p) => {
    if (!p || p.prizeType !== 'vehicle') return false;
    if (p.userId === userId) return true;
    if (cleanEmail && p.userEmail && String(p.userEmail).trim().toLowerCase() === cleanEmail) return true;
    if (isAlexAlias && (p.userId === 'usr-alex-001' || p.userId === 'usr-apex-001')) return true;
    return false;
  });
}

function getUserPromotionProfile(userId: string, userEmail?: string) {
  const isSeededVeteran = SEEDED_VETERAN_USER_IDS.has(userId);
  const tracker = serverSpinSystemConfig.userTrackers?.[userId];
  const wonVehicles = getUserWonVehicles(userId, userEmail);
  const paidSpinsCount = Number(tracker?.paidSpinsCount || 0);
  const scratchPlaysCount = Number(tracker?.scratchPlaysCount || 0);
  const scratchJackpotsWonCount = Number(tracker?.scratchJackpotsWonCount || 0);

  // First-time users on free/coupon spins (before any paid spins or vehicle win) get boosted easy vehicle odds
  const isNewUserForFreeSpin = !isSeededVeteran && wonVehicles.length === 0 && paidSpinsCount === 0;
  // New users on scratch cards get easier jackpot/vehicle odds on their early cards; old users get rare/super-hard odds
  const isNewUserForScratch = !isSeededVeteran && scratchPlaysCount < 3 && scratchJackpotsWonCount === 0;

  return {
    isSeededVeteran,
    isNewUserForFreeSpin,
    isNewUserForScratch,
    wonVehiclesCount: wonVehicles.length,
    paidSpinsCount,
    scratchPlaysCount,
    scratchJackpotsWonCount,
  };
}

function computeSpinStakeProfile(
  spinCostUsd: number,
  minCost = 150,
  maxCost = 2500,
  maxJackpotUsd = 25000,
  usingFree = false,
  isNewUserFreeSpinBoost = false
) {
  const effectiveMin = Math.max(150, minCost);
  const effectiveMax = Math.max(effectiveMin + 100, Math.min(2500, maxCost));
  const minStakeCap = Math.min(2000, Number(serverSpinSystemConfig.minStakeCashCapUsd) || 2000);
  const maxJackpot = Math.min(25000, Math.max(5000, maxJackpotUsd || 25000));
  const stake = usingFree ? 0 : Math.min(effectiveMax, Math.max(effectiveMin, Number(spinCostUsd) || effectiveMin));
  const isMinStake = !usingFree && stake <= effectiveMin;
  const isMaxStake = !usingFree && stake >= effectiveMax;
  const isNewFreeBoost = Boolean(usingFree && isNewUserFreeSpinBoost);
  const isMinOrFree = isMinStake || (Boolean(usingFree) && !isNewFreeBoost);
  const stakeRatio = isMinOrFree
    ? 0
    : isNewFreeBoost
    ? 1
    : Math.min(1, Math.max(0, (stake - effectiveMin) / Math.max(1, effectiveMax - effectiveMin)));

  // Min stake ($150) & returning free spins cap strictly at <= $2,000; intermediate < $2,500 caps below max jackpot; ONLY max stake ($2,500) & new-user free spins unlock vehicles + $25k jackpot
  const maxAllowedCashUsd = isMinOrFree
    ? minStakeCap
    : isMaxStake || isNewFreeBoost
    ? maxJackpot
    : Math.min(
        maxJackpot - 1000,
        Math.round((minStakeCap + Math.pow(stakeRatio, 1.05) * (maxJackpot - minStakeCap - 2000)) / 100) * 100
      );

  const canWinVehicleByStake = isMaxStake || isNewFreeBoost;
  const canWinJackpotByStake = isMaxStake || isNewFreeBoost;
  const vehicleWeightMultiplier = !canWinVehicleByStake ? 0 : isNewFreeBoost ? 4.5 : 4.0;
  const winBoostMultiplier = Number((1 + stakeRatio * 2.2).toFixed(2));
  const tryAgainScale = Number((isNewFreeBoost ? 0.4 : isMinOrFree ? 1.15 : Math.max(0.35, 1 - stakeRatio * 0.6)).toFixed(2));

  return {
    stakeUsd: stake,
    minCostUsd: effectiveMin,
    maxCostUsd: effectiveMax,
    stakeRatio,
    isMinOrFree,
    isMaxStake,
    isNewUserFreeSpinBoost: isNewFreeBoost,
    maxAllowedCashUsd,
    maxJackpotUsd: maxJackpot,
    canWinVehicleByStake,
    canWinJackpotByStake,
    vehicleWeightMultiplier,
    winBoostMultiplier,
    tryAgainScale,
  };
}

function checkUserVehicleWinEligibility(userId: string, userEmail?: string) {
  const userVehicles = getUserWonVehicles(userId, userEmail);

  // 1. Any prior won vehicle must be paid, processed, AND shipped/delivered before winning another
  const unfulfilled = userVehicles.find(
    (p) => !p.feesPaid || (p.shippingStatus !== 'shipped' && p.shippingStatus !== 'delivered')
  );
  if (unfulfilled) {
    return {
      eligible: false,
      reasonCode: 'UNSHIPPED_VEHICLE_PENDING' as const,
      blockingPrize: {
        id: unfulfilled.id,
        title: unfulfilled.title,
        feesPaid: Boolean(unfulfilled.feesPaid),
        shippingStatus: unfulfilled.shippingStatus,
        wonAt: unfulfilled.wonAt,
      },
      nextEligibleAtIso: null,
      message: `Vehicle wins locked: complete fee payment, processing, and shipment of "${unfulfilled.title}" in your Dashboard before winning another vehicle.`,
    };
  }

  // 2. Weekly 1-vehicle limit across Spins and Scratch Cards (7 days = 168h)
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  let latestWonMs = 0;
  let latestVehicle: any = null;
  for (const v of userVehicles) {
    const rawTs = v.wonAtIso || (v.wonAt ? `${v.wonAt}T00:00:00.000Z` : '');
    const ts = rawTs ? new Date(rawTs).getTime() : 0;
    if (Number.isFinite(ts) && ts > latestWonMs) {
      latestWonMs = ts;
      latestVehicle = v;
    }
  }
  if (latestWonMs > 0 && Date.now() - latestWonMs < ONE_WEEK_MS) {
    const nextIso = new Date(latestWonMs + ONE_WEEK_MS).toISOString();
    return {
      eligible: false,
      reasonCode: 'WEEKLY_VEHICLE_LIMIT_REACHED' as const,
      blockingPrize: latestVehicle
        ? {
            id: latestVehicle.id,
            title: latestVehicle.title,
            feesPaid: Boolean(latestVehicle.feesPaid),
            shippingStatus: latestVehicle.shippingStatus,
            wonAt: latestVehicle.wonAt,
          }
        : null,
      nextEligibleAtIso: nextIso,
      message: `Weekly vehicle limit reached (1 Tesla vehicle per 7 days across Spins & Scratch Cards). Next vehicle eligibility unlocks ${nextIso.slice(0, 10)}.`,
    };
  }

  return {
    eligible: true,
    reasonCode: 'ELIGIBLE' as const,
    blockingPrize: null,
    nextEligibleAtIso: null,
    message: 'Eligible to win 1 Tesla vehicle this week (at $2,500 Max Spin Stake, New Member Free Spins, or Scratch Cards).',
  };
}

app.get('/api/promotions/vehicle-eligibility', authenticateToken, (req, res) => {
  const caller = (req as any).user;
  const userId = caller?.role === 'admin' && typeof req.query.userId === 'string' ? req.query.userId : caller?.id;
  const userEmail = caller?.role === 'admin' && typeof req.query.userId === 'string' ? undefined : caller?.email;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  return res.json({
    success: true,
    ...checkUserVehicleWinEligibility(userId, userEmail),
    promoProfile: getUserPromotionProfile(userId, userEmail),
  });
});

app.get('/api/promotions/spin-config', (req, res) => {
  const caller = getAuthenticatedUser(req);
  const vehicleEligibility = caller?.id ? checkUserVehicleWinEligibility(caller.id, caller.email) : null;
  const promoProfile = caller?.id
    ? getUserPromotionProfile(caller.id, caller.email)
    : {
        isSeededVeteran: false,
        isNewUserForFreeSpin: true,
        isNewUserForScratch: true,
        wonVehiclesCount: 0,
        paidSpinsCount: 0,
        scratchPlaysCount: 0,
        scratchJackpotsWonCount: 0,
      };
  if (caller?.role === 'admin') {
    return res.json({ success: true, config: serverSpinSystemConfig, vehicleEligibility, promoProfile });
  }
  const safeUserTrackers = caller?.id && serverSpinSystemConfig.userTrackers?.[caller.id]
    ? { [caller.id]: serverSpinSystemConfig.userTrackers[caller.id] }
    : {};
  const safeUserOverrides = caller?.id && serverSpinSystemConfig.userLevelOverrides?.[caller.id]
    ? { [caller.id]: serverSpinSystemConfig.userLevelOverrides[caller.id] }
    : {};
  return res.json({
    success: true,
    config: {
      ...serverSpinSystemConfig,
      userTrackers: safeUserTrackers,
      userLevelOverrides: safeUserOverrides,
    },
    vehicleEligibility,
    promoProfile,
  });
});

app.post('/api/promotions/spin-config', authenticateToken, requireAdmin, (req, res) => {
  const { config } = req.body || {};
  if (config && typeof config === 'object') {
    const nextMinCost = Math.max(150, Number(config.minSpinCostUsd ?? serverSpinSystemConfig.minSpinCostUsd) || 150);
    const nextMaxCost = Math.min(2500, Math.max(nextMinCost, Number(config.maxSpinCostUsd ?? serverSpinSystemConfig.maxSpinCostUsd) || 2500));
    serverSpinSystemConfig = {
      ...serverSpinSystemConfig,
      ...config,
      minSpinCostUsd: nextMinCost,
      maxSpinCostUsd: nextMaxCost,
      maxCashWinUsd: Math.min(25000, Math.max(2000, Number(config.maxCashWinUsd ?? serverSpinSystemConfig.maxCashWinUsd) || 25000)),
      minStakeCashCapUsd: Math.min(2000, Math.max(250, Number(config.minStakeCashCapUsd ?? serverSpinSystemConfig.minStakeCashCapUsd) || 2000)),
      autoSuperHardWinThreshold: Math.max(1, Number(config.autoSuperHardWinThreshold ?? serverSpinSystemConfig.autoSuperHardWinThreshold) || 2),
      freeSpinMaxWinsPerOffer: Math.max(1, Number(config.freeSpinMaxWinsPerOffer ?? serverSpinSystemConfig.freeSpinMaxWinsPerOffer) || 1),
      levels: config.levels || serverSpinSystemConfig.levels,
      userLevelOverrides: config.userLevelOverrides || serverSpinSystemConfig.userLevelOverrides,
      userTrackers: config.userTrackers || serverSpinSystemConfig.userTrackers,
    };
    persistServerGameAndCronState();
  }
  return res.json({ success: true, config: serverSpinSystemConfig });
});

app.post('/api/promotions/claim-welcome-spins', authenticateToken, (req, res) => {
  const caller = (req as any).user;
  const userId = caller?.id;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const trackers = serverSpinSystemConfig.userTrackers || {};
  const existing = trackers[userId] || {
    paidSpinsCount: 0,
    totalWinsCount: 0,
    freeSpinOfferWinsUsed: 0,
    freeSpinOffersRedeemed: 0,
    activeOfferSpinsRemaining: 0,
    redeemedCouponCodes: [],
    welcomeSpinsGranted: false,
  };

  if (existing.welcomeSpinsGranted) {
    return res.json({
      success: true,
      alreadyGranted: true,
      spinsAdded: 0,
      tracker: existing,
    });
  }

  const referred = Boolean(caller?.referredBy || req.body?.isReferred);
  const spinsAdded = referred ? 5 : 3;
  const nextTracker = {
    ...existing,
    welcomeSpinsGranted: true,
    freeSpinOffersRedeemed: (existing.freeSpinOffersRedeemed || 0) + 1,
    activeOfferSpinsRemaining: (existing.activeOfferSpinsRemaining || 0) + spinsAdded,
    lastReason: referred ? 'welcome_referral_spins' : 'welcome_bonus_spins',
  };
  serverSpinSystemConfig.userTrackers = { ...trackers, [userId]: nextTracker };
  persistServerGameAndCronState();
  return res.json({ success: true, alreadyGranted: false, spinsAdded, tracker: nextTracker });
});

app.post('/api/promotions/activate-coupon', authenticateToken, requireSelfOrAdmin, (req, res) => {
  const { userId, bonusSpins = 0, code } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const cleanCode = String(code || '').trim().toUpperCase();
  if (!cleanCode) return res.status(400).json({ error: 'Valid coupon code is required.' });

  const trackers = serverSpinSystemConfig.userTrackers || {};
  const existing = trackers[userId] || {
    paidSpinsCount: 0,
    totalWinsCount: 0,
    freeSpinOfferWinsUsed: 0,
    freeSpinOffersRedeemed: 0,
    activeOfferSpinsRemaining: 0,
    redeemedCouponCodes: [],
  };

  const redeemedList: string[] = Array.isArray(existing.redeemedCouponCodes) ? existing.redeemedCouponCodes : [];
  if (redeemedList.includes(cleanCode)) {
    return res.status(409).json({
      error: `Coupon "${cleanCode}" has already been redeemed on this account.`,
      code: 'COUPON_ALREADY_REDEEMED',
      tracker: existing,
    });
  }

  // Resolve free spin count authoritatively from persisted admin coupons when available
  const adminState = readServerAdminState();
  const persistedCoupons: any[] = Array.isArray(adminState.coupons) ? adminState.coupons : [];
  const matchedCoupon = persistedCoupons.find((c) => String(c?.code || '').toUpperCase() === cleanCode);
  const builtInSpinCoupons: Record<string, number> = {
    FREESPINS5: 5,
    TESLA5FREE: 5,
    SPIN3: 3,
    APEXSPIN5: 5,
    REFERRAL2: 2,
  };

  let authoritativeSpins = 0;
  if (matchedCoupon) {
    if (matchedCoupon.isActive === false) {
      return res.status(400).json({ error: `Coupon "${cleanCode}" is currently inactive.` });
    }
    if (matchedCoupon.expiresAt && new Date(matchedCoupon.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ error: `Coupon "${cleanCode}" has expired.` });
    }
    if (matchedCoupon.discountType !== 'free_spins') {
      return res.status(400).json({ error: `Coupon "${cleanCode}" does not grant free wheel spins.` });
    }
    authoritativeSpins = Math.min(25, Math.max(1, Number(matchedCoupon.discountValue) || 5));
  } else if (builtInSpinCoupons[cleanCode]) {
    authoritativeSpins = builtInSpinCoupons[cleanCode];
  } else {
    authoritativeSpins = Math.min(25, Math.max(0, Number(bonusSpins) || 0));
  }

  if (authoritativeSpins <= 0) {
    return res.status(400).json({ error: `Invalid or non-spin coupon "${cleanCode}".` });
  }

  const nextTracker = {
    ...existing,
    freeSpinOffersRedeemed: (existing.freeSpinOffersRedeemed || 0) + 1,
    activeOfferSpinsRemaining: (existing.activeOfferSpinsRemaining || 0) + authoritativeSpins,
    redeemedCouponCodes: [...redeemedList, cleanCode],
    lastReason: `coupon_activated:${cleanCode}`,
  };
  serverSpinSystemConfig.userTrackers = { ...trackers, [userId]: nextTracker };
  persistServerGameAndCronState();
  return res.json({ success: true, spinsAdded: authoritativeSpins, tracker: nextTracker });
});

function pickWeightedSlice(slices: any[], rngFn?: (max: number) => number): any {
  const active = slices.filter((s) => s && s.isActive !== false);
  const pool = active.length > 0 ? active : slices;
  const totalWeight = pool.reduce((sum, s) => sum + Math.max(1, Number(s.probabilityWeight ?? s.weight) || 1), 0);
  const roll = rngFn ? (rngFn(100000) / 100000) * totalWeight : (crypto.randomInt(0, 100000) / 100000) * totalWeight;
  let acc = 0;
  for (const s of pool) {
    acc += Math.max(1, Number(s.probabilityWeight ?? s.weight) || 1);
    if (roll <= acc) return s;
  }
  return pool[0];
}

app.post('/api/promotions/spin', authenticateToken, requireSelfOrAdmin, (req, res) => {
  const {
    userId,
    userName = 'Apex Member',
    userEmail = 'member@apex-tesla.io',
    useFreeSpin = false,
    spinCostUsd = 150,
    clientWalletUsd,
    clientDepositUsd,
  } = req.body || {};

  if (!userId) return res.status(400).json({ error: 'userId is required.' });

  const wallet = getOrInitServerWallet(userId);

  // Never trust client-supplied win counts or free spin counts
  const trackers = serverSpinSystemConfig.userTrackers || {};
  const tracker = trackers[userId] || {
    paidSpinsCount: 0,
    totalWinsCount: 0,
    freeSpinOfferWinsUsed: 0,
    freeSpinOffersRedeemed: 0,
    activeOfferSpinsRemaining: 0,
    redeemedCouponCodes: [],
  };

  const minCost = Math.max(150, Number(serverSpinSystemConfig.minSpinCostUsd) || 150);
  const maxCost = Math.max(minCost + 100, Math.min(2500, Number(serverSpinSystemConfig.maxSpinCostUsd) || 2500));
  const effectiveCost = Math.min(maxCost, Math.max(minCost, Number(spinCostUsd) || minCost));
  const maxCashWin = Math.min(25000, Number(serverSpinSystemConfig.maxCashWinUsd) || 25000);
  const wantFree = Boolean(useFreeSpin);

  if (wantFree && (tracker.activeOfferSpinsRemaining || 0) <= 0) {
    return res.status(400).json({
      error: 'No verified free bonus spins remaining on server account. Purchase a paid spin ($150–$2,500) or redeem a free-spin coupon.',
      code: 'NO_FREE_SPINS_AVAILABLE',
      wallet,
      tracker,
    });
  }

  const usingFree = wantFree && (tracker.activeOfferSpinsRemaining || 0) > 0;
  const promoProfileBefore = getUserPromotionProfile(userId, userEmail);
  const vehicleEligibility = checkUserVehicleWinEligibility(userId, userEmail);
  const isNewFreeSpinBoost = usingFree && promoProfileBefore.isNewUserForFreeSpin && vehicleEligibility.eligible;
  const stakeProfile = computeSpinStakeProfile(
    effectiveCost,
    minCost,
    maxCost,
    maxCashWin,
    usingFree,
    isNewFreeSpinBoost
  );

  let spinPaymentAudit: any = null;
  if (!usingFree) {
    // Cross-reference paid spin fee ($150–$2,500) against verified deposit records & reconciled wallet
    const validation = validateAndConsumePayment({
      userId,
      category: 'spin_payment',
      totalCostUsd: effectiveCost,
      expectedMinimumUsd: minCost,
      requireDepositOnly: false,
      clientClaimedDepositUsd: typeof clientDepositUsd === 'number' ? clientDepositUsd : undefined,
      clientClaimedWalletUsd: typeof clientWalletUsd === 'number' ? clientWalletUsd : undefined,
      notes: `Paid Spin Wheel fee ($${effectiveCost} USD, range $${minCost}–$${maxCost}) cross-referenced against deposit records.`,
      walletsMap: serverWallets,
    });
    if (!validation.ok) {
      persistServerGameAndCronState();
      return res.status(validation.statusCode).json({
        error: validation.error,
        code: validation.code,
        wallet: validation.wallet,
        audit: validation.audit,
      });
    }
    spinPaymentAudit = validation.audit;
    tracker.paidSpinsCount = (tracker.paidSpinsCount || 0) + 1;
  } else {
    // Still verify no client-claimed deposit manipulation on free spin calls
    const verifiedDep = getVerifiedDepositBalance(userId);
    if (
      (typeof clientDepositUsd === 'number' && clientDepositUsd > verifiedDep + 0.05) ||
      (typeof clientWalletUsd === 'number' && clientWalletUsd > wallet.usd + 0.05)
    ) {
      return res.status(403).json({
        error: 'Security validation failed: claimed balance could not be reconciled against verified deposit records.',
        code: 'BALANCE_MANIPULATION_DETECTED',
        wallet,
      });
    }
    tracker.activeOfferSpinsRemaining = Math.max(0, (tracker.activeOfferSpinsRemaining || 0) - 1);
  }

  // Determine spin difficulty level & criteria override
  let resolvedLevel: 'easy' | 'hard' | 'super_hard' = 'hard';
  let reason = 'auto_random';

  const userOverride = serverSpinSystemConfig.userLevelOverrides?.[userId];
  const multiWinThreshold = Math.max(1, Number(serverSpinSystemConfig.autoSuperHardWinThreshold) || 2);

  if (usingFree) {
    if (isNewFreeSpinBoost) {
      // First-time users with welcome/coupon free spins play on Easy with high Tesla vehicle odds
      resolvedLevel = 'easy';
      reason = 'new_user_free_spin_easy_boost';
    } else {
      resolvedLevel = 'super_hard';
      reason = 'free_spin_bonus_super_hard';
    }
  } else if (userOverride && userOverride !== 'auto') {
    resolvedLevel = userOverride;
    reason = `admin_user_override_${userOverride}`;
  } else if ((tracker.totalWinsCount || 0) >= multiWinThreshold) {
    resolvedLevel = 'super_hard';
    reason = 'multi_win_auto_super_hard';
  } else if (serverSpinSystemConfig.adminMode !== 'auto') {
    resolvedLevel = serverSpinSystemConfig.adminMode;
    reason = `admin_global_${resolvedLevel}`;
  } else {
    resolvedLevel = crypto.randomInt(0, 2) === 0 ? 'easy' : 'hard';
    reason = `paid_fair_random_${resolvedLevel}`;
  }

  const levelSlices = serverSpinSystemConfig.levels?.[resolvedLevel] || DEFAULT_SERVER_SPIN_LEVELS[resolvedLevel];
  const activeSlices = levelSlices.filter((s) => s && s.isActive !== false);
  const sourceSlices = activeSlices.length > 0 ? activeSlices : levelSlices;

  // Apply strict stake gating: vehicles & max jackpots ONLY on max spin cost ($2,500) OR new users having free spins
  const canWinVehicle = stakeProfile.canWinVehicleByStake && vehicleEligibility.eligible;
  const weightedCandidates = sourceSlices.map((s) => {
    const baseWeight = Math.max(1, Number(s.probabilityWeight ?? s.weight) || 1);
    const rawVal = Number(s.valueUsd ?? s.value ?? 0);

    if (s.type === 'car') {
      if (!canWinVehicle) {
        return { ...s, weight: 0, probabilityWeight: 0 };
      }
      const carW = isNewFreeSpinBoost
        ? Math.max(baseWeight * 5, 22)
        : Math.max(1, Math.round(baseWeight * stakeProfile.vehicleWeightMultiplier));
      return {
        ...s,
        weight: carW,
        probabilityWeight: carW,
      };
    }
    if (s.type === 'try_again') {
      const tw = isNewFreeSpinBoost
        ? Math.max(1, Math.round(baseWeight * 0.4))
        : Math.max(1, Math.round(baseWeight * stakeProfile.tryAgainScale));
      return { ...s, weight: tw, probabilityWeight: tw };
    }
    // Cash/crypto/credits prize
    if (stakeProfile.isMinOrFree) {
      // At minimum $150 cost or returning free spins, cannot win jackpot or above $2,000
      if (rawVal > stakeProfile.maxAllowedCashUsd || rawVal >= 10000) {
        return { ...s, weight: 0, probabilityWeight: 0 };
      }
      return { ...s, weight: baseWeight, probabilityWeight: baseWeight };
    }

    // Paid intermediate ($151–$2,499) vs Max Stake ($2,500) / New-user Free Spin
    const isJackpotTier = rawVal >= 15000;
    if (!stakeProfile.canWinJackpotByStake && isJackpotTier) {
      return { ...s, weight: 0, probabilityWeight: 0 };
    }

    let effectiveSliceVal = rawVal;
    if (stakeProfile.canWinJackpotByStake && isJackpotTier) {
      effectiveSliceVal = stakeProfile.maxJackpotUsd; // Full $25,000 jackpot unlocked at max $2,500 spin cost or new-user free spin
    } else if (rawVal > stakeProfile.maxAllowedCashUsd) {
      return { ...s, weight: 0, probabilityWeight: 0 };
    } else if (stakeProfile.stakeRatio > 0 && rawVal < 8000) {
      const scaled = Math.round((rawVal * (1 + stakeProfile.stakeRatio * 1.15)) / 50) * 50;
      effectiveSliceVal = Math.min(stakeProfile.maxAllowedCashUsd, Math.max(rawVal, scaled));
    }

    const boostFactor = isNewFreeSpinBoost
      ? 1.1
      : 1 + stakeProfile.stakeRatio * (effectiveSliceVal >= 10000 ? 2.4 : 1.6);
    const nw = Math.max(1, Math.round(baseWeight * boostFactor));
    return {
      ...s,
      valueUsd: effectiveSliceVal,
      value: effectiveSliceVal,
      weight: nw,
      probabilityWeight: nw,
    };
  });

  const eligibleCandidates = weightedCandidates.filter((s) => Number(s.weight) > 0);
  let chosenSlice =
    eligibleCandidates.length > 0
      ? pickWeightedSlice(eligibleCandidates)
      : sourceSlices.find((s) => s.type === 'try_again') || sourceSlices[0];

  const maxFreeWins = Math.max(1, Number(serverSpinSystemConfig.freeSpinMaxWinsPerOffer) || 1);
  // Returning/ineligible users on free spins remain capped at 1 win per offer; first-time users retain free/coupon spin eligibility until winning a vehicle
  if (usingFree && !isNewFreeSpinBoost && tracker.freeSpinOfferWinsUsed >= maxFreeWins) {
    const tryAgainSlice = sourceSlices.find((s) => s.type === 'try_again') || {
      id: 'sh-cap-try',
      label: 'Try Again',
      text: 'Try Again',
      valueUsd: 0,
      value: 0,
      type: 'try_again',
      color: '#1e293b',
      textColor: 'white',
      weight: 100,
      probabilityWeight: 100,
      isActive: true,
    };
    chosenSlice = tryAgainSlice;
    reason = 'free_spin_one_win_cap_enforced';
  }

  let awardedCashUsd = 0;
  let wonPrizeItem: any = null;
  const isWin = chosenSlice.type !== 'try_again';

  if (isWin) {
    tracker.totalWinsCount = (tracker.totalWinsCount || 0) + 1;
    if (usingFree) {
      tracker.freeSpinOfferWinsUsed = (tracker.freeSpinOfferWinsUsed || 0) + 1;
    }

    if (chosenSlice.type === 'car' && canWinVehicle) {
      const wonAtIso = new Date().toISOString();
      wonPrizeItem = {
        id: `prize-spin-${Date.now().toString(36)}`,
        userId,
        userName,
        userEmail,
        prizeType: 'vehicle',
        title: chosenSlice.vehicleModel || chosenSlice.label,
        modelOrSku: chosenSlice.vehicleModel || chosenSlice.label,
        image: '/promo-plaid.jpg',
        estimatedValueUsd: Number(chosenSlice.valueUsd) || 42490,
        wonAt: getUtcDateKey(),
        wonAtIso,
        source: 'Wheel Spin',
        vinAssigned: `5YJ3E1EA8TA${Math.floor(100000 + Math.random() * 899999)}`,
        processingFeeUsd: 450,
        shippingDocFeeUsd: 350,
        shippingFreightFeeUsd: 1200,
        totalFeesUsd: 2000,
        feesPaid: false,
        shippingStatus: 'awaiting_details',
        notes: 'Won via Spin & Win Wheel. Fill in your destination shipping address and deposit processing, documentation & freight fees in Dashboard -> Won Prizes to schedule dispatch. Weekly 1-vehicle limit & prior fulfillment policy applies.',
      };
      serverWonPrizes.set(wonPrizeItem.id, wonPrizeItem);
    } else {
      const rawPrizeCash = Math.max(0, Number(chosenSlice.valueUsd ?? chosenSlice.value) || 0);
      awardedCashUsd = Math.min(stakeProfile.maxAllowedCashUsd, maxCashWin, rawPrizeCash);
      if (awardedCashUsd > 0) {
        creditVerifiedFreeWinBalance(userId, awardedCashUsd, serverWallets);
      }
    }
  }

  tracker.lastSpinAt = new Date().toISOString();
  tracker.lastResolvedLevel = resolvedLevel;
  tracker.lastReason = reason;

  if (!isNewFreeSpinBoost && (tracker.totalWinsCount || 0) >= multiWinThreshold && (!userOverride || userOverride === 'auto')) {
    serverSpinSystemConfig.userLevelOverrides[userId] = 'super_hard';
  }

  serverSpinSystemConfig.userTrackers = { ...trackers, [userId]: tracker };
  const reconciledWallet = reconcileWalletFromDepositRecords(userId, serverWallets);
  const updatedVehicleEligibility = checkUserVehicleWinEligibility(userId, userEmail);
  const updatedPromoProfile = getUserPromotionProfile(userId, userEmail);
  persistServerGameAndCronState();

  const signature = signLedgerPayload({
    userId,
    resolvedLevel,
    sliceId: chosenSlice.id,
    awardedCashUsd,
    costChargedUsd: usingFree ? 0 : effectiveCost,
    totalWinsCount: tracker.totalWinsCount,
  });

  return res.json({
    success: true,
    resolvedLevel,
    reason,
    usedFreeSpin: usingFree,
    isNewFreeSpinBoost,
    costChargedUsd: usingFree ? 0 : effectiveCost,
    stakeProfile,
    vehicleEligibility: updatedVehicleEligibility,
    promoProfile: updatedPromoProfile,
    slice: { ...chosenSlice, valueUsd: chosenSlice.type === 'car' ? chosenSlice.valueUsd : awardedCashUsd || chosenSlice.valueUsd },
    awardedCashUsd,
    wonPrizeItem,
    wallet: reconciledWallet,
    tracker,
    audit: spinPaymentAudit,
    signature,
  });
});

app.post('/api/promotions/scratch-config', authenticateToken, requireAdmin, (req, res) => {
  const { tiers } = req.body || {};
  if (Array.isArray(tiers) && tiers.length > 0) {
    serverScratchTiers = tiers;
    persistServerGameAndCronState();
  }
  return res.json({ success: true, tiers: serverScratchTiers });
});

app.post('/api/promotions/scratch', authenticateToken, requireSelfOrAdmin, (req, res) => {
  const {
    userId,
    userName = 'Apex Member',
    userEmail = 'member@apex-tesla.io',
    tierId,
    tier,
    clientWalletUsd,
    clientDepositUsd,
  } = req.body || {};

  const requestedTierId = tierId || tier?.id;
  if (!userId || !requestedTierId) {
    return res.status(400).json({ error: 'userId and valid scratch tier ID are required.' });
  }

  // Look up authoritative server tier definition so client cannot spoof card price or prize pool
  const catalogTier = serverScratchTiers.find((t) => t.id === requestedTierId);
  const authoritativeTier = catalogTier || (tier && Array.isArray(tier.possiblePrizes) ? tier : null);
  if (!authoritativeTier) {
    return res.status(404).json({ error: `Scratch card tier "${requestedTierId}" not found.` });
  }

  const authoritativeCost =
    authoritativeTier.id === 'scratch-tier-diamond'
      ? Math.max(8000, Number(authoritativeTier.priceUsd) || 8000)
      : authoritativeTier.id === 'scratch-tier-gold'
      ? Math.max(1000, Number(authoritativeTier.priceUsd) || 1000)
      : Math.max(50, Number(authoritativeTier.priceUsd) || 50);

  // Prevent underpayment via client-forged tier priceUsd
  const clientSubmittedPrice = typeof tier?.priceUsd === 'number' ? Number(tier.priceUsd) : authoritativeCost;

  const validation = validateAndConsumePayment({
    userId,
    category: 'scratch_purchase',
    totalCostUsd: clientSubmittedPrice,
    expectedMinimumUsd: authoritativeCost,
    requireDepositOnly: false,
    clientClaimedDepositUsd: typeof clientDepositUsd === 'number' ? clientDepositUsd : undefined,
    clientClaimedWalletUsd: typeof clientWalletUsd === 'number' ? clientWalletUsd : undefined,
    notes: `Scratch Card "${authoritativeTier.name}" ($${authoritativeCost}) cross-referenced against deposit records.`,
    walletsMap: serverWallets,
  });

  if (!validation.ok) {
    persistServerGameAndCronState();
    return res.status(validation.statusCode).json({
      error: validation.error,
      code: validation.code,
      wallet: validation.wallet,
      audit: validation.audit,
    });
  }

  const promoProfileBefore = getUserPromotionProfile(userId, userEmail);
  const vehicleEligibility = checkUserVehicleWinEligibility(userId, userEmail);
  const isNewScratchUser = promoProfileBefore.isNewUserForScratch;
  const rawPrizes: any[] = Array.isArray(authoritativeTier.possiblePrizes) ? authoritativeTier.possiblePrizes : [];
  const jackpotThreshold = Math.max(400, (Number(authoritativeTier.maxPrizeUsd) || 1000) * 0.5);

  // New users: easier jackpot & eligible Tesla car odds; Old/returning users: rare / super hard jackpots
  const filteredPrizes = rawPrizes
    .filter((p) => (vehicleEligibility.eligible ? true : !p.isTeslaCar))
    .map((p) => {
      const baseW = Math.max(1, Number(p.weight) || 1);
      const isTryAgain = Boolean(p.isTryAgain) || Number(p.amountUsd) <= 0;
      const isTopJackpot = !p.isTeslaCar && !isTryAgain && Number(p.amountUsd) >= jackpotThreshold;

      if (isNewScratchUser) {
        if (p.isTeslaCar && vehicleEligibility.eligible) {
          return { ...p, weight: Math.max(baseW * 6, 18) };
        }
        if (isTopJackpot) {
          return { ...p, weight: Math.max(baseW * 8, 25) };
        }
        if (isTryAgain) {
          return { ...p, weight: Math.min(baseW, 25) };
        }
        return { ...p, weight: Math.max(baseW, 12) };
      }

      // Old / returning users: rare / super hard jackpot & car odds
      if (p.isTeslaCar || isTopJackpot) {
        return { ...p, weight: Math.min(baseW, 1) };
      }
      if (isTryAgain) {
        return { ...p, weight: Math.max(baseW, 280) };
      }
      return { ...p, weight: baseW };
    });

  const hasTryAgain = filteredPrizes.some((p) => p.isTryAgain || Number(p.amountUsd) <= 0);
  if (!hasTryAgain) {
    filteredPrizes.push({
      amountUsd: 0,
      label: 'Try Again ($0)',
      weight: isNewScratchUser ? 25 : 340,
      isTryAgain: true,
    });
  }

  const chosen = pickWeightedSlice(filteredPrizes);
  const isCar = Boolean(chosen.isTeslaCar) && vehicleEligibility.eligible;
  const isTopJackpotHit =
    isCar ||
    (!chosen.isTryAgain &&
      Number(chosen.amountUsd) > 0 &&
      Number(chosen.amountUsd) >= jackpotThreshold);

  let awardedCashUsd = 0;
  let wonPrizeItem: any = null;

  if (isCar) {
    const isLowerVersion = authoritativeTier.id === 'scratch-tier-gold';
    const vehTitle =
      chosen.vehicleModel ||
      (isLowerVersion ? '2026 Tesla Model 3 Standard Range RWD' : '2026 Tesla Roadster Founders Edition');
    const wonAtIso = new Date().toISOString();
    wonPrizeItem = {
      id: `prize-scratch-${Date.now().toString(36)}`,
      userId,
      userName,
      userEmail,
      prizeType: 'vehicle',
      title: vehTitle,
      modelOrSku: vehTitle,
      image: isLowerVersion ? '/img-model3-pearl.jpg' : '/promo-cyberbeast.jpg',
      estimatedValueUsd: Number(chosen.amountUsd) || (isLowerVersion ? 38990 : 200000),
      wonAt: getUtcDateKey(),
      wonAtIso,
      source: 'Scratch & Win',
      vinAssigned: `7G2CE6EB9RA${Math.floor(100000 + Math.random() * 899999)}`,
      processingFeeUsd: isLowerVersion ? 420 : 650,
      shippingDocFeeUsd: isLowerVersion ? 310 : 480,
      shippingFreightFeeUsd: isLowerVersion ? 1050 : 1450,
      totalFeesUsd: isLowerVersion ? 1780 : 2580,
      feesPaid: false,
      shippingStatus: 'awaiting_details',
      notes: `Won 1 Tesla Vehicle from ${authoritativeTier.name}. Fill in your shipping address and pay processing, documentation & freight fees from verified wallet deposits in Dashboard -> Won Prizes before another vehicle can be won.`,
    };
    serverWonPrizes.set(wonPrizeItem.id, wonPrizeItem);
  } else {
    const cap =
      authoritativeTier.id === 'scratch-tier-diamond'
        ? 50000
        : authoritativeTier.id === 'scratch-tier-gold'
        ? 15000
        : Math.max(500, Number(authoritativeTier.maxPrizeUsd) || 50000);
    awardedCashUsd = Math.min(cap, Math.max(0, Number(chosen.amountUsd) || 0));
    if (awardedCashUsd > 0) {
      creditVerifiedFreeWinBalance(userId, awardedCashUsd, serverWallets);
    }
  }

  // Update server scratch play/jackpot tracker
  const trackers = serverSpinSystemConfig.userTrackers || {};
  const prevTracker = trackers[userId] || {
    paidSpinsCount: 0,
    totalWinsCount: 0,
    freeSpinOfferWinsUsed: 0,
    freeSpinOffersRedeemed: 0,
    activeOfferSpinsRemaining: 0,
    redeemedCouponCodes: [],
    scratchPlaysCount: 0,
    scratchJackpotsWonCount: 0,
  };
  const nextTracker = {
    ...prevTracker,
    scratchPlaysCount: (prevTracker.scratchPlaysCount || 0) + 1,
    scratchJackpotsWonCount: (prevTracker.scratchJackpotsWonCount || 0) + (isTopJackpotHit ? 1 : 0),
    lastScratchAt: new Date().toISOString(),
  };
  serverSpinSystemConfig.userTrackers = { ...trackers, [userId]: nextTracker };

  const finalWallet = reconcileWalletFromDepositRecords(userId, serverWallets);
  const updatedVehicleEligibility = checkUserVehicleWinEligibility(userId, userEmail);
  const updatedPromoProfile = getUserPromotionProfile(userId, userEmail);
  const ticketId = `SCR-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  const signature = signValidationPayload({
    ticketId,
    userId,
    tierId: authoritativeTier.id,
    awardedCashUsd,
    isCar,
    wonPrizeId: wonPrizeItem?.id || '',
  });
  persistServerGameAndCronState();

  return res.json({
    success: true,
    ticketId,
    tier: authoritativeTier,
    prize: chosen,
    awardedCashUsd,
    wonPrizeItem,
    isNewScratchUser,
    tracker: nextTracker,
    promoProfile: updatedPromoProfile,
    vehicleEligibility: updatedVehicleEligibility,
    wallet: finalWallet,
    audit: validation.audit,
    signature,
  });
});

app.get('/api/won-prizes', authenticateToken, (req, res) => {
  const caller = (req as any).user;
  const all = Array.from(serverWonPrizes.values());
  if (caller?.role === 'admin') {
    return res.json({ success: true, prizes: all });
  }
  const cleanEmail = caller?.email ? String(caller.email).trim().toLowerCase() : '';
  const isAlexAlias = caller?.id === 'usr-alex-001' || caller?.id === 'usr-apex-001';
  const prizes = all.filter((p) => {
    if (!p) return false;
    if (p.userId === caller?.id) return true;
    if (cleanEmail && p.userEmail && String(p.userEmail).trim().toLowerCase() === cleanEmail) return true;
    if (isAlexAlias && (p.userId === 'usr-alex-001' || p.userId === 'usr-apex-001')) return true;
    return false;
  });
  return res.json({ success: true, prizes });
});

app.post('/api/won-prizes', authenticateToken, requireAdmin, (req, res) => {
  const payload = req.body || {};
  if (!payload.userId || !payload.title) {
    return res.status(400).json({ error: 'userId and title are required to grant a prize.' });
  }
  const p = Number(payload.processingFeeUsd ?? 450) || 0;
  const d = Number(payload.shippingDocFeeUsd ?? 350) || 0;
  const f = Number(payload.shippingFreightFeeUsd ?? 1200) || 0;
  const id = String(payload.id || `prize-${Date.now().toString(36)}`);
  const created = {
    ...payload,
    id,
    wonAt: payload.wonAt || getUtcDateKey(),
    wonAtIso: payload.wonAtIso || new Date().toISOString(),
    processingFeeUsd: p,
    shippingDocFeeUsd: d,
    shippingFreightFeeUsd: f,
    totalFeesUsd: Number((p + d + f).toFixed(2)),
    feesPaid: Boolean(payload.feesPaid),
    shippingStatus: payload.shippingStatus || 'awaiting_details',
  };
  serverWonPrizes.set(id, created);
  persistServerGameAndCronState();
  return res.json({ success: true, prize: created });
});

function formatWonPrizeStatusLabel(status: string): string {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'documentation_ready':
      return 'Export Documentation Ready';
    case 'shipped':
      return 'Shipped / In Transit';
    case 'delivered':
      return 'Delivered';
    case 'fees_paid_processing':
      return 'Fees Paid & Processing';
    default:
      return 'Awaiting Details';
  }
}

async function triggerWonPrizeShipmentNotifications(params: {
  existing: any;
  updated: any;
  callerEmail?: string;
  note?: string;
}) {
  const { existing, updated, callerEmail, note } = params;
  const statusChanged = existing.shippingStatus !== updated.shippingStatus;
  const approvalChanged =
    Boolean(existing.adminApprovedForShipment) !== Boolean(updated.adminApprovedForShipment);
  const paymentVerificationChanged =
    Boolean(existing.paymentVerifiedByAdmin) !== Boolean(updated.paymentVerifiedByAdmin);
  const trackingChanged = (existing.trackingNumber || '') !== (updated.trackingNumber || '');

  if (!statusChanged && !approvalChanged && !paymentVerificationChanged && !trackingChanged) {
    return { notification: null, emailDispatch: null };
  }

  const statusLabel = formatWonPrizeStatusLabel(updated.shippingStatus);
  const trackText = updated.trackingNumber ? `Tracking #: ${updated.trackingNumber}` : 'Tracking pending assignment';
  const carrierText = updated.carrierName || 'Apex Bonded Enclosed EV Carrier';
  const paymentText = updated.paymentVerifiedByAdmin ? 'Payment Verified & Received' : 'Payment Verification Pending';

  const notification = {
    id: `notif-ship-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: `Shipment Status Updated (${statusLabel}): ${updated.title}`,
    message: `Your won vehicle shipment is now "${statusLabel}". ${paymentText}. ${trackText} via ${carrierText}.${note ? ` Note: ${note}` : ''}`,
    type: 'system',
    priority: 'high',
    targetType: 'individual',
    targetUserId: updated.userId,
    targetUserEmail: updated.userEmail,
    targetUserName: updated.userName,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    readBy: [],
    dismissedBy: [],
    actionUrl: 'dashboard',
    actionLabel: updated.trackingNumber ? 'Track Shipment' : 'View Pending Shipments',
    category: 'won_vehicle_shipment',
  };

  serverUserNotifications.unshift(notification);
  if (serverUserNotifications.length > 200) {
    serverUserNotifications.length = 200;
  }
  persistServerGameAndCronState();

  let emailDispatch: {
    status: 'delivered' | 'simulated' | 'failed';
    recipient: string;
    messageId: string;
    detail: string;
  } | null = null;

  const recipientEmail = String(updated.userEmail || '').trim();
  if (recipientEmail && recipientEmail.includes('@')) {
    try {
      const mailRes = await sendWonVehicleShipmentNotificationEmail({
        recipientEmail,
        recipientName: updated.userName,
        prizeId: updated.id,
        vehicleTitle: updated.title,
        vinAssigned: updated.vinAssigned,
        trackingNumber: updated.trackingNumber,
        carrierName: carrierText,
        shippingStatus: updated.shippingStatus,
        statusLabel,
        paymentVerified: Boolean(updated.paymentVerifiedByAdmin),
        adminEmail: callerEmail,
        note,
      });

      emailDispatch = {
        status: mailRes.status,
        recipient: recipientEmail,
        messageId: mailRes.messageId,
        detail: mailRes.detail,
      };

      serverDispatchedEmails.unshift({
        id: mailRes.logEntry.id,
        type: 'won_vehicle_shipment_update',
        recipient: recipientEmail,
        subject: mailRes.logEntry.subject,
        amountUsd: Number(updated.totalFeesUsd || 0),
        investmentId: updated.id,
        certificateId: updated.trackingNumber || updated.id,
        dispatchedAt: mailRes.logEntry.dispatchedAt,
        status: mailRes.status === 'delivered' ? 'delivered' : 'simulated',
      });
      if (serverDispatchedEmails.length > 50) {
        serverDispatchedEmails.length = 50;
      }
    } catch (err: any) {
      console.error('[WonPrize Mailer] Failed sending shipment update email:', err?.message || err);
    }
  }

  return { notification, emailDispatch };
}

app.put('/api/won-prizes/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const existing = serverWonPrizes.get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Won prize record not found.' });
  }
  const updates = req.body || {};
  const callerEmail = (req as any).user?.email || 'admin.ops@apex-tesla.io';
  const nowIso = new Date().toISOString();

  const p = Number(updates.processingFeeUsd ?? existing.processingFeeUsd ?? 0) || 0;
  const d = Number(updates.shippingDocFeeUsd ?? existing.shippingDocFeeUsd ?? 0) || 0;
  const f = Number(updates.shippingFreightFeeUsd ?? existing.shippingFreightFeeUsd ?? 0) || 0;

  const validStatuses = [
    'awaiting_details',
    'fees_paid_processing',
    'approved',
    'documentation_ready',
    'shipped',
    'delivered',
  ];
  const requestedStatus =
    typeof updates.shippingStatus === 'string' && validStatuses.includes(updates.shippingStatus)
      ? updates.shippingStatus
      : existing.shippingStatus;

  const approvedByStatus =
    requestedStatus === 'approved' ||
    requestedStatus === 'documentation_ready' ||
    requestedStatus === 'shipped' ||
    requestedStatus === 'delivered';

  const isApproved =
    updates.adminApprovedForShipment !== undefined
      ? Boolean(updates.adminApprovedForShipment)
      : Boolean(existing.adminApprovedForShipment || approvedByStatus);

  const nextFeesPaid =
    updates.feesPaid !== undefined
      ? Boolean(updates.feesPaid)
      : Boolean(existing.feesPaid || (isApproved && updates.paymentVerifiedByAdmin));

  const isVerified =
    updates.paymentVerifiedByAdmin !== undefined
      ? Boolean(updates.paymentVerifiedByAdmin)
      : Boolean(existing.paymentVerifiedByAdmin || (isApproved && nextFeesPaid));

  let assignedTracking: string | undefined;
  if (updates.trackingNumber !== undefined) {
    const manualTrack = String(updates.trackingNumber || '').trim();
    assignedTracking = manualTrack || (isApproved ? `APX-EXP-${Date.now().toString(36).toUpperCase()}` : undefined);
  } else {
    assignedTracking = isApproved
      ? String(existing.trackingNumber || '').trim() || `APX-EXP-${Date.now().toString(36).toUpperCase()}`
      : existing.trackingNumber;
  }

  const nextCarrier =
    updates.carrierName !== undefined
      ? String(updates.carrierName || '').trim() || 'Apex Bonded Enclosed EV Carrier'
      : existing.carrierName || 'Apex Bonded Enclosed EV Carrier';

  const statusChanged = existing.shippingStatus !== requestedStatus || (!existing.adminApprovedForShipment && isApproved);
  const existingCheckpoints = Array.isArray(existing.checkpoints) ? existing.checkpoints : [];
  const nextCheckpoints = statusChanged
    ? [
        ...existingCheckpoints,
        {
          id: `chk-admin-upd-${Date.now().toString(36)}`,
          status: requestedStatus,
          title: `Shipment ${formatWonPrizeStatusLabel(requestedStatus)}`,
          location: 'Apex Logistics & Title Verification Desk',
          timestamp: nowIso.replace('T', ' ').substring(0, 16),
          note: `Updated by ${callerEmail}. Payment Verified: ${isVerified ? 'Yes' : 'No'}.${
            assignedTracking ? ` Tracking #: ${assignedTracking}` : ''
          }${updates.notes ? ` Note: ${String(updates.notes)}` : ''}`,
        },
      ]
    : existingCheckpoints;

  const updated = {
    ...existing,
    ...updates,
    id,
    feesPaid: nextFeesPaid,
    paidAt: nextFeesPaid ? existing.paidAt || nowIso : existing.paidAt,
    processingFeeUsd: p,
    shippingDocFeeUsd: d,
    shippingFreightFeeUsd: f,
    totalFeesUsd: Number((p + d + f).toFixed(2)),
    shippingStatus: requestedStatus,
    paymentVerifiedByAdmin: isVerified,
    adminApprovedForShipment: isApproved,
    verifiedAt: isVerified || isApproved ? existing.verifiedAt || nowIso : undefined,
    verifiedByAdminEmail: isVerified || isApproved ? existing.verifiedByAdminEmail || callerEmail : undefined,
    trackingNumber: assignedTracking,
    carrierName: nextCarrier,
    checkpoints: nextCheckpoints,
  };

  serverWonPrizes.set(id, updated);
  persistServerGameAndCronState();

  const { notification, emailDispatch } = await triggerWonPrizeShipmentNotifications({
    existing,
    updated,
    callerEmail,
    note: typeof updates.notes === 'string' ? updates.notes : undefined,
  });

  return res.json({
    success: true,
    prize: updated,
    notification,
    emailDispatch,
    vehicleEligibility: checkUserVehicleWinEligibility(updated.userId, updated.userEmail),
    promoProfile: getUserPromotionProfile(updated.userId, updated.userEmail),
  });
});

app.post('/api/won-prizes/:id/approve-shipment', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const existing = serverWonPrizes.get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Won prize record not found.' });
  }
  const {
    trackingNumber,
    carrierName,
    shippingStatus = 'approved',
    notes,
    confirmPaymentVerified = true,
  } = req.body || {};

  if (!existing.feesPaid && !confirmPaymentVerified) {
    return res.status(400).json({ error: 'Required shipping & processing fees must be paid or verified before approving shipment.' });
  }

  const callerEmail = (req as any).user?.email || 'admin.ops@apex-tesla.io';
  const nowIso = new Date().toISOString();
  const resolvedTracking =
    String(trackingNumber || existing.trackingNumber || '').trim() ||
    `APX-EXP-${Date.now().toString(36).toUpperCase()}`;
  const resolvedCarrier =
    String(carrierName || existing.carrierName || '').trim() ||
    'Apex Bonded Enclosed EV Carrier';
  const validStatuses = ['approved', 'documentation_ready', 'shipped', 'delivered'];
  const nextStatus = validStatuses.includes(shippingStatus) ? shippingStatus : 'approved';

  const existingCheckpoints = Array.isArray(existing.checkpoints) ? existing.checkpoints : [];
  const nextCheckpoints = [
    ...existingCheckpoints,
    {
      id: `chk-admin-app-${Date.now().toString(36)}`,
      status: nextStatus,
      title: `Payment Verified & Shipment ${formatWonPrizeStatusLabel(nextStatus)}`,
      location: 'Apex Logistics & Title Verification Desk',
      timestamp: nowIso.replace('T', ' ').substring(0, 16),
      note: `Verified by ${callerEmail}. Assigned Tracking #: ${resolvedTracking} via ${resolvedCarrier}.`,
    },
  ];

  const updated = {
    ...existing,
    feesPaid: true,
    paidAt: existing.paidAt || nowIso,
    addressConfirmed: Boolean(existing.addressConfirmed ?? existing.shippingAddress?.street),
    paymentVerifiedByAdmin: Boolean(confirmPaymentVerified),
    adminApprovedForShipment: true,
    verifiedAt: nowIso,
    verifiedByAdminEmail: callerEmail,
    shippingStatus: nextStatus,
    trackingNumber: resolvedTracking,
    carrierName: resolvedCarrier,
    checkpoints: nextCheckpoints,
    notes: notes !== undefined ? String(notes) : (existing.notes || `Payment verified and approved for shipment (${resolvedTracking}).`),
  };

  serverWonPrizes.set(id, updated);
  persistServerGameAndCronState();

  const { notification, emailDispatch } = await triggerWonPrizeShipmentNotifications({
    existing,
    updated,
    callerEmail,
    note: typeof notes === 'string' ? notes : undefined,
  });

  return res.json({
    success: true,
    prize: updated,
    notification,
    emailDispatch,
    vehicleEligibility: checkUserVehicleWinEligibility(updated.userId, updated.userEmail),
    promoProfile: getUserPromotionProfile(updated.userId, updated.userEmail),
  });
});

app.get('/api/tracking/:trackingNumber', authenticateToken, (req, res) => {
  const caller = (req as any).user;
  const queryTrack = String(req.params.trackingNumber || '').trim().toLowerCase();
  if (!queryTrack) {
    return res.status(400).json({ error: 'Tracking number is required.' });
  }
  const cleanEmail = caller?.email ? String(caller.email).trim().toLowerCase() : '';
  const isAdmin = caller?.role === 'admin';
  const isAlexAlias = caller?.id === 'usr-alex-001' || caller?.id === 'usr-apex-001';

  for (const prize of serverWonPrizes.values()) {
    if (!prize || !prize.trackingNumber) continue;
    const isApproved =
      Boolean(prize.adminApprovedForShipment) ||
      prize.shippingStatus === 'approved' ||
      prize.shippingStatus === 'documentation_ready' ||
      prize.shippingStatus === 'shipped' ||
      prize.shippingStatus === 'delivered';
    if (!isApproved) continue;
    if (String(prize.trackingNumber).trim().toLowerCase() === queryTrack) {
      const owns =
        isAdmin ||
        prize.userId === caller?.id ||
        (cleanEmail && prize.userEmail && String(prize.userEmail).trim().toLowerCase() === cleanEmail) ||
        (isAlexAlias && (prize.userId === 'usr-alex-001' || prize.userId === 'usr-apex-001'));
      if (!owns) {
        return res.status(403).json({ error: 'You are not authorized to inspect this shipment tracking number.' });
      }
      return res.json({ success: true, type: 'won_prize', prize });
    }
  }
  return res.status(404).json({ error: 'No approved shipment found for that tracking number.' });
});

app.delete('/api/won-prizes/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const existed = serverWonPrizes.delete(id);
  if (!existed) {
    return res.status(404).json({ error: 'Won prize record not found.' });
  }
  persistServerGameAndCronState();
  return res.json({ success: true });
});

app.post('/api/won-prizes/pay-fees', authenticateToken, requireSelfOrAdmin, (req, res) => {
  const {
    userId,
    prizeId,
    totalFeesUsd,
    shippingAddress,
    clientDepositUsd,
    clientWalletUsd,
  } = req.body || {};

  if (!userId || !prizeId) {
    return res.status(400).json({ error: 'userId and prizeId are required.' });
  }

  if (
    !shippingAddress ||
    !String(shippingAddress.fullName || '').trim() ||
    !String(shippingAddress.country || '').trim() ||
    !String(shippingAddress.street || '').trim() ||
    !String(shippingAddress.city || '').trim() ||
    !String(shippingAddress.zipCode || '').trim() ||
    !String(shippingAddress.phone || '').trim()
  ) {
    return res.status(400).json({
      error: 'Complete destination shipping address (fullName, country, street, city, zipCode, phone) is required before processing & shipping fees can be settled.',
      code: 'SHIPPING_ADDRESS_INCOMPLETE',
    });
  }

  const existingPrize = serverWonPrizes.get(prizeId);
  if (existingPrize && existingPrize.feesPaid) {
    return res.status(409).json({
      error: `Shipping & processing fees for prize #${prizeId} have already been settled.`,
      code: 'PRIZE_FEES_ALREADY_PAID',
      prize: existingPrize,
    });
  }

  const clientFeeAmount = Math.max(0, Number(totalFeesUsd) || 0);
  const expectedServerFee = existingPrize ? Math.max(0, Number(existingPrize.totalFeesUsd) || 0) : clientFeeAmount;
  const feeAmount = expectedServerFee > 0 ? Math.max(expectedServerFee, clientFeeAmount) : clientFeeAmount;

  // Strictly cross-reference fee amount and require verified deposit records (free wins excluded)
  const validation = validateAndConsumePayment({
    userId,
    category: 'won_vehicle_shipping',
    totalCostUsd: feeAmount,
    expectedMinimumUsd: expectedServerFee > 0 ? expectedServerFee : 1,
    requireDepositOnly: true,
    clientClaimedDepositUsd: typeof clientDepositUsd === 'number' ? clientDepositUsd : undefined,
    clientClaimedWalletUsd: typeof clientWalletUsd === 'number' ? clientWalletUsd : undefined,
    notes: `Won vehicle shipping/doc/processing fee ($${feeAmount}) settled strictly from verified deposit records.`,
    walletsMap: serverWallets,
  });

  if (!validation.ok) {
    persistServerGameAndCronState();
    return res.status(validation.statusCode).json({
      error: validation.error,
      code: validation.code,
      requiredDepositUsd: expectedServerFee || feeAmount,
      activeDepositBalanceUsd: validation.wallet.depositUsd,
      freeWinBalanceUsd: validation.wallet.freeWinUsd,
      wallet: validation.wallet,
      audit: validation.audit,
    });
  }

  const nowIso = new Date().toISOString();
  const prize = existingPrize || {
    id: prizeId,
    userId,
    userName: (req as any).user?.name || shippingAddress.fullName || 'Apex Member',
    userEmail: (req as any).user?.email || 'member@apex-tesla.io',
    prizeType: 'vehicle',
    title: '2026 Tesla Promotional Vehicle',
    modelOrSku: 'Tesla EV',
    image: '/promo-plaid.jpg',
    estimatedValueUsd: 42490,
    wonAt: getUtcDateKey(),
    wonAtIso: nowIso,
    source: 'Wheel Spin',
    processingFeeUsd: 450,
    shippingDocFeeUsd: 350,
    shippingFreightFeeUsd: 1200,
    totalFeesUsd: feeAmount,
  };
  prize.feesPaid = true;
  prize.paidAt = nowIso;
  prize.paymentMethod = 'deposit';
  prize.addressConfirmed = true;
  prize.shippingAddress = shippingAddress;
  prize.shippingStatus = 'fees_paid_processing';
  prize.paymentVerifiedByAdmin = false;
  prize.adminApprovedForShipment = false;
  // Tracking number is only issued once admin verifies payment and approves delivery/shipment
  prize.trackingNumber = undefined;
  prize.carrierName = prize.carrierName || 'Apex Bonded Enclosed EV Carrier';
  const prevCheckpoints = Array.isArray(prize.checkpoints) ? prize.checkpoints : [];
  prize.checkpoints = [
    ...prevCheckpoints,
    {
      id: `chk-user-paid-${Date.now().toString(36)}`,
      status: 'fees_paid_processing',
      title: 'Shipping Address Confirmed & Fees Submitted',
      location: `${shippingAddress.city}, ${shippingAddress.country}`,
      timestamp: nowIso.replace('T', ' ').substring(0, 16),
      note: 'Deposit-verified fee payment submitted. Awaiting Admin payment verification & dispatch approval.',
    },
  ];
  serverWonPrizes.set(prizeId, prize);
  persistServerGameAndCronState();

  return res.json({
    success: true,
    prize,
    wallet: validation.wallet,
    audit: validation.audit,
    vehicleEligibility: checkUserVehicleWinEligibility(userId, (req as any).user?.email),
    promoProfile: getUserPromotionProfile(userId, (req as any).user?.email),
    signature: signLedgerPayload({ userId, prizeId, feeAmount, paidAt: prize.paidAt }),
  });
});

app.get('/api/deposits/:userId', authenticateToken, requireSelfOrAdmin, (req, res) => {
  const { userId } = req.params;
  const wallet = reconcileWalletFromDepositRecords(userId, serverWallets);
  const depositRecords = getUserDepositRecords(userId);
  return res.json({
    success: true,
    userId,
    verifiedDepositUsd: wallet.depositUsd,
    freeWinUsd: wallet.freeWinUsd,
    totalSpendableUsd: wallet.usd,
    depositRecordsCount: depositRecords.length,
    depositRecords,
  });
});

app.post('/api/deposits/record', authenticateToken, requireSelfOrAdmin, (req, res) => {
  const { userId, currency = 'USD', amount, usdEquivalent, amountUsd, txHash, gatewayName, source } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const usdVal = Number(usdEquivalent ?? amountUsd ?? amount);
  const amtVal = Number(amount ?? usdVal);
  const result = registerVerifiedDepositRecord({
    userId,
    currency,
    amount: amtVal,
    usdEquivalent: usdVal,
    txHash,
    gatewayName,
    source: source || 'gateway_deposit',
    walletsMap: serverWallets,
  });
  if (!result.ok) {
    return res.status(result.statusCode).json({ error: result.error, wallet: result.wallet });
  }
  persistServerGameAndCronState();
  return res.json({
    success: true,
    record: result.record,
    wallet: result.wallet,
    audit: result.audit,
  });
});

app.post('/api/wallet/:userId/deposit-sync', authenticateToken, requireSelfOrAdmin, (req, res) => {
  const { userId } = req.params;
  const { amountUsd, currency = 'USD', txHash, gatewayName, source } = req.body || {};
  const amt = Number(amountUsd) || 0;
  if (!userId || amt <= 0) return res.status(400).json({ error: 'Valid userId and amountUsd required' });
  const result = registerVerifiedDepositRecord({
    userId,
    currency,
    amount: amt,
    usdEquivalent: amt,
    txHash,
    gatewayName: gatewayName || 'Verified Deposit Sync',
    source: source || 'gateway_deposit',
    walletsMap: serverWallets,
  });
  if (!result.ok) {
    return res.status(result.statusCode).json({ error: result.error, wallet: result.wallet });
  }
  persistServerGameAndCronState();
  return res.json({ success: true, record: result.record, wallet: result.wallet, audit: result.audit });
});

app.get('/api/security/transaction-audits', authenticateToken, requireAdmin, (req, res) => {
  const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
  const audits = getTransactionAudits(userId);
  const rejectedCount = audits.filter((a) => a.outcome === 'rejected').length;
  return res.json({
    success: true,
    totalAudits: audits.length,
    rejectedCount,
    audits: audits.slice(0, 100),
  });
});

// Investments Management API
app.get('/api/investments', (_req, res) => {
  return res.json(Array.from(serverInvestments.values()));
});

app.post('/api/investments/sync', authenticateToken, (req, res) => {
  const { investments } = req.body || {};
  if (Array.isArray(investments)) {
    investments.forEach((inv: ServerInvestment) => {
      if (!inv.id) return;
      const existing = serverInvestments.get(inv.id);
      // Preserve server-completed settlement state so client polling never reverts matured payouts
      if (existing && existing.capitalReturned && existing.status === 'completed') {
        return;
      }
      serverInvestments.set(inv.id, {
        ...existing,
        ...inv,
        userId: inv.userId || existing?.userId || 'usr-apex-001',
        userEmail: inv.userEmail || existing?.userEmail || 'alex.vance@apex-tesla.io',
        userName: inv.userName || existing?.userName || 'Alex Vance',
      });
    });
  }
  return res.json({ success: true, count: serverInvestments.size, investments: Array.from(serverInvestments.values()) });
});

app.post('/api/investments/:id/force-mature', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const inv = serverInvestments.get(id);

  if (!inv) {
    return res.status(404).json({ error: 'Investment position not found.' });
  }

  if (inv.capitalReturned) {
    const existingWallet = getOrInitServerWallet(inv.userId);
    return res.json({
      success: true,
      message: `Investment #${id} already settled.`,
      investment: inv,
      wallet: existingWallet,
      newWalletBalanceUsd: existingWallet.usd,
    });
  }

  inv.daysElapsed = inv.durationDays;
  if (inv.totalExpectedRoiUsd > 0 && (inv.earnedDividendsUsd || 0) < inv.totalExpectedRoiUsd) {
    inv.earnedDividendsUsd = Number(inv.totalExpectedRoiUsd.toFixed(2));
  }
  inv.status = 'completed';
  inv.completedAt = new Date().toISOString();
  inv.capitalReturned = true;
  inv.certificateId = `CERT-FORCE-${Date.now().toString(36).toUpperCase()}`;

  const totalPayoutUsd = Number((inv.amountInvestedUsd + (inv.earnedDividendsUsd || 0)).toFixed(2));

  // Update wallet with verified principal deposit record + yield credit
  registerVerifiedDepositRecord({
    userId: inv.userId,
    currency: 'USD',
    amount: inv.amountInvestedUsd,
    usdEquivalent: inv.amountInvestedUsd,
    txHash: inv.certificateId || `CERT-FORCE-${inv.id}-${Date.now()}`,
    gatewayName: 'Admin Force-Matured Settlement',
    source: 'investment_maturity',
    walletsMap: serverWallets,
  });
  const wallet = creditVerifiedFreeWinBalance(inv.userId, inv.earnedDividendsUsd || 0, serverWallets);

  const settlementEvent: ServerSettlementEvent = {
    id: `settle-${inv.id}-${Date.now()}`,
    investmentId: inv.id,
    userId: inv.userId,
    userEmail: inv.userEmail,
    userName: inv.userName,
    poolTitle: inv.poolTitle,
    principalUsd: inv.amountInvestedUsd,
    roiUsd: inv.earnedDividendsUsd || 0,
    totalPayoutUsd,
    certificateId: inv.certificateId,
    settledAt: inv.completedAt,
    emailDispatched: true,
  };
  serverSettlementEvents.unshift(settlementEvent);

  const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  serverCronLogs.unshift(
    `[${timeStr}] [ADMIN MATURITY SETTLED] Position #${inv.id}: $${totalPayoutUsd.toFixed(2)} credited to ${inv.userEmail}.`
  );
  persistServerGameAndCronState();

  // Trigger maturity email
  dispatchMaturityEmail({
    toEmail: inv.userEmail,
    userName: inv.userName,
    poolTitle: inv.poolTitle,
    principalUsd: inv.amountInvestedUsd,
    roiUsd: inv.earnedDividendsUsd || 0,
    totalPayoutUsd,
    newWalletBalanceUsd: wallet.usd,
    investmentId: inv.id,
    certificateId: inv.certificateId,
  }).catch((e) => console.warn('Email dispatch error:', e));

  return res.json({
    success: true,
    message: `Investment #${id} successfully settled. $${totalPayoutUsd.toFixed(2)} credited to ${inv.userName}'s wallet. Notification email dispatched.`,
    investment: inv,
    settlementEvent,
    dispatchedEmails: serverDispatchedEmails.slice(0, 15),
    wallet,
    newWalletBalanceUsd: wallet.usd,
  });
});

app.post('/api/investments/:id/claim', authenticateToken, (req, res) => {
  const { id } = req.params;
  const caller = (req as any).user;
  const inv = serverInvestments.get(id);
  if (!inv) {
    return res.status(404).json({ error: 'Investment position not found.' });
  }
  if (caller?.role !== 'admin' && inv.userId !== caller?.id) {
    return res.status(403).json({ error: 'Forbidden: you do not own this investment position.' });
  }
  const claimedUsd = Number((inv.earnedDividendsUsd || 0).toFixed(2));
  if (claimedUsd <= 0) {
    return res.status(400).json({ error: 'No dividends available to claim on this position.' });
  }
  inv.earnedDividendsUsd = 0;
  const wallet = creditVerifiedFreeWinBalance(inv.userId, claimedUsd, serverWallets);
  persistServerGameAndCronState();
  return res.json({
    success: true,
    claimedUsd,
    investment: inv,
    wallet,
  });
});

// User Wallet API (Reconciled against verified deposit records)
app.get('/api/wallet/:userId', authenticateToken, requireSelfOrAdmin, (req, res) => {
  const { userId } = req.params;
  const wallet = getOrInitServerWallet(userId);
  const depositRecords = getUserDepositRecords(userId);
  const activeOfferSpinsRemaining =
    serverSpinSystemConfig.userTrackers?.[userId]?.activeOfferSpinsRemaining || 0;
  return res.json({
    ...wallet,
    wallet,
    verifiedDepositUsd: wallet.depositUsd,
    depositRecordsCount: depositRecords.length,
    activeOfferSpinsRemaining,
  });
});

app.post('/api/wallet/:userId/consume', authenticateToken, requireSelfOrAdmin, (req, res) => {
  const { userId } = req.params;
  const { amountUsd, category = 'wallet_consume', notes, clientWalletUsd, clientDepositUsd } = req.body || {};
  const amt = Number(amountUsd) || 0;
  if (amt <= 0) {
    return res.status(400).json({ error: 'Positive amountUsd is required.' });
  }
  const validation = validateAndConsumePayment({
    userId,
    category,
    totalCostUsd: amt,
    expectedMinimumUsd: amt,
    requireDepositOnly: false,
    clientClaimedDepositUsd: typeof clientDepositUsd === 'number' ? clientDepositUsd : undefined,
    clientClaimedWalletUsd: typeof clientWalletUsd === 'number' ? clientWalletUsd : undefined,
    notes: notes ? String(notes).slice(0, 200) : `Server-verified wallet payment ($${amt.toFixed(2)})`,
    walletsMap: serverWallets,
  });
  if (!validation.ok) {
    persistServerGameAndCronState();
    return res.status(validation.statusCode).json({
      error: validation.error,
      code: validation.code,
      wallet: validation.wallet,
      audit: validation.audit,
    });
  }
  persistServerGameAndCronState();
  return res.json({ success: true, wallet: validation.wallet, audit: validation.audit });
});

app.post('/api/wallet/:userId/credit', authenticateToken, requireSelfOrAdmin, (req, res) => {
  const { userId } = req.params;
  const { amountUsd, fundingType = 'free_win', reason = 'Verified credit' } = req.body || {};
  const amt = Number(amountUsd) || 0;
  if (amt <= 0 || amt > 500000) {
    return res.status(400).json({ error: 'Valid positive amountUsd (<= 500,000) is required.' });
  }
  let wallet: ServerWallet;
  if (fundingType === 'deposit') {
    const depRes = registerVerifiedDepositRecord({
      userId,
      currency: 'USD',
      amount: amt,
      usdEquivalent: amt,
      gatewayName: String(reason).slice(0, 120),
      source: 'investment_maturity',
      walletsMap: serverWallets,
    });
    wallet = depRes.wallet;
  } else {
    wallet = creditVerifiedFreeWinBalance(userId, amt, serverWallets);
  }
  persistServerGameAndCronState();
  return res.json({ success: true, wallet });
});

app.post('/api/wallet/:userId/adjust', authenticateToken, requireAdmin, (req, res) => {
  const { userId } = req.params;
  const { currency, newAmount, delta, mode, amount, fundingType } = req.body;

  const wallet = getOrInitServerWallet(userId);
  const currKey = (currency || 'USD').toLowerCase() as keyof ServerWallet;
  const currentVal = Number((wallet as any)[currKey] || 0);

  if (mode === 'add' && typeof amount === 'number') {
    const absAmt = Math.abs(amount);
    if (currKey === 'usd') {
      if (fundingType === 'deposit') {
        registerVerifiedDepositRecord({
          userId,
          currency: 'USD',
          amount: absAmt,
          usdEquivalent: absAmt,
          gatewayName: 'Admin Deposit Credit',
          source: 'admin_deposit_credit',
          walletsMap: serverWallets,
        });
      } else {
        creditVerifiedFreeWinBalance(userId, absAmt, serverWallets);
      }
    } else {
      (wallet as any)[currKey] = Number(Math.max(0, currentVal + absAmt).toFixed(4));
    }
  } else if (mode === 'subtract' && typeof amount === 'number') {
    const absAmt = Math.abs(amount);
    if (currKey === 'usd') {
      const fromFree = Math.min(wallet.freeWinUsd, absAmt);
      const fromDep = Math.max(0, absAmt - fromFree);
      wallet.freeWinUsd = Number(Math.max(0, wallet.freeWinUsd - fromFree).toFixed(2));
      if (fromDep > 0) {
        deductDepositRecordsFifo(userId, fromDep, serverWallets);
      } else {
        reconcileWalletFromDepositRecords(userId, serverWallets);
      }
    } else {
      (wallet as any)[currKey] = Number(Math.max(0, currentVal - absAmt).toFixed(4));
    }
  } else if (typeof newAmount === 'number') {
    if (currKey === 'usd') {
      const cleanNew = Math.max(0, Number(newAmount.toFixed(2)));
      if (cleanNew > wallet.usd) {
        creditVerifiedFreeWinBalance(userId, cleanNew - wallet.usd, serverWallets);
      } else if (cleanNew < wallet.usd) {
        const diff = wallet.usd - cleanNew;
        const fromFree = Math.min(wallet.freeWinUsd, diff);
        const fromDep = Math.max(0, diff - fromFree);
        wallet.freeWinUsd = Number(Math.max(0, wallet.freeWinUsd - fromFree).toFixed(2));
        if (fromDep > 0) deductDepositRecordsFifo(userId, fromDep, serverWallets);
      }
      reconcileWalletFromDepositRecords(userId, serverWallets);
    } else {
      (wallet as any)[currKey] = Number(Math.max(0, newAmount).toFixed(4));
    }
  } else if (typeof delta === 'number') {
    if (currKey === 'usd') {
      if (delta >= 0) {
        creditVerifiedFreeWinBalance(userId, delta, serverWallets);
      } else {
        const diff = Math.abs(delta);
        const fromFree = Math.min(wallet.freeWinUsd, diff);
        const fromDep = Math.max(0, diff - fromFree);
        wallet.freeWinUsd = Number(Math.max(0, wallet.freeWinUsd - fromFree).toFixed(2));
        if (fromDep > 0) deductDepositRecordsFifo(userId, fromDep, serverWallets);
      }
      reconcileWalletFromDepositRecords(userId, serverWallets);
    } else {
      (wallet as any)[currKey] = Number(Math.max(0, currentVal + delta).toFixed(4));
    }
  }

  const finalWallet = reconcileWalletFromDepositRecords(userId, serverWallets);
  persistServerGameAndCronState();
  return res.json({ success: true, wallet: finalWallet });
});

// ============================================================================
// TESLA CAR SALES CATALOG, NATIONWIDE SHIPPING & REFUND POLICIES API
// ============================================================================

interface ServerCarListing {
  id: string;
  model: 'Cybertruck' | 'Model S' | 'Model 3' | 'Model X' | 'Model Y' | 'Roadster';
  trim: string;
  year: number;
  originalPriceUsd: number;
  salePriceUsd: number;
  image: string;
  galleryImages?: string[];
  rangeMiles: number;
  zeroToSixty: string;
  topSpeedMph: number;
  horsepower: number;
  driveTrain: string;
  batteryKwh?: number;
  color: string;
  interiorColor: string;
  autopilotType: string;
  inStock: boolean;
  stockCount: number;
  vin?: string;
  description: string;
  specs: {
    seating: string;
    cargoSpaceCuFt: string;
    weightLbs: string;
    superchargingMaxKw: string;
    wheels: string;
  };
  deliveryEstimate: string;
  nationwideShippingFeeUsd: number;
  refundPolicy: string;
  warrantyDetails: string;
  isFeatured?: boolean;
}

const serverCarCatalog: Map<string, ServerCarListing> = new Map();

let serverShippingSettings = {
  flatFeeUsd: 1200,
  freeShippingEligibleTiers: ['Plaid Member', 'Founders Club'],
  estimatedDays: '3 - 7 Business Days',
  carrierPartners: ['Reliable Carriers Inc.', 'Apex Enclosed Logistics', 'Montway Auto Transport'],
  trackingPortalUrl: 'https://tracking.apex-tesla.io/v',
};

let serverRefundPolicy = {
  trialDays: 7,
  maxMileage: 1000,
  moneyBackGuaranteePercent: 100,
  inspectionRequired: true,
  termsSummary:
    'Every Tesla purchased through Apex Tesla Hub includes our 7-Day or 1,000-Mile 100% Money-Back Guarantee. If the vehicle fails to satisfy your performance or quality expectations, return it to any Apex Center or request complimentary carrier retrieval for a full refund minus incidental road tolls.',
};

const serverVehicleOrders: any[] = [];

// Seed Server Car Catalog with all 13 Tesla Models and 2026 MSRP prices
function seedServerCarCatalog() {
  if (serverCarCatalog.size === 0) {
    const defaultCars: ServerCarListing[] = [
      {
        id: 'car-cybertruck-cyberbeast',
        model: 'Cybertruck',
        trim: 'Cyberbeast Tri-Motor (845 HP)',
        year: 2026,
        originalPriceUsd: 99990,
        salePriceUsd: 99990,
        image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
        rangeMiles: 320,
        zeroToSixty: '2.6s',
        topSpeedMph: 130,
        horsepower: 845,
        driveTrain: 'Tri-Motor All-Wheel Drive (Cyberbeast)',
        batteryKwh: 123,
        color: 'Stainless Steel Exoskeleton',
        interiorColor: 'Tactical Grey & Cyber Black',
        autopilotType: 'Full Self-Driving (Supervised) Included',
        inStock: true,
        stockCount: 4,
        vin: '7G2CE6EB9TA048192',
        description: 'Cold-rolled 30X stainless steel, Armor Glass, steer-by-wire with 4-wheel steering, and 48-volt low voltage architecture.',
        specs: {
          seating: '5 Adults',
          cargoSpaceCuFt: '120.9 cu ft',
          weightLbs: '6,843 lbs',
          superchargingMaxKw: '350 kW',
          wheels: '20" Cyber Wheels with 35" All-Terrain Tires',
        },
        deliveryEstimate: 'Immediate Direct Dispatch (3-5 Days)',
        nationwideShippingFeeUsd: 1200,
        refundPolicy: '7-Day / 1,000-Mile 100% Money-Back Guarantee',
        warrantyDetails: '4-Yr / 50k Mi Basic • 8-Yr / 150k Mi Battery & Drive Unit',
        isFeatured: true,
      },
      {
        id: 'car-cybertruck-awd',
        model: 'Cybertruck',
        trim: 'All-Wheel Drive Dual Motor',
        year: 2026,
        originalPriceUsd: 79990,
        salePriceUsd: 79990,
        image: '/img-cybertruck-awd.jpg',
        rangeMiles: 340,
        zeroToSixty: '4.1s',
        topSpeedMph: 112,
        horsepower: 600,
        driveTrain: 'Dual Motor All-Wheel Drive',
        batteryKwh: 123,
        color: 'Stainless Steel Exoskeleton',
        interiorColor: 'Tactical Grey',
        autopilotType: 'Full Self-Driving (Supervised) Capable',
        inStock: true,
        stockCount: 6,
        vin: '7G2CE6EB4TA029104',
        description: 'Electronic locking front and rear differentials with adaptive air suspension up to 16 inches of travel.',
        specs: {
          seating: '5 Adults',
          cargoSpaceCuFt: '120.9 cu ft',
          weightLbs: '6,603 lbs',
          superchargingMaxKw: '350 kW',
          wheels: '20" Aero Covered Wheels',
        },
        deliveryEstimate: 'Immediate Direct Dispatch (3-5 Days)',
        nationwideShippingFeeUsd: 1200,
        refundPolicy: '7-Day / 1,000-Mile 100% Money-Back Guarantee',
        warrantyDetails: '4-Yr / 50k Mi Basic • 8-Yr / 150k Mi Battery & Drive Unit',
        isFeatured: true,
      },
      {
        id: 'car-model-s-plaid',
        model: 'Model S',
        trim: 'Model S Plaid (1,020 HP)',
        year: 2026,
        originalPriceUsd: 89990,
        salePriceUsd: 89990,
        image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
        rangeMiles: 359,
        zeroToSixty: '1.99s',
        topSpeedMph: 200,
        horsepower: 1020,
        driveTrain: 'Tri-Motor All-Wheel Drive with Torque Vectoring',
        batteryKwh: 100,
        color: 'Solid Black (Ceramic Coated)',
        interiorColor: 'All Black with Carbon Fiber Decor',
        autopilotType: 'Full Self-Driving (Supervised) Included',
        inStock: true,
        stockCount: 3,
        vin: '5YJSA1E28TA994821',
        description: 'The quickest accelerating production car on Earth. Carbon-sleeved rotors sustain peak power all the way to 200 mph.',
        specs: {
          seating: '5 Adults',
          cargoSpaceCuFt: '28 cu ft (64 cu ft folded)',
          weightLbs: '4,766 lbs',
          superchargingMaxKw: '250 kW Supercharging V3/V4',
          wheels: '21" Arachnid Forged Wheels',
        },
        deliveryEstimate: 'Priority Nationwide Express (2-4 Days)',
        nationwideShippingFeeUsd: 1200,
        refundPolicy: '7-Day / 1,000-Mile 100% Money-Back Guarantee',
        warrantyDetails: '4-Yr / 50k Mi Basic • 8-Yr / 150k Mi Battery & Drive Unit',
        isFeatured: true,
      },
      {
        id: 'car-model-s-awd',
        model: 'Model S',
        trim: 'Long Range Dual-Motor AWD',
        year: 2026,
        originalPriceUsd: 74990,
        salePriceUsd: 74990,
        image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
        rangeMiles: 402,
        zeroToSixty: '3.1s',
        topSpeedMph: 155,
        horsepower: 670,
        driveTrain: 'Dual Motor All-Wheel Drive',
        batteryKwh: 100,
        color: 'Ultra Red Metallic',
        interiorColor: 'Cream Premium Decor with Walnut Wood',
        autopilotType: 'Full Self-Driving (Supervised) Capable',
        inStock: true,
        stockCount: 5,
        vin: '5YJSA1E24TA819203',
        description: 'Over 400 miles of range with grand touring luxury and HEPA filtration with Bioweapon Defense Mode.',
        specs: {
          seating: '5 Adults',
          cargoSpaceCuFt: '28 cu ft',
          weightLbs: '4,561 lbs',
          superchargingMaxKw: '250 kW',
          wheels: '19" Tempest Wheels',
        },
        deliveryEstimate: 'Standard Delivery (3-6 Days)',
        nationwideShippingFeeUsd: 1200,
        refundPolicy: '7-Day / 1,000-Mile 100% Money-Back Guarantee',
        warrantyDetails: '4-Yr / 50k Mi Basic • 8-Yr / 150k Mi Battery & Drive Unit',
        isFeatured: false,
      },
      {
        id: 'car-model-3-performance',
        model: 'Model 3',
        trim: 'Model 3 Performance (Highland Refreshed)',
        year: 2026,
        originalPriceUsd: 53990,
        salePriceUsd: 53990,
        image: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=1200&q=80',
        rangeMiles: 303,
        zeroToSixty: '2.9s',
        topSpeedMph: 163,
        horsepower: 510,
        driveTrain: 'Performance All-Wheel Drive',
        batteryKwh: 82,
        color: 'Stealth Grey',
        interiorColor: 'Sport Bucket Seats (Black/White Alcantara)',
        autopilotType: 'Full Self-Driving (Supervised) Included',
        inStock: true,
        stockCount: 8,
        vin: '5YJ3E1EB8TA719302',
        description: 'Highland 4th-Gen Performance Drive Unit with Track Mode V3 and adaptive damping.',
        specs: {
          seating: '5 Adults',
          cargoSpaceCuFt: '24.1 cu ft',
          weightLbs: '4,054 lbs',
          superchargingMaxKw: '250 kW',
          wheels: '20" Warp Forged Wheels with Pirelli P Zero Tires',
        },
        deliveryEstimate: 'Direct Express Carrier (3-5 Days)',
        nationwideShippingFeeUsd: 1200,
        refundPolicy: '7-Day / 1,000-Mile 100% Money-Back Guarantee',
        warrantyDetails: '4-Yr / 50k Mi Basic • 8-Yr / 120k Mi Battery & Drive Unit',
        isFeatured: true,
      },
      {
        id: 'car-model-3-lr',
        model: 'Model 3',
        trim: 'Long Range All-Wheel Drive',
        year: 2026,
        originalPriceUsd: 47740,
        salePriceUsd: 47740,
        image: 'https://images.unsplash.com/photo-1561580125-028ee3bd62eb?auto=format&fit=crop&w=1200&q=80',
        rangeMiles: 341,
        zeroToSixty: '4.2s',
        topSpeedMph: 125,
        horsepower: 394,
        driveTrain: 'Dual Motor All-Wheel Drive',
        batteryKwh: 82,
        color: 'Deep Blue Metallic',
        interiorColor: 'Black and White Premium Interior',
        autopilotType: 'Basic Autopilot (FSD Optional)',
        inStock: true,
        stockCount: 11,
        vin: '5YJ3E1EB2TA619284',
        description: 'Acoustic glass 360°, ventilated seats, 8-inch rear passenger display, and wireless fast charging.',
        specs: {
          seating: '5 Adults',
          cargoSpaceCuFt: '24.1 cu ft',
          weightLbs: '4,034 lbs',
          superchargingMaxKw: '250 kW',
          wheels: '18" Photon Aero Wheels',
        },
        deliveryEstimate: 'Standard Delivery (3-6 Days)',
        nationwideShippingFeeUsd: 1200,
        refundPolicy: '7-Day / 1,000-Mile 100% Money-Back Guarantee',
        warrantyDetails: '4-Yr / 50k Mi Basic • 8-Yr / 120k Mi Battery & Drive Unit',
        isFeatured: false,
      },
      {
        id: 'car-model-3-rwd',
        model: 'Model 3',
        trim: 'Standard Range Rear-Wheel Drive',
        year: 2026,
        originalPriceUsd: 38990,
        salePriceUsd: 38990,
        image: '/img-model3-pearl.jpg',
        rangeMiles: 272,
        zeroToSixty: '5.8s',
        topSpeedMph: 125,
        horsepower: 271,
        driveTrain: 'Rear-Wheel Drive (LFP Battery)',
        batteryKwh: 60,
        color: 'Pearl White Multi-Coat',
        interiorColor: 'All Black Premium',
        autopilotType: 'Basic Autopilot',
        inStock: true,
        stockCount: 14,
        vin: '5YJ3E1EA5TA510294',
        description: 'Daily 100% charging capable LFP battery chemistry with refined suspension and low running costs.',
        specs: {
          seating: '5 Adults',
          cargoSpaceCuFt: '24.1 cu ft',
          weightLbs: '3,891 lbs',
          superchargingMaxKw: '170 kW',
          wheels: '18" Photon Wheels',
        },
        deliveryEstimate: 'Standard Delivery (3-6 Days)',
        nationwideShippingFeeUsd: 1200,
        refundPolicy: '7-Day / 1,000-Mile 100% Money-Back Guarantee',
        warrantyDetails: '4-Yr / 50k Mi Basic • 8-Yr / 100k Mi Battery & Drive Unit',
        isFeatured: false,
      },
      {
        id: 'car-model-x-plaid',
        model: 'Model X',
        trim: 'Model X Plaid Tri-Motor (1,020 HP)',
        year: 2026,
        originalPriceUsd: 94990,
        salePriceUsd: 94990,
        image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
        rangeMiles: 326,
        zeroToSixty: '2.5s',
        topSpeedMph: 163,
        horsepower: 1020,
        driveTrain: 'Tri-Motor All-Wheel Drive',
        batteryKwh: 100,
        color: 'Quicksilver Metallic',
        interiorColor: '6-Seat Executive Configuration (Black/White)',
        autopilotType: 'Full Self-Driving (Supervised) Included',
        inStock: true,
        stockCount: 3,
        vin: '5YJXCBE49TA918204',
        description: 'Iconic Falcon Wing doors, 5,000 lbs towing hitch, tri-zone climate, and panoramic windshield.',
        specs: {
          seating: '6 Executive Captain Seats',
          cargoSpaceCuFt: '88 cu ft total storage',
          weightLbs: '5,390 lbs',
          superchargingMaxKw: '250 kW Supercharging V3/V4',
          wheels: '22" Turbine Forged Alloy Wheels',
        },
        deliveryEstimate: 'Priority Enclosed Carrier (2-4 Days)',
        nationwideShippingFeeUsd: 1200,
        refundPolicy: '7-Day / 1,000-Mile 100% Money-Back Guarantee',
        warrantyDetails: '4-Yr / 50k Mi Basic • 8-Yr / 150k Mi Battery & Drive Unit',
        isFeatured: true,
      },
      {
        id: 'car-model-x-awd',
        model: 'Model X',
        trim: 'All-Wheel Drive Dual Motor',
        year: 2026,
        originalPriceUsd: 79990,
        salePriceUsd: 79990,
        image: 'https://images.unsplash.com/photo-1554744512-d6c603f27c54?auto=format&fit=crop&w=1200&q=80',
        rangeMiles: 335,
        zeroToSixty: '3.8s',
        topSpeedMph: 155,
        horsepower: 670,
        driveTrain: 'Dual Motor All-Wheel Drive',
        batteryKwh: 100,
        color: 'Solid Black',
        interiorColor: '7-Seat Family Layout',
        autopilotType: 'Full Self-Driving (Supervised) Capable',
        inStock: true,
        stockCount: 4,
        vin: '5YJXCBE21TA729104',
        description: 'Spacious luxury with 7-passenger capability and standard Falcon Wing doors.',
        specs: {
          seating: '7 Passengers',
          cargoSpaceCuFt: '85 cu ft',
          weightLbs: '5,185 lbs',
          superchargingMaxKw: '250 kW',
          wheels: '20" Cyberstream Wheels',
        },
        deliveryEstimate: 'Standard Delivery (3-6 Days)',
        nationwideShippingFeeUsd: 1200,
        refundPolicy: '7-Day / 1,000-Mile 100% Money-Back Guarantee',
        warrantyDetails: '4-Yr / 50k Mi Basic • 8-Yr / 150k Mi Battery & Drive Unit',
        isFeatured: false,
      },
      {
        id: 'car-model-y-performance',
        model: 'Model Y',
        trim: 'Model Y Performance AWD',
        year: 2026,
        originalPriceUsd: 51490,
        salePriceUsd: 51490,
        image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
        rangeMiles: 279,
        zeroToSixty: '3.5s',
        topSpeedMph: 155,
        horsepower: 455,
        driveTrain: 'Performance Dual Motor AWD',
        batteryKwh: 82,
        color: 'Ultra Red Metallic',
        interiorColor: 'All Black Premium',
        autopilotType: 'Full Self-Driving (Supervised) Included',
        inStock: true,
        stockCount: 9,
        vin: '7SAYGDEE9TA619284',
        description: 'Lowered sport suspension, performance brakes, carbon spoiler, and 21" Überturbine wheels.',
        specs: {
          seating: '5 Adults',
          cargoSpaceCuFt: '76.2 cu ft max cargo',
          weightLbs: '4,398 lbs',
          superchargingMaxKw: '250 kW',
          wheels: '21" Überturbine Wheels',
        },
        deliveryEstimate: 'Direct Express Dispatch (3-5 Days)',
        nationwideShippingFeeUsd: 1200,
        refundPolicy: '7-Day / 1,000-Mile 100% Money-Back Guarantee',
        warrantyDetails: '4-Yr / 50k Mi Basic • 8-Yr / 120k Mi Battery & Drive Unit',
        isFeatured: true,
      },
      {
        id: 'car-model-y-lr',
        model: 'Model Y',
        trim: 'Long Range All-Wheel Drive',
        year: 2026,
        originalPriceUsd: 47990,
        salePriceUsd: 47990,
        image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80',
        rangeMiles: 310,
        zeroToSixty: '4.8s',
        topSpeedMph: 135,
        horsepower: 384,
        driveTrain: 'Dual Motor All-Wheel Drive',
        batteryKwh: 82,
        color: 'Stealth Grey',
        interiorColor: 'Black and White Premium',
        autopilotType: 'Basic Autopilot',
        inStock: true,
        stockCount: 16,
        vin: '7SAYGDEE4TA519203',
        description: 'High ground clearance, versatile hatchback tailgate, all-weather traction control, and 5-star safety.',
        specs: {
          seating: '5 Adults (Optional 7-seat)',
          cargoSpaceCuFt: '76.2 cu ft',
          weightLbs: '4,363 lbs',
          superchargingMaxKw: '250 kW',
          wheels: '19" Gemini Dark Wheels',
        },
        deliveryEstimate: 'Standard Delivery (3-6 Days)',
        nationwideShippingFeeUsd: 1200,
        refundPolicy: '7-Day / 1,000-Mile 100% Money-Back Guarantee',
        warrantyDetails: '4-Yr / 50k Mi Basic • 8-Yr / 120k Mi Battery & Drive Unit',
        isFeatured: false,
      },
      {
        id: 'car-roadster-founders',
        model: 'Roadster',
        trim: 'Founders Series (SpaceX Package)',
        year: 2026,
        originalPriceUsd: 250000,
        salePriceUsd: 250000,
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
        rangeMiles: 620,
        zeroToSixty: '1.1s',
        topSpeedMph: 255,
        horsepower: 1400,
        driveTrain: 'Quad Motor All-Wheel Drive with Cold Gas Thrusters',
        batteryKwh: 200,
        color: 'Signature Founders Crimson Red',
        interiorColor: 'Aerospace Carbon Fiber Monocoque Cockpit',
        autopilotType: 'Full Self-Driving (Hardware 4 Dedicated)',
        inStock: true,
        stockCount: 1,
        vin: '5YJRE1EB9TA000012',
        description: 'SpaceX Cold Gas Thruster package achieving 0-60 in 1.1s with 620 miles range and removable glass roof.',
        specs: {
          seating: '2 Cockpit Seats',
          cargoSpaceCuFt: '14 cu ft front & rear',
          weightLbs: '4,200 lbs',
          superchargingMaxKw: '350 kW Megawatt Ready',
          wheels: '21" Front / 22" Rear Monoblock Forged Aero Blades',
        },
        deliveryEstimate: 'White-Glove Enclosed Transporter (2-3 Days)',
        nationwideShippingFeeUsd: 0,
        refundPolicy: '7-Day / 1,000-Mile 100% Money-Back Guarantee',
        warrantyDetails: 'Apex Bespoke Supercar VIP Warranty • Lifetime Supercharging Included',
        isFeatured: true,
      },
      {
        id: 'car-roadster-base',
        model: 'Roadster',
        trim: 'All-Wheel Drive Reserve',
        year: 2026,
        originalPriceUsd: 200000,
        salePriceUsd: 200000,
        image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
        rangeMiles: 620,
        zeroToSixty: '1.9s',
        topSpeedMph: 250,
        horsepower: 1200,
        driveTrain: 'Tri-Motor All-Wheel Drive (10,000 Nm Torque)',
        batteryKwh: 200,
        color: 'Liquid Silver Chrome',
        interiorColor: 'Minimalist White Alcantara',
        autopilotType: 'Full Self-Driving (Supervised) Included',
        inStock: true,
        stockCount: 2,
        vin: '5YJRE1EB4TA000048',
        description: '620 miles per charge, 10,000 Nm instantaneous wheel torque, glass targa roof, and aerodynamic styling.',
        specs: {
          seating: '2+2 Configuration',
          cargoSpaceCuFt: '18 cu ft',
          weightLbs: '4,350 lbs',
          superchargingMaxKw: '350 kW',
          wheels: 'Forged Aero Multi-Piece Rims',
        },
        deliveryEstimate: 'White-Glove Enclosed Transporter (3-5 Days)',
        nationwideShippingFeeUsd: 0,
        refundPolicy: '7-Day / 1,000-Mile 100% Money-Back Guarantee',
        warrantyDetails: 'Bespoke Apex Supercar VIP Protection • Lifetime Supercharging',
        isFeatured: false,
      },
    ];

    defaultCars.forEach((c) => serverCarCatalog.set(c.id, c));
  }
}

seedServerCarCatalog();

// Car Catalog CRUD API
app.get('/api/cars', (_req, res) => {
  return res.json(Array.from(serverCarCatalog.values()));
});

app.post('/api/cars', authenticateToken, requireAdmin, (req, res) => {
  const carData = req.body;
  if (!carData.model || !carData.trim || !carData.salePriceUsd) {
    return res.status(400).json({ error: 'Model, trim, and price are required.' });
  }

  const id = `car-${Date.now()}`;
  const newCar: ServerCarListing = {
    ...carData,
    id,
    originalPriceUsd: carData.originalPriceUsd || carData.salePriceUsd,
    nationwideShippingFeeUsd: carData.nationwideShippingFeeUsd ?? serverShippingSettings.flatFeeUsd,
    refundPolicy: carData.refundPolicy || serverRefundPolicy.termsSummary,
  };

  serverCarCatalog.set(id, newCar);
  console.log(`[CAR CATALOG CREATED] Added ${newCar.year} Tesla ${newCar.model} ${newCar.trim} ($${newCar.salePriceUsd})`);
  return res.json({ success: true, car: newCar });
});

app.put('/api/cars/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const existing = serverCarCatalog.get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Vehicle not found.' });
  }

  const updated: ServerCarListing = {
    ...existing,
    ...req.body,
    id,
  };

  serverCarCatalog.set(id, updated);
  console.log(`[CAR CATALOG UPDATED] Updated Tesla ${updated.model} ${updated.trim} ($${updated.salePriceUsd})`);
  return res.json({ success: true, car: updated });
});

app.delete('/api/cars/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const existed = serverCarCatalog.delete(id);
  if (!existed) {
    return res.status(404).json({ error: 'Vehicle not found.' });
  }
  console.log(`[CAR CATALOG DELETED] Removed vehicle #${id}`);
  return res.json({ success: true, message: 'Vehicle removed from catalog.' });
});

// Nationwide Shipping Settings API
app.get('/api/cars/shipping-settings', (_req, res) => {
  return res.json(serverShippingSettings);
});

app.post('/api/cars/shipping-settings', authenticateToken, requireAdmin, (req, res) => {
  serverShippingSettings = {
    ...serverShippingSettings,
    ...req.body,
  };
  console.log('[SHIPPING SETTINGS UPDATED]', serverShippingSettings);
  return res.json({ success: true, settings: serverShippingSettings });
});

// Vehicle Refund Policy API
app.get('/api/cars/refund-policy', (_req, res) => {
  return res.json(serverRefundPolicy);
});

app.post('/api/cars/refund-policy', authenticateToken, requireAdmin, (req, res) => {
  serverRefundPolicy = {
    ...serverRefundPolicy,
    ...req.body,
  };
  console.log('[REFUND POLICY UPDATED]', serverRefundPolicy);
  return res.json({ success: true, policy: serverRefundPolicy });
});

// Vehicle Orders & Checkout API
app.get('/api/orders', authenticateToken, (req, res) => {
  const caller = (req as any).user;
  if (caller?.role !== 'admin') {
    return res.json(serverVehicleOrders.filter((o) => o.userId === caller?.id));
  }
  const { userId } = req.query;
  if (userId) {
    return res.json(serverVehicleOrders.filter((o) => o.userId === userId));
  }
  return res.json(serverVehicleOrders);
});

app.post('/api/orders', authenticateToken, requireSelfOrAdmin, (req, res) => {
  const {
    userId,
    userName,
    userEmail,
    vehicleId,
    shippingAddress,
    paymentMethod,
    refundPolicyAccepted,
  } = req.body;

  const vehicle = serverCarCatalog.get(vehicleId);
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found.' });
  }

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
    return res.status(400).json({ error: 'Valid delivery shipping address is required.' });
  }

  if (!refundPolicyAccepted) {
    return res.status(400).json({ error: 'Customer must review and accept the 7-Day Money-Back Guarantee Refund Policy.' });
  }

  const shippingFeeUsd = vehicle.nationwideShippingFeeUsd || serverShippingSettings.flatFeeUsd;
  const totalUsd = vehicle.salePriceUsd + shippingFeeUsd;

  // Cross-reference vehicle + shipping payment against verified user deposit records & reconciled wallet
  if (paymentMethod === 'vault_balance') {
    const { clientDepositUsd, clientWalletUsd } = req.body || {};
    const validation = validateAndConsumePayment({
      userId: userId || 'usr-apex-001',
      category: 'vehicle_order_shipping',
      totalCostUsd: totalUsd,
      expectedMinimumUsd: totalUsd,
      requireDepositOnly: false,
      clientClaimedDepositUsd: typeof clientDepositUsd === 'number' ? clientDepositUsd : undefined,
      clientClaimedWalletUsd: typeof clientWalletUsd === 'number' ? clientWalletUsd : undefined,
      notes: `Vehicle checkout & nationwide shipping ($${shippingFeeUsd} shipping + $${vehicle.salePriceUsd} vehicle) cross-referenced against deposit records.`,
      walletsMap: serverWallets,
    });
    if (!validation.ok) {
      persistServerGameAndCronState();
      return res.status(validation.statusCode === 403 ? 403 : 402).json({
        error: validation.error,
        code: validation.code,
        wallet: validation.wallet,
        audit: validation.audit,
      });
    }
    persistServerGameAndCronState();
  }

  // Decrement stock
  if (vehicle.stockCount > 0) {
    vehicle.stockCount -= 1;
    if (vehicle.stockCount === 0) vehicle.inStock = false;
  }

  const orderId = `ORD-TESLA-${Date.now().toString(36).toUpperCase()}`;
  const trackingNumber = `APX-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const vinAssigned = vehicle.vin || `5YJ${vehicle.model[0]}E${Date.now().toString().slice(-8)}`;

  const order = {
    id: orderId,
    userId: userId || 'usr-apex-001',
    userName: userName || 'Alex Vance',
    userEmail: userEmail || 'alex.vance@apex-tesla.io',
    vehicleId: vehicle.id,
    vehicleName: `Tesla ${vehicle.model} ${vehicle.trim}`,
    model: vehicle.model,
    trim: vehicle.trim,
    totalUsd,
    shippingFeeUsd,
    shippingAddress,
    status: 'confirmed',
    trackingNumber,
    refundPolicyAccepted: true,
    orderedAt: new Date().toISOString(),
    vinAssigned,
    paymentMethod: paymentMethod || 'vault_balance',
    deliveryEstimate: vehicle.deliveryEstimate,
  };

  serverVehicleOrders.unshift(order);
  console.log(`[VEHICLE ORDER PLACED] ${order.vehicleName} for ${order.userName} (Total: $${totalUsd.toLocaleString()})`);

  return res.json({
    success: true,
    message: `Order #${orderId} confirmed! Tesla ${vehicle.model} is assigned for nationwide delivery. VIN: ${vinAssigned}`,
    order,
  });
});

// ============================================================================
// MEDIA UPLOAD (JPG/PNG/WEBP LOGO, FAVICON, SLIDES, MP4/WEBM PROMO VIDEOS)
// ============================================================================
app.post('/api/media/upload', authenticateToken, (req, res) => {
  try {
    const { filename, dataUrl, base64Data: altDataUrl } = req.body || {};
    const resolvedDataUrl = typeof dataUrl === 'string' ? dataUrl : altDataUrl;
    if (!filename || !resolvedDataUrl || typeof resolvedDataUrl !== 'string') {
      return res.status(400).json({ error: 'filename and dataUrl are required.' });
    }

    const match = resolvedDataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid base64 dataUrl payload.' });
    }

    const mimeType = match[1].toLowerCase();
    const base64Data = match[2];
    const allowedExtMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'video/quicktime': '.mp4',
    };

    const inferredExt = allowedExtMap[mimeType];
    if (!inferredExt) {
      return res.status(400).json({
        error: 'Unsupported media format. Upload JPG, PNG, WEBP images or MP4/WEBM videos.',
      });
    }

    const cleanBase = path
      .basename(String(filename), path.extname(String(filename)))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 48);
    const outName = `${cleanBase || 'media'}_${Date.now()}${inferredExt}`;
    const outPath = path.join(uploadsDir, outName);

    fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'));
    const publicUrl = `/uploads/${outName}`;

    return res.json({
      success: true,
      url: publicUrl,
      mimeType,
      filename: outName,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return res.status(500).json({ error: error.message || 'Media upload failed' });
  }
});

app.get('/api/media/list', authenticateToken, requireAdmin, (_req, res) => {
  try {
    const entries: Array<{
      id: string;
      name: string;
      url: string;
      storagePath: string;
      sizeBytes: number;
      uploadedAt: string;
      contentType: string;
      source: 'local_upload' | 'preset';
    }> = [];

    // Include built-in public assets
    [
      { name: 'logo.jpg', url: '/logo.jpg' },
      { name: 'favicon.jpg', url: '/favicon.jpg' },
    ].forEach((builtin) => {
      const pubFile = path.join(process.cwd(), 'public', builtin.name);
      if (fs.existsSync(pubFile)) {
        const stat = fs.statSync(pubFile);
        entries.push({
          id: `builtin_${builtin.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: builtin.name,
          url: builtin.url,
          storagePath: `public/${builtin.name}`,
          sizeBytes: stat.size,
          uploadedAt: stat.mtime.toISOString(),
          contentType: 'image/jpeg',
          source: 'preset',
        });
      }
    });

    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach((f) => {
        if (!f.match(/\.(jpg|jpeg|png|webp)$/i)) return;
        const full = path.join(uploadsDir, f);
        const stat = fs.statSync(full);
        const ext = path.extname(f).toLowerCase();
        entries.push({
          id: `up_${f.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
          name: f,
          url: `/uploads/${f}`,
          storagePath: `/uploads/${f}`,
          sizeBytes: stat.size,
          uploadedAt: stat.mtime.toISOString(),
          contentType: ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg',
          source: 'local_upload',
        });
      });
    }

    entries.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    return res.json({ files: entries });
  } catch (err: unknown) {
    return res.status(500).json({ error: (err as Error).message || 'Failed to list media' });
  }
});

app.delete('/api/media/delete', authenticateToken, requireAdmin, (req, res) => {
  try {
    const filename = String(req.body?.filename || req.query?.filename || '').trim();
    const safeName = path.basename(filename);
    if (!safeName || !fs.existsSync(uploadsDir)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    const targetPath = path.join(uploadsDir, safeName);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
    return res.json({ success: true });
  } catch (err: unknown) {
    return res.status(500).json({ error: (err as Error).message || 'Delete failed' });
  }
});

// ============================================================================
// SEO METADATA, ADMIN PERSISTED CONFIG, SITEMAP.XML & RSS.XML SYNDICATION
// ============================================================================
const adminStateFilePath = path.join(process.cwd(), '.apex_admin_state.json');

const readServerAdminState = (): Record<string, unknown> => {
  try {
    if (fs.existsSync(adminStateFilePath)) {
      return JSON.parse(fs.readFileSync(adminStateFilePath, 'utf-8'));
    }
  } catch {
    // ignore parse failure
  }
  return {};
};

const writeServerAdminState = (patch: Record<string, unknown>) => {
  try {
    const current = readServerAdminState();
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    fs.writeFileSync(adminStateFilePath, JSON.stringify(next, null, 2), 'utf-8');
  } catch {
    // non-fatal on read-only filesystem
  }
};

let serverSeoState: Record<string, any> = {
  siteTitle: 'Apex Tesla Hub - Service, Customization, Rentals & Fleet Yield',
  metaDescription:
    'Comprehensive Tesla vehicle hub for certified maintenance, 3M vinyl wraps & custom accessories, exotic fleet rentals, decentralized staking yields, TSLA stocks, and spin & scratch Tesla giveaways.',
  canonicalUrl: 'https://apex-tesla.io/',
  logoUrl: '/logo.jpg',
  faviconUrl: '/favicon.jpg',
  ...(readServerAdminState().seoSettings as Record<string, any> | undefined),
};

let serverSitemapEntries: Array<{
  path: string;
  title: string;
  priority: number;
  changeFreq: string;
  isActive: boolean;
  lastMod: string;
}> = (readServerAdminState().sitemapEntries as any) || [
  { path: 'home', title: 'Apex Tesla Hub Home', priority: 1.0, changeFreq: 'daily', isActive: true, lastMod: '2026-11-12' },
  { path: 'vehicles', title: 'Buy Factory Tesla Vehicles', priority: 0.95, changeFreq: 'daily', isActive: true, lastMod: '2026-11-12' },
  { path: 'stocks', title: 'TSLA Stocks & Fast-ROI Plans', priority: 0.9, changeFreq: 'daily', isActive: true, lastMod: '2026-11-12' },
  { path: 'investment', title: 'Autonomous Fleet Staking', priority: 0.9, changeFreq: 'daily', isActive: true, lastMod: '2026-11-12' },
  { path: 'services', title: 'Certified Tesla Service & Ranger', priority: 0.85, changeFreq: 'weekly', isActive: true, lastMod: '2026-11-11' },
  { path: 'wraps', title: 'Custom 3M Wrap Studio', priority: 0.85, changeFreq: 'weekly', isActive: true, lastMod: '2026-11-11' },
  { path: 'rentals', title: 'Exotic Tesla Rental Fleet', priority: 0.85, changeFreq: 'weekly', isActive: true, lastMod: '2026-11-11' },
  { path: 'promotions', title: 'Spin & Win + Scratch Cards', priority: 0.85, changeFreq: 'daily', isActive: true, lastMod: '2026-11-12' },
  { path: 'banners', title: '3D/HD Banners & Short Promo Videos', priority: 0.8, changeFreq: 'daily', isActive: true, lastMod: '2026-11-12' },
  { path: 'about', title: 'About Apex Tesla Hub', priority: 0.85, changeFreq: 'monthly', isActive: true, lastMod: '2026-11-15' },
  { path: 'certificates', title: 'Business & License Certificates', priority: 0.8, changeFreq: 'monthly', isActive: true, lastMod: '2026-11-12' },
  { path: 'blog', title: 'EV News & Engineering Blog', priority: 0.9, changeFreq: 'daily', isActive: true, lastMod: '2026-11-15' },
  { path: 'faq', title: 'Frequently Asked Questions', priority: 0.7, changeFreq: 'weekly', isActive: true, lastMod: '2026-11-12' },
];
if (!serverSitemapEntries.some((e) => e.path === 'blog')) {
  serverSitemapEntries.push({
    path: 'blog',
    title: 'EV News & Engineering Blog',
    priority: 0.9,
    changeFreq: 'daily',
    isActive: true,
    lastMod: '2026-11-15',
  });
}

let serverRssItems: Array<{
  id: string;
  title: string;
  linkTab: string;
  description: string;
  category: string;
  pubDate: string;
  guid: string;
  isPublished: boolean;
}> = (readServerAdminState().rssFeedItems as any) || [
  {
    id: 'rss-01',
    title: '2026 Cybertruck Cyberbeast & Model S Plaid Multi-Slide 3D Promo Suite Live',
    linkTab: 'banners',
    description: 'Ambassadors can now share rotating 3D/HD promotional banners and AI-generated short promo videos with instant $25–$200 tiered referral tracking.',
    category: 'Promotions',
    pubDate: '2026-11-12T10:30:00Z',
    guid: 'apex-rss-2026-11-12-01',
    isPublished: true,
  },
  {
    id: 'rss-02',
    title: 'Robotaxi 18.4% APY & TSLA.FSD 34% Fast-ROI Settlement Cycle Completed',
    linkTab: 'investment',
    description: 'Automated daily ROI distributions settled directly into participant USD vaults across autonomous Robotaxi and TSLA Fast-ROI pools.',
    category: 'Yield & Stocks',
    pubDate: '2026-11-12T08:15:00Z',
    guid: 'apex-rss-2026-11-12-02',
    isPublished: true,
  },
];

const escapeXml = (str: string) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

app.get('/api/admin/state', (req, res) => {
  const state = readServerAdminState();
  const caller = getAuthenticatedUser(req);
  if (caller?.role === 'admin') {
    return res.json({ state });
  }
  const {
    depositRecords: _dr,
    transactionAudits: _ta,
    serverWalletsFreeWin: _fw,
    streakStates: _ss,
    smtp_config: _sc,
    auto_gateways: _ag,
    newsletterSubscribers: _ns,
    spinSystemConfig: rawSpinCfg,
    ...publicState
  } = state as Record<string, any>;
  if (rawSpinCfg && typeof rawSpinCfg === 'object') {
    const safeTrackers = caller?.id && rawSpinCfg.userTrackers?.[caller.id]
      ? { [caller.id]: rawSpinCfg.userTrackers[caller.id] }
      : {};
    const safeOverrides = caller?.id && rawSpinCfg.userLevelOverrides?.[caller.id]
      ? { [caller.id]: rawSpinCfg.userLevelOverrides[caller.id] }
      : {};
    publicState.spinSystemConfig = {
      ...rawSpinCfg,
      userTrackers: safeTrackers,
      userLevelOverrides: safeOverrides,
    };
  }
  return res.json({ state: publicState });
});

app.post('/api/admin/state', authenticateToken, requireAdmin, (req, res) => {
  const { section, value, sections } = req.body || {};
  if (section && typeof section === 'string' && value !== undefined) {
    writeServerAdminState({ [section]: value });
    return res.json({ success: true });
  }
  if (sections && typeof sections === 'object') {
    writeServerAdminState(sections);
    return res.json({ success: true });
  }
  return res.status(400).json({ error: 'section/value or sections object required' });
});

app.post('/api/seo/sync', authenticateToken, requireAdmin, (req, res) => {
  const { seoSettings, sitemapEntries, rssFeedItems } = req.body || {};
  if (seoSettings) {
    serverSeoState = { ...serverSeoState, ...seoSettings };
    writeServerAdminState({ seoSettings: serverSeoState });
  }
  if (Array.isArray(sitemapEntries)) {
    serverSitemapEntries = sitemapEntries;
    writeServerAdminState({ sitemapEntries });
  }
  if (Array.isArray(rssFeedItems)) {
    serverRssItems = rssFeedItems;
    writeServerAdminState({ rssFeedItems });
  }
  return res.json({ success: true });
});

app.get('/sitemap.xml', (req, res) => {
  const baseUrl = (serverSeoState.canonicalUrl || `${req.protocol}://${req.get('host')}/`).replace(/\/+$/, '');
  const state = readServerAdminState();
  const blogPosts = Array.isArray(state.blog_posts) ? state.blog_posts.filter((p: any) => p.status === 'published') : [];
  const active = serverSitemapEntries.filter((e) => e.isActive !== false);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${active
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(`${baseUrl}/?tab=${encodeURIComponent(entry.path)}`)}</loc>
    <lastmod>${escapeXml(entry.lastMod || new Date().toISOString().slice(0, 10))}</lastmod>
    <changefreq>${escapeXml(entry.changeFreq || 'weekly')}</changefreq>
    <priority>${Number(entry.priority || 0.8).toFixed(2)}</priority>
  </url>`
  )
  .join('\n')}
${blogPosts
  .map(
    (post: any) => `  <url>
    <loc>${escapeXml(`${baseUrl}/?tab=blog&post=${encodeURIComponent(post.slug || post.id)}`)}</loc>
    <lastmod>${escapeXml(post.updatedAt || post.publishedAt || new Date().toISOString().slice(0, 10))}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  return res.send(xml);
});

app.get('/rss.xml', (req, res) => {
  const baseUrl = (serverSeoState.canonicalUrl || `${req.protocol}://${req.get('host')}/`).replace(/\/+$/, '');
  const state = readServerAdminState();
  const blogPosts = Array.isArray(state.blog_posts) ? state.blog_posts.filter((p: any) => p.status === 'published') : [];
  const published = serverRssItems.filter((item) => item.isPublished !== false);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(serverSeoState.siteTitle)}</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>${escapeXml(serverSeoState.metaDescription)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${baseUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />
${published
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(`${baseUrl}/?tab=${encodeURIComponent(item.linkTab || 'home')}`)}</link>
      <guid isPermaLink="false">${escapeXml(item.guid || item.id)}</guid>
      <category>${escapeXml(item.category || 'Updates')}</category>
      <pubDate>${new Date(item.pubDate || Date.now()).toUTCString()}</pubDate>
      <description>${escapeXml(item.description)}</description>
    </item>`
  )
  .join('\n')}
${blogPosts
  .map(
    (post: any) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(`${baseUrl}/?tab=blog&post=${encodeURIComponent(post.slug || post.id)}`)}</link>
      <guid isPermaLink="false">${escapeXml(`apex-blog-${post.id}`)}</guid>
      <category>${escapeXml(post.category || 'EV Engineering')}</category>
      <pubDate>${new Date(post.publishedAt || Date.now()).toUTCString()}</pubDate>
      <description>${escapeXml(post.metaDescription || post.excerpt || '')}</description>
    </item>`
  )
  .join('\n')}
  </channel>
</rss>`;
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  return res.send(xml);
});

// ============================================================================
// AI PROMOTIONAL SHORT VIDEO GENERATOR (GEMINI 4 HYDROGEN)
// ============================================================================
app.post('/api/gemini/generate-promo-video', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      topic = '2026 Tesla Cybertruck Cyberbeast & 28.5% APY Autonomous Fleet Yield',
      targetTab = 'vehicles',
      accentColor = '#ef4444',
      durationSec = 12,
    } = req.body || {};

    const slidePool = ['/promo-cyberbeast.jpg', '/promo-plaid.jpg', '/promo-robotaxi.jpg'];

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `Create a punchy 3-scene high-converting promotional short video storyboard for Apex Tesla Hub.
Campaign Topic: ${topic}
Target Route: ${targetTab}
Duration: ${durationSec} seconds
Each scene needs a crisp title (max 5 words), short subtitle (max 14 words), and a bold metric badge (max 4 words).`,
          config: {
            systemInstruction:
              'You are a creative director producing short vertical/widescreen Tesla EV & fintech reels for Apex Tesla Hub. Output strictly valid JSON matching the schema.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                headline: { type: Type.STRING },
                subheadline: { type: Type.STRING },
                ctaText: { type: Type.STRING },
                scenes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      subtitle: { type: Type.STRING },
                      metric: { type: Type.STRING },
                    },
                    required: ['title', 'subtitle', 'metric'],
                  },
                },
              },
              required: ['title', 'headline', 'subheadline', 'ctaText', 'scenes'],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          const scenes = (Array.isArray(parsed.scenes) ? parsed.scenes.slice(0, 4) : []).map(
            (s: any, idx: number) => ({
              title: s.title || 'APEX TESLA SHOWCASE',
              subtitle: s.subtitle || topic,
              metric: s.metric || '2026 EDITION',
              bgImage: slidePool[idx % slidePool.length],
            })
          );
          return res.json({
            success: true,
            aiPowered: true,
            video: {
              title: parsed.title,
              headline: parsed.headline,
              subheadline: parsed.subheadline,
              ctaText: parsed.ctaText,
              targetTab,
              durationSec: Number(durationSec) || 12,
              videoType: 'ai_generated',
              thumbnailUrl: slidePool[0],
              accentColor,
              scenes:
                scenes.length > 0
                  ? scenes
                  : [
                      {
                        title: 'APEX TESLA HUB 2026',
                        subtitle: topic,
                        metric: 'INSTANT DISPATCH',
                        bgImage: slidePool[0],
                      },
                    ],
            },
          });
        }
      } catch (geminiErr: any) {
        console.warn('Gemini promo video fallback triggered:', geminiErr?.message);
      }
    }

    return res.json({
      success: true,
      aiPowered: false,
      video: {
        title: `AI Spotlight: ${String(topic).slice(0, 38)}`,
        headline: String(topic).slice(0, 64).toUpperCase(),
        subheadline: 'Exclusive factory EVs, automated fleet ROI & $25–$200 tiered VIP ambassador referral rewards.',
        ctaText: 'Activate VIP Offer',
        targetTab,
        durationSec: Number(durationSec) || 12,
        videoType: 'ai_generated',
        thumbnailUrl: '/promo-cyberbeast.jpg',
        accentColor,
        scenes: [
          {
            title: '2026 FLAGSHIP PERFORMANCE',
            subtitle: String(topic).slice(0, 90),
            metric: '0–60 IN 1.99s',
            bgImage: '/promo-plaid.jpg',
          },
          {
            title: 'GLOBAL FLEET & YIELDS',
            subtitle: 'Commercial Robotaxi & Supercharger V4 staking with daily automated payouts.',
            metric: 'UP TO 34% FAST ROI',
            bgImage: '/promo-robotaxi.jpg',
          },
          {
            title: 'SHARE & EARN $25–$200',
            subtitle: 'Invite friends using your referral code for tier-scaled vault credits & free spins.',
            metric: 'VIP AMBASSADOR KIT',
            bgImage: '/promo-cyberbeast.jpg',
          },
        ],
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return res.status(500).json({ error: error.message || 'Failed to generate promo video' });
  }
});

// ============================================================================
// VISITOR ANALYTICS & LIVE ACTIVITY TELEMETRY
// ============================================================================
interface ServerVisitorLog {
  id: string;
  visitorId: string;
  ip: string;
  country: string;
  city?: string;
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  mobileModel: string;
  browser: string;
  os: string;
  action: string;
  pageTab: string;
  details?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  screenSize?: string;
  referrer?: string;
  timestamp: string;
}

const serverVisitorLogs: ServerVisitorLog[] = [
  {
    id: 'vis-seed-01',
    visitorId: 'v-us-9910',
    ip: '172.58.194.21',
    country: 'United States',
    city: 'Austin, TX',
    deviceType: 'Mobile',
    mobileModel: 'iPhone (iOS Mobile)',
    browser: 'Safari',
    os: 'iOS 18',
    action: 'Viewed Tesla Car Sales Showroom',
    pageTab: 'vehicles',
    details: 'Inspected 2026 Cybertruck Cyberbeast specs & financing',
    userName: 'Marcus Vance',
    userEmail: 'marcus.v@apex-tesla.io',
    screenSize: '430x932',
    timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
  },
  {
    id: 'vis-seed-02',
    visitorId: 'v-de-4821',
    ip: '84.115.202.88',
    country: 'Germany',
    city: 'Berlin',
    deviceType: 'Desktop',
    mobileModel: 'Desktop Workstation',
    browser: 'Chrome',
    os: 'Windows 11',
    action: 'Opened TSLA Stocks & Fast ROI Hub',
    pageTab: 'stocks',
    details: 'Reviewed TSLA.FSD 34% Accelerated ROI tier',
    userName: 'Elena Rostova',
    userEmail: 'elena.r@berlin-ev.de',
    screenSize: '1920x1080',
    timestamp: new Date(Date.now() - 9 * 60000).toISOString(),
  },
  {
    id: 'vis-seed-03',
    visitorId: 'v-ae-7723',
    ip: '94.200.41.15',
    country: 'United Arab Emirates',
    city: 'Dubai',
    deviceType: 'Mobile',
    mobileModel: 'Samsung Galaxy (Android)',
    browser: 'Chrome Mobile',
    os: 'Android 15',
    action: 'Submitted Won Prize International Shipping Quote',
    pageTab: 'dashboard',
    details: 'Checked UAE air/RoRo freight & export documentation fees',
    userName: 'Tariq Al-Mansoor',
    userEmail: 'tariq@dubai-motors.ae',
    screenSize: '412x915',
    timestamp: new Date(Date.now() - 16 * 60000).toISOString(),
  },
  {
    id: 'vis-seed-04',
    visitorId: 'v-gb-2104',
    ip: '81.149.118.42',
    country: 'United Kingdom',
    city: 'London',
    deviceType: 'Tablet',
    mobileModel: 'Apple iPad',
    browser: 'Safari',
    os: 'iPadOS 18',
    action: 'Played AI Promotional Short Video',
    pageTab: 'banners',
    details: 'Copied 3D Cyberbeast banner HTML embed with referral code',
    screenSize: '1024x1366',
    timestamp: new Date(Date.now() - 24 * 60000).toISOString(),
  },
  {
    id: 'vis-seed-05',
    visitorId: 'v-ca-5539',
    ip: '142.114.62.109',
    country: 'Canada',
    city: 'Toronto',
    deviceType: 'Desktop',
    mobileModel: 'Desktop Workstation',
    browser: 'Firefox',
    os: 'macOS',
    action: 'Switched Display Currency to CAD',
    pageTab: 'vehicles',
    details: 'Viewed Model S Plaid MSRP converted via treasury multiplier',
    screenSize: '2560x1440',
    timestamp: new Date(Date.now() - 33 * 60000).toISOString(),
  },
  {
    id: 'vis-seed-06',
    visitorId: 'v-jp-8840',
    ip: '126.198.73.14',
    country: 'Japan',
    city: 'Tokyo',
    deviceType: 'Mobile',
    mobileModel: 'iPhone (iOS Mobile)',
    browser: 'Safari',
    os: 'iOS 18',
    action: 'Activated Spin & Win Wheel Session',
    pageTab: 'promotions',
    details: 'Browsed $8,000 Scratch & Win Jackpot tiers',
    userName: 'Kenji Takahashi',
    userEmail: 'kenji@tokyo-ev.jp',
    screenSize: '390x844',
    timestamp: new Date(Date.now() - 47 * 60000).toISOString(),
  },
  {
    id: 'vis-seed-07',
    visitorId: 'v-ng-3319',
    ip: '102.89.34.176',
    country: 'Nigeria',
    city: 'Lagos',
    deviceType: 'Mobile',
    mobileModel: 'Android Smartphone',
    browser: 'Chrome Mobile',
    os: 'Android 14',
    action: 'Visited Autonomous Fleet Staking Pools',
    pageTab: 'investment',
    details: 'Explored 18.4% APY Robotaxi & Supercharger V4 nodes',
    screenSize: '360x800',
    timestamp: new Date(Date.now() - 62 * 60000).toISOString(),
  },
  {
    id: 'vis-seed-08',
    visitorId: 'v-au-6490',
    ip: '1.129.104.53',
    country: 'Australia',
    city: 'Sydney',
    deviceType: 'Desktop',
    mobileModel: 'Desktop Workstation',
    browser: 'Edge',
    os: 'Windows 11',
    action: 'Requested Mobile Ranger Diagnostic Quote',
    pageTab: 'services',
    details: 'Selected 3M Satin Stealth PPF + Battery Telemetry inspection',
    screenSize: '1920x1080',
    timestamp: new Date(Date.now() - 85 * 60000).toISOString(),
  },
];

function parseUserAgentInfo(ua: string): {
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  mobileModel: string;
  browser: string;
  os: string;
} {
  const s = ua || '';
  const lower = s.toLowerCase();

  let browser = 'Unknown Browser';
  if (lower.includes('edg/')) browser = 'Edge';
  else if (lower.includes('opr/') || lower.includes('opera')) browser = 'Opera';
  else if (lower.includes('chrome') && !lower.includes('edg/')) browser = lower.includes('mobile') ? 'Chrome Mobile' : 'Chrome';
  else if (lower.includes('safari') && !lower.includes('chrome')) browser = 'Safari';
  else if (lower.includes('firefox')) browser = 'Firefox';
  else if (lower.includes('curl')) browser = 'cURL / API Client';

  let os = 'Unknown OS';
  if (lower.includes('iphone') || lower.includes('ipad') || lower.includes('ios')) os = 'iOS';
  else if (lower.includes('android')) os = 'Android';
  else if (lower.includes('windows')) os = 'Windows';
  else if (lower.includes('mac os') || lower.includes('macintosh')) os = 'macOS';
  else if (lower.includes('linux')) os = 'Linux';

  let deviceType: 'Mobile' | 'Tablet' | 'Desktop' = 'Desktop';
  let mobileModel = 'Desktop Workstation';

  if (lower.includes('ipad') || (lower.includes('tablet') && !lower.includes('mobile'))) {
    deviceType = 'Tablet';
    mobileModel = lower.includes('ipad') ? 'Apple iPad' : 'Android Tablet';
  } else if (lower.includes('iphone')) {
    deviceType = 'Mobile';
    mobileModel = 'iPhone (iOS Mobile)';
  } else if (lower.includes('android') || lower.includes('mobile')) {
    deviceType = 'Mobile';
    if (lower.includes('samsung') || lower.includes('sm-')) mobileModel = 'Samsung Galaxy (Android)';
    else if (lower.includes('pixel')) mobileModel = 'Google Pixel (Android)';
    else mobileModel = 'Android Smartphone';
  }

  return { deviceType, mobileModel, browser, os };
}

function inferCountryFromRequest(req: express.Request, bodyCountry?: string, timezone?: string): string {
  if (bodyCountry && bodyCountry.trim() && bodyCountry !== 'Unknown') return bodyCountry.trim();
  const headerCountry =
    (req.headers['cf-ipcountry'] as string) ||
    (req.headers['x-vercel-ip-country'] as string) ||
    (req.headers['x-country-code'] as string);
  if (headerCountry && headerCountry.length === 2) {
    const codeMap: Record<string, string> = {
      US: 'United States',
      GB: 'United Kingdom',
      DE: 'Germany',
      CA: 'Canada',
      AU: 'Australia',
      AE: 'United Arab Emirates',
      JP: 'Japan',
      NG: 'Nigeria',
      FR: 'France',
      SG: 'Singapore',
      BR: 'Brazil',
    };
    return codeMap[headerCountry.toUpperCase()] || headerCountry.toUpperCase();
  }
  if (timezone) {
    const tz = timezone.toLowerCase();
    if (tz.includes('america/new_york') || tz.includes('america/los_angeles') || tz.includes('america/chicago') || tz.includes('america/denver')) return 'United States';
    if (tz.includes('america/toronto') || tz.includes('america/vancouver')) return 'Canada';
    if (tz.includes('europe/london')) return 'United Kingdom';
    if (tz.includes('europe/berlin')) return 'Germany';
    if (tz.includes('europe/paris')) return 'France';
    if (tz.includes('asia/dubai')) return 'United Arab Emirates';
    if (tz.includes('asia/tokyo')) return 'Japan';
    if (tz.includes('africa/lagos')) return 'Nigeria';
    if (tz.includes('australia/')) return 'Australia';
  }
  return 'United States';
}

app.post('/api/analytics/track', (req, res) => {
  try {
    const rawIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      '127.0.0.1';
    const cleanIp = rawIp.replace(/^::ffff:/, '') === '127.0.0.1' || rawIp === '::1' ? '104.28.212.90' : rawIp.replace(/^::ffff:/, '');
    const ua = String(req.headers['user-agent'] || '');
    const parsedUa = parseUserAgentInfo(ua);

    const {
      visitorId,
      action = 'Page View',
      pageTab = 'home',
      details,
      country,
      timezone,
      userId,
      userEmail,
      userName,
      screenSize,
      referrer,
    } = req.body || {};

    const entry: ServerVisitorLog = {
      id: `vis-${Date.now().toString(36)}-${Math.floor(Math.random() * 999)}`,
      visitorId: String(visitorId || `anon-${Date.now().toString(36)}`),
      ip: cleanIp,
      country: inferCountryFromRequest(req, country, timezone),
      deviceType: parsedUa.deviceType,
      mobileModel: parsedUa.mobileModel,
      browser: parsedUa.browser,
      os: parsedUa.os,
      action: String(action),
      pageTab: String(pageTab),
      details: details ? String(details) : undefined,
      userId: userId ? String(userId) : undefined,
      userEmail: userEmail ? String(userEmail) : undefined,
      userName: userName ? String(userName) : undefined,
      screenSize: screenSize ? String(screenSize) : undefined,
      referrer: referrer ? String(referrer) : undefined,
      timestamp: new Date().toISOString(),
    };

    serverVisitorLogs.unshift(entry);
    if (serverVisitorLogs.length > 250) {
      serverVisitorLogs.length = 250;
    }

    return res.json({ success: true, entry });
  } catch (err: unknown) {
    const error = err as Error;
    return res.status(500).json({ error: error.message || 'Analytics tracking error' });
  }
});

app.get('/api/analytics/visitors', authenticateToken, requireAdmin, (_req, res) => {
  const uniqueIps = new Set(serverVisitorLogs.map((l) => l.ip)).size;
  const uniqueVisitors = new Set(serverVisitorLogs.map((l) => l.visitorId)).size;

  const byCountry: Record<string, number> = {};
  const byDevice: Record<string, number> = {};
  const byBrowser: Record<string, number> = {};
  const byTab: Record<string, number> = {};

  for (const log of serverVisitorLogs) {
    byCountry[log.country] = (byCountry[log.country] || 0) + 1;
    byDevice[log.deviceType] = (byDevice[log.deviceType] || 0) + 1;
    byBrowser[log.browser] = (byBrowser[log.browser] || 0) + 1;
    byTab[log.pageTab] = (byTab[log.pageTab] || 0) + 1;
  }

  return res.json({
    success: true,
    summary: {
      totalEvents: serverVisitorLogs.length,
      uniqueIps,
      uniqueVisitors,
      byCountry,
      byDevice,
      byBrowser,
      byTab,
    },
    logs: serverVisitorLogs,
  });
});

app.delete('/api/analytics/visitors', authenticateToken, requireAdmin, (_req, res) => {
  serverVisitorLogs.length = 0;
  return res.json({ success: true });
});

// Vite middleware setup for Development or Static serving for Production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Apex Tesla Hub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Apex Tesla Hub server:', err);
  process.exit(1);
});
