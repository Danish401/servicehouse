const nodemailer = require("nodemailer");

function getEmailConfig() {
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_PORT || 587); // 587 works better on many hosts than 465
  const secure =
    typeof process.env.EMAIL_SECURE === "string"
      ? process.env.EMAIL_SECURE === "true"
      : port === 465;

  return {
    host,
    port,
    secure,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  };
}

function createEmailTransport() {
  const cfg = getEmailConfig();

  if (!cfg.user || !cfg.pass) {
    throw new Error("EMAIL_USER or EMAIL_PASS is missing in environment variables");
  }

  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
    // Aggressive timeouts for Render.com (they block Gmail SMTP)
    connectionTimeout: 10000, // 10 seconds - fail fast
    greetingTimeout: 10000,
    socketTimeout: 10000,
    // STARTTLS on 587
    requireTLS: !cfg.secure,
    tls: {
      servername: cfg.host,
      rejectUnauthorized: false, // Allow self-signed certs if needed
    },
    // Pool connections
    pool: true,
    maxConnections: 1,
    maxMessages: 1,
  });
}

// Retry email sending with exponential backoff
async function sendEmailWithRetry(mailOptions, maxRetries = 2) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const transporter = createEmailTransport();
      const info = await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email send timeout after 15s')), 15000)
        )
      ]);
      return { success: true, info };
    } catch (error) {
      lastError = error;
      console.error(`Email send attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
        console.log(`Retrying email in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return { success: false, error: lastError };
}

module.exports = {
  getEmailConfig,
  createEmailTransport,
  sendEmailWithRetry,
};


