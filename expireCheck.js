const cron = require('node-cron');
const User = require('../models/User');
const sendMail = require('../utils/sendMail');

cron.schedule('0 0 * * *', async () => {
  const now = new Date();
  const users = await User.find({ isPremium: true, premiumExpiry: { $lt: now } });
  for (const user of users) {
    user.isPremium = false;
    user.premiumPlan = null;
    user.premiumExpiry = null;
    await user.save();

    await sendMail(
      user.email,
      'Premium Plan Expired',
      `Hi ${user.name}, your premium plan has expired. Please renew to continue benefits.`
    );
  }
});

