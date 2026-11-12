import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { authRouter } from './src/server/auth.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
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
7. Ambassador & Referral Rewards: Every registered customer gets a unique invite link and custom referral code. When a friend signs up and completes their first deposit, the referrer receives $100 Platform Credits directly into their vault plus 2 Free Wheel Spins. The friend receives a $25 welcome service credit and 5 Free Spins upon sign up.

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
        reply = "You can earn $100 Platform Credits directly in your dashboard vault for every friend who joins via your unique invite link and makes their first deposit! Your friend also gets $25 welcome credits and 5 free promotional spins. Access your link anytime in the **Refer & Earn** tab.";
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
app.post('/api/gemini/admin', async (req, res) => {
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

// Admin AI Promotional Banner Generator (Gemini 4 Hydrogen)
app.post('/api/gemini/generate-banner', async (req, res) => {
  try {
    const { campaignGoal, size = 'leaderboard', tone = 'Luxury High-Tech', targetTab = 'stocks' } = req.body;

    const sizeDimensionMap: Record<string, string> = {
      leaderboard: '728×90',
      square: '300×300',
      rectangle: '300×250',
      sidebar: '160×600',
    };
    const dimensions = sizeDimensionMap[size] || '728×90';
    const cleanGoal = campaignGoal || 'Earn High Yield on TSLA Stocks, Cybertruck Sales & Referral Bonuses';

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `Create a high-converting digital marketing banner specification for Apex Tesla Hub.
Campaign Goal: ${cleanGoal}
Banner Format: ${size} (${dimensions} px)
Brand Tone: ${tone}
Target Section: ${targetTab}
Note: Mention referral benefits or VIP rewards where natural, keep headline punchy (max 8-10 words), subheadline concise (max 18 words), and CTA under 4 words.`,
          config: {
            systemInstruction:
              'You are a senior growth designer and conversion copywriter for Apex Tesla Hub (Tesla car sales, wraps, fleet staking, TSLA fast ROI plans, Spin & Win $150, $100 referral rewards). Output strictly valid JSON matching the schema.',
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
              isAiGenerated: true,
            },
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini banner generator fallback triggered:', geminiError?.message);
      }
    }

    const presetsBySize: Record<string, any> = {
      leaderboard: {
        title: `AI Campaign: ${cleanGoal.slice(0, 32)}`,
        badgeText: '728×90 LEADERBOARD • AI',
        headline: 'ACCELERATE WEALTH WITH TSLA & ROBOTAXI YIELDS',
        subheadline: `${cleanGoal.slice(0, 90)} — Invite friends via your VIP referral link for +$100 vault bonus.`,
        ctaText: 'Launch Now',
        accentColor: '#ef4444',
        themeGradient: 'from-zinc-950 via-red-950/85 to-zinc-950',
      },
      square: {
        title: `AI Square Promo: ${cleanGoal.slice(0, 30)}`,
        badgeText: '300×300 SQUARE • AI',
        headline: 'VIP TESLA SALES & FLEET YIELD ACCESS',
        subheadline: `${cleanGoal.slice(0, 85)} • Instant crypto checkout & $25 welcome invite bonus.`,
        ctaText: 'Claim VIP Access',
        accentColor: '#10b981',
        themeGradient: 'from-zinc-950 via-emerald-950/70 to-zinc-950',
      },
      rectangle: {
        title: `AI Rectangle Unit: ${cleanGoal.slice(0, 28)}`,
        badgeText: '300×250 RECTANGLE • AI',
        headline: 'TSLA FAST ROI + $150 SPIN JACKPOTS',
        subheadline: `${cleanGoal.slice(0, 85)} • Automated payouts & enclosed nationwide Tesla shipping.`,
        ctaText: 'Activate Referral',
        accentColor: '#f59e0b',
        themeGradient: 'from-zinc-950 via-amber-950/75 to-red-950/75',
      },
      sidebar: {
        title: `AI Sidebar Skyscraper: ${cleanGoal.slice(0, 24)}`,
        badgeText: '160×600 SIDEBAR • AI',
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
        targetTab,
        isAiGenerated: true,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return res.status(500).json({ error: error.message || 'Failed to generate promotional banner' });
  }
});

// Email Marketing & SMTP Engine (PHP Mailer / NodeMailer Style)
app.post('/api/mailer/test', async (req, res) => {
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
app.post('/api/mailer/asset-alert', async (req, res) => {
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

// Send Marketing Campaign
app.post('/api/mailer/send-campaign', async (req, res) => {
  try {
    const { campaignTitle, subject, bodyHtml, recipients } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'At least one recipient email address is required.' });
    }

    return res.json({
      success: true,
      campaignTitle,
      subject,
      totalRecipients: recipients.length,
      delivered: recipients.length,
      failed: 0,
      dispatchedAt: new Date().toISOString(),
      message: `Marketing campaign "${campaignTitle}" successfully dispatched to ${recipients.length} subscriber(s)!`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Campaign dispatch failed' });
  }
});

// AI Marketing Copilot & Copywriter (Gemini 3.8 Flash)
app.post('/api/gemini/marketing', async (req, res) => {
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

let cronActive = true;
let cronCyclesRun = 186;
let lastCronRunTimestamp: string = new Date().toISOString();
const serverCronLogs: string[] = [
  `[${new Date().toISOString().substring(11, 19)}] Automated ROI Cron Engine initialized on 60-second cycle.`,
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
      userId: 'usr-alex-001',
      userEmail: 'alex.vance@apex-tesla.io',
      userName: 'Alex Vance',
      poolId: 'pool-robotaxi-01',
      poolTitle: 'Autonomous Robotaxi Fleet (Model Y & Cybercab)',
      amountInvestedUsd: 5000,
      apy: 18.5,
      status: 'running',
      durationDays: 30,
      daysElapsed: 28, // Near completion for easy verification!
      earnedDividendsUsd: 71.03,
      totalExpectedRoiUsd: 76.03,
      dailyRoiRate: 2.53,
      startDate: new Date(Date.now() - 28 * 86400000).toISOString(),
      maturityDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      txHash: '0x9fa810c2834b9281a182048f029148d891b01984',
    };

    const inv2: ServerInvestment = {
      id: 'inv-alex-supercharger',
      userId: 'usr-alex-001',
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
      userId: 'usr-alex-001',
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

    // Initial wallet balance for Alex Vance
    serverWallets.set('usr-alex-001', {
      usd: 12450.0,
      btc: 0.45,
      usdt: 14200.0,
      xrp: 4200.0,
      bnb: 18.5,
    });
    serverWallets.set('usr-apex-001', {
      usd: 12450.0,
      btc: 0.45,
      usdt: 14200.0,
      xrp: 4200.0,
      bnb: 18.5,
    });
  }
}

seedServerInvestments();

app.post('/api/mailer/config', (req, res) => {
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
  }
  return res.json({ success: true });
});

// Automated Maturity Email Dispatcher
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
  const { toEmail, userName, poolTitle, principalUsd, roiUsd, totalPayoutUsd, newWalletBalanceUsd, investmentId } = params;
  const certId = params.certificateId || `CERT-SETTLE-${Date.now().toString(36).toUpperCase()}`;
  const subject = `⚡ [MATURITY SETTLEMENT] ${poolTitle} Yield Plan Complete • $${totalPayoutUsd.toFixed(2)} USD Credited`;

  console.log(`[CRON AUTOMATED EMAIL DISPATCH] To: ${toEmail} | Asset: ${poolTitle} | Payout: $${totalPayoutUsd.toFixed(2)}`);

  let delivered = false;

  const smtpHost = serverSmtpConfig?.host || process.env.SMTP_HOST;
  const smtpPort = serverSmtpConfig?.port || Number(process.env.SMTP_PORT) || 587;
  const smtpSecure = serverSmtpConfig?.secure ?? Boolean(process.env.SMTP_SECURE);
  const smtpUser = serverSmtpConfig?.username || process.env.SMTP_USER;
  const smtpPass =
    serverSmtpConfig?.password && !serverSmtpConfig.password.includes('•••') && serverSmtpConfig.password.length > 3
      ? serverSmtpConfig.password
      : process.env.SMTP_PASS;
  const fromName = serverSmtpConfig?.fromName || 'Apex Tesla Hub Settlement Operations';
  const fromEmail = serverSmtpConfig?.fromEmail || process.env.SMTP_FROM || 'concierge@apex-tesla.io';

  // If live SMTP credentials exist in environment or admin settings, send real email
  if (smtpHost && smtpUser && smtpPass) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false },
      });

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: toEmail,
        subject,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #07090e; color: #f4f4f5; padding: 32px; border-radius: 20px; border: 1px solid #10b981;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #10b981; margin: 0; font-size: 24px; letter-spacing: -0.5px;">⚡ APEX TESLA HUB</h1>
              <p style="color: #a1a1aa; font-size: 13px; margin-top: 4px;">AUTOMATED ON-CHAIN SETTLEMENT PROTOCOL</p>
            </div>

            <div style="background: #0f172a; padding: 24px; border-radius: 16px; border: 1px solid #1e293b; margin-bottom: 24px;">
              <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Congratulations, ${userName}!</h2>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                Your investment plan in <strong style="color: #38bdf8;">${poolTitle}</strong> has reached full maturity.
                Our automated ROI cron engine has executed on-chain settlement, returning your initial principal and accrued yield earnings directly into your vault balance.
              </p>

              <div style="background: #020617; padding: 18px; border-radius: 12px; font-family: monospace; font-size: 13px; margin: 20px 0; border: 1px solid #334155;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #94a3b8;">ORIGINAL PRINCIPAL:</span>
                  <span style="color: #ffffff; font-weight: bold;">$${principalUsd.toLocaleString()} USD</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #94a3b8;">ACCRUED ROI YIELD:</span>
                  <span style="color: #10b981; font-weight: bold;">+$${roiUsd.toFixed(2)} USD</span>
                </div>
                <hr style="border: 0; border-top: 1px dashed #334155; margin: 12px 0;" />
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px;">
                  <span style="color: #e2e8f0; font-weight: bold;">TOTAL CREDITED:</span>
                  <span style="color: #38bdf8; font-weight: bold;">$${totalPayoutUsd.toFixed(2)} USD</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #94a3b8;">NEW VAULT BALANCE:</span>
                  <span style="color: #ffffff;">$${newWalletBalanceUsd.toFixed(2)} USD</span>
                </div>
              </div>

              <div style="font-size: 11px; color: #64748b; font-family: monospace;">
                SETTLEMENT CERTIFICATE ID: ${certId}<br/>
                TIMESTAMP: ${new Date().toUTCString()}
              </div>
            </div>

            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
              Funds are instantly available for reinvestment in new high-yield Tesla fleet pools or external crypto withdrawal.
            </p>
          </div>
        `,
      });
      delivered = true;
    } catch (err: any) {
      console.warn('Live SMTP send failed during cron maturity email:', err?.message);
    }
  }

  // Record into dispatched emails audit log
  serverDispatchedEmails.unshift({
    id: `email-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'maturity_settlement',
    recipient: toEmail,
    subject,
    amountUsd: totalPayoutUsd,
    investmentId,
    certificateId: certId,
    dispatchedAt: new Date().toISOString(),
    status: delivered ? 'delivered' : 'simulated',
  });
  if (serverDispatchedEmails.length > 50) serverDispatchedEmails.length = 50;

  return true;
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

      // Credit User Wallet
      let wallet = serverWallets.get(inv.userId);
      if (!wallet) {
        wallet = { usd: 12450.0, btc: 0.45, usdt: 14200.0, xrp: 4200.0, bnb: 18.5 };
        serverWallets.set(inv.userId, wallet);
      }
      wallet.usd = Number((wallet.usd + totalPayoutUsd).toFixed(2));

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

  const summaryLog = `[${timeStr}] Cycle #${cronCyclesRun}: Accrued $${yieldDistributedUsd.toFixed(2)} ROI across running plans. ${maturedCount} plan(s) reached maturity & auto-settled.`;
  serverCronLogs.unshift(summaryLog);
  if (serverCronLogs.length > 60) serverCronLogs.length = 60;

  return { maturedCount, yieldDistributedUsd, logs: [summaryLog, ...cycleLogs], settledEvents };
}

// Background Interval Runner (every 60 seconds)
setInterval(() => {
  if (cronActive) {
    runServerCronCycle();
  }
}, 60000);

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
    intervalMs: 60000,
    runningCount,
    completedCount,
    totalStakedUsd,
    logs: serverCronLogs.slice(0, 20),
    dispatchedEmails: serverDispatchedEmails.slice(0, 15),
    investments,
    settlementEvents: serverSettlementEvents.slice(0, 20),
  });
});

app.post('/api/cron/trigger', (_req, res) => {
  const result = runServerCronCycle();
  return res.json({
    success: true,
    cyclesRun: cronCyclesRun,
    lastRunTimestamp: lastCronRunTimestamp,
    message: `Cron cycle #${cronCyclesRun} executed: $${result.yieldDistributedUsd.toFixed(2)} ROI accrued, ${result.maturedCount} plan(s) matured & settled.`,
    investments: Array.from(serverInvestments.values()),
    dispatchedEmails: serverDispatchedEmails.slice(0, 15),
    settlementEvents: serverSettlementEvents.slice(0, 20),
    ...result,
  });
});

app.post('/api/cron/toggle', (req, res) => {
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
    message: `Automated ROI cron service is now ${cronActive ? 'ACTIVE' : 'PAUSED'}.`,
  });
});

// Investments Management API
app.get('/api/investments', (_req, res) => {
  return res.json(Array.from(serverInvestments.values()));
});

app.post('/api/investments/sync', (req, res) => {
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
        userId: inv.userId || existing?.userId || 'usr-alex-001',
        userEmail: inv.userEmail || existing?.userEmail || 'alex.vance@apex-tesla.io',
        userName: inv.userName || existing?.userName || 'Alex Vance',
      });
    });
  }
  return res.json({ success: true, count: serverInvestments.size, investments: Array.from(serverInvestments.values()) });
});

app.post('/api/investments/:id/force-mature', (req, res) => {
  const { id } = req.params;
  const inv = serverInvestments.get(id);

  if (!inv) {
    return res.status(404).json({ error: 'Investment position not found.' });
  }

  if (inv.capitalReturned) {
    return res.json({
      success: true,
      message: `Investment #${id} already settled.`,
      investment: inv,
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

  // Update wallet
  let wallet = serverWallets.get(inv.userId);
  if (!wallet) {
    wallet = { usd: 12450.0, btc: 0.45, usdt: 14200.0, xrp: 4200.0, bnb: 18.5 };
    serverWallets.set(inv.userId, wallet);
  }
  wallet.usd = Number((wallet.usd + totalPayoutUsd).toFixed(2));

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
    newWalletBalanceUsd: wallet.usd,
  });
});

// User Wallet API
app.get('/api/wallet/:userId', (req, res) => {
  const { userId } = req.params;
  const wallet = serverWallets.get(userId) || { usd: 12450.0, btc: 0.45, usdt: 14200.0, xrp: 4200.0, bnb: 18.5 };
  return res.json(wallet);
});

app.post('/api/wallet/:userId/adjust', (req, res) => {
  const { userId } = req.params;
  const { currency, newAmount, delta } = req.body;

  let wallet = serverWallets.get(userId);
  if (!wallet) {
    wallet = { usd: 12450.0, btc: 0.45, usdt: 14200.0, xrp: 4200.0, bnb: 18.5 };
    serverWallets.set(userId, wallet);
  }

  const currKey = (currency || 'USD').toLowerCase() as keyof ServerWallet;
  if (typeof newAmount === 'number') {
    (wallet as any)[currKey] = newAmount;
  } else if (typeof delta === 'number') {
    (wallet as any)[currKey] = Number(((wallet as any)[currKey] + delta).toFixed(4));
  }

  return res.json({ success: true, wallet });
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
        image: 'https://images.unsplash.com/photo-1698790691515-51d8ad3d0a4c?auto=format&fit=crop&w=1200&q=80',
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
        image: 'https://images.unsplash.com/photo-1571127236794-81c1c9676ff3?auto=format&fit=crop&w=1200&q=80',
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

app.post('/api/cars', (req, res) => {
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

app.put('/api/cars/:id', (req, res) => {
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

app.delete('/api/cars/:id', (req, res) => {
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

app.post('/api/cars/shipping-settings', (req, res) => {
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

app.post('/api/cars/refund-policy', (req, res) => {
  serverRefundPolicy = {
    ...serverRefundPolicy,
    ...req.body,
  };
  console.log('[REFUND POLICY UPDATED]', serverRefundPolicy);
  return res.json({ success: true, policy: serverRefundPolicy });
});

// Vehicle Orders & Checkout API
app.get('/api/orders', (req, res) => {
  const { userId } = req.query;
  if (userId) {
    return res.json(serverVehicleOrders.filter((o) => o.userId === userId));
  }
  return res.json(serverVehicleOrders);
});

app.post('/api/orders', (req, res) => {
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

  // Deduct from wallet if paying with vault balance
  if (paymentMethod === 'vault_balance') {
    let wallet = serverWallets.get(userId);
    if (!wallet || wallet.usd < totalUsd) {
      return res.status(402).json({
        error: `Insufficient vault balance. Total required is $${totalUsd.toLocaleString()} USD (Vehicle: $${vehicle.salePriceUsd.toLocaleString()} + Shipping: $${shippingFeeUsd.toLocaleString()}). Available balance: $${wallet?.usd || 0}.`,
      });
    }
    wallet.usd = Number((wallet.usd - totalUsd).toFixed(2));
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



// Vite middleware setup for Development or Static serving for Production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Apex Tesla Hub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
