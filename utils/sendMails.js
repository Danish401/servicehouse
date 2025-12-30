const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports.sendExpiryMail = async (to, name, daysLeft) => {
  await transporter.sendMail({
    from: `"House Services" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your Premium Plan is expiring in ${daysLeft} day(s)!`,
    html: `<h2>Hello ${name},</h2>
      <p>Your premium subscription will expire in <b>${daysLeft} day(s)</b>.</p>
      <p>Renew now to continue enjoying benefits!</p>`,
  });
};
