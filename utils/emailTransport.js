const nodemailer = require("nodemailer");
const axios = require("axios");

// Check if SendGrid is configured (preferred - works on Render)
// Exported at bottom of file

// SendGrid HTTP API (works reliably on Render)
async function sendViaSendGrid(mailOptions) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER || "noreply@house-service.com";
  const fromName = process.env.SENDGRID_FROM_NAME || "House Service Support Team";

  const payload = {
    personalizations: [{
      to: [{ email: mailOptions.to }],
      subject: mailOptions.subject,
    }],
    from: {
      email: fromEmail,
      name: fromName,
    },
    content: [
      {
        type: "text/plain",
        value: mailOptions.text || "",
      },
      {
        type: "text/html",
        value: mailOptions.html || mailOptions.text || "",
      },
    ],
  };

  const response = await axios.post(
    "https://api.sendgrid.com/v3/mail/send",
    payload,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 10000, // 10 second timeout
    }
  );

  return {
    messageId: response.headers["x-message-id"] || `sendgrid-${Date.now()}`,
    accepted: [mailOptions.to],
  };
}

// Fallback to Gmail SMTP (for localhost)
function createGmailTransport() {
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_PORT || 587);
  const secure = port === 465;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER or EMAIL_PASS is missing in environment variables");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    requireTLS: !secure,
    tls: {
      servername: host,
      rejectUnauthorized: false,
    },
  });
}

// Main email sending function - tries SendGrid first, falls back to Gmail
async function sendEmailWithRetry(mailOptions, maxRetries = 2) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Prefer SendGrid if configured (works on Render)
      if (isSendGridConfigured()) {
        console.log(`[Email] Using SendGrid (attempt ${attempt}/${maxRetries})`);
        const info = await sendViaSendGrid(mailOptions);
        return { success: true, info };
      }

      // Fallback to Gmail SMTP (for localhost)
      console.log(`[Email] Using Gmail SMTP (attempt ${attempt}/${maxRetries})`);
      const transporter = createGmailTransport();
      const info = await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Email send timeout after 15s")), 15000)
        ),
      ]);
      return { success: true, info };
    } catch (error) {
      lastError = error;
      console.error(`Email send attempt ${attempt}/${maxRetries} failed:`, error.message);

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Retrying email in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return { success: false, error: lastError };
}

// Legacy function for backward compatibility
function createEmailTransport() {
  if (isSendGridConfigured()) {
    // Return a mock transporter that uses SendGrid
    return {
      sendMail: async (mailOptions) => {
        const result = await sendEmailWithRetry(mailOptions, 1);
        if (!result.success) throw result.error;
        return result.info;
      },
    };
  }
  return createGmailTransport();
}

function getEmailConfig() {
  return {
    provider: isSendGridConfigured() ? "SendGrid" : "Gmail SMTP",
    fromEmail: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER,
  };
}

// Export helper for server startup check
function isSendGridConfigured() {
  return !!process.env.SENDGRID_API_KEY;
}

module.exports = {
  getEmailConfig,
  createEmailTransport,
  sendEmailWithRetry,
  isSendGridConfigured,
};


