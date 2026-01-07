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
    // Timeouts (Render was timing out)
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
    // STARTTLS on 587
    requireTLS: !cfg.secure,
    tls: {
      servername: cfg.host,
    },
  });
}

module.exports = {
  getEmailConfig,
  createEmailTransport,
};


