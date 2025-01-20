const nodemailer = require("nodemailer");

const sendMail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: process.env.ETHEREAL_USER,
      pass: process.env.ETHEREAL_PASS,
    },
  });

  await transporter.sendMail({
    from: "alid13381@gmail.com",
    to: email,
    subject: "Your OTP for Password Reset",
    text: `Your OTP is: ${otp}`,
    html: `<b>Your OTP is: ${otp}</b>`,
  });
};

module.exports = sendMail;
