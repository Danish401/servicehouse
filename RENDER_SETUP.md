# Render.com Environment Variables Setup Guide

## Why Emails Work Locally But Not in Production

In **localhost**, your `.env` file contains the email credentials.
In **production (Render.com)**, environment variables must be set in the Render dashboard.

## Required Environment Variables for Email

You need to set these in Render.com:

1. `EMAIL_USER` - Your Gmail address (e.g., `your-email@gmail.com`)
2. `EMAIL_PASS` - Gmail App Password (NOT your regular Gmail password)

## Step-by-Step Setup:

### 1. Get Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** (left sidebar)
3. Enable **2-Step Verification** (if not already enabled)
4. Scroll down and click **App passwords**
5. Select app: **Mail**
6. Select device: **Other (Custom name)** → Type "Render"
7. Click **Generate**
8. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### 2. Set Environment Variables in Render.com

1. Go to https://dashboard.render.com/
2. Click on your **backend service** (the one showing `house-service-9q6h.onrender.com`)
3. Click on **Environment** tab (left sidebar)
4. Click **Add Environment Variable** button
5. Add these variables:

   **Variable 1:**
   - Key: `EMAIL_USER`
   - Value: `your-email@gmail.com` (your actual Gmail address)

   **Variable 2:**
   - Key: `EMAIL_PASS`
   - Value: `your-16-char-app-password` (the App Password from step 1, remove spaces)

6. Click **Save Changes**
7. **IMPORTANT:** Render will automatically redeploy your service

### 3. Verify Email Configuration

After deployment, check your Render logs. You should see:
- ✅ `Email service ready - SMTP connection verified` 
- If you see ❌ or ⚠️, check the error message and fix it

### 4. Test Email Functionality

After setting up, test by:
1. Creating a booking in your live site
2. Cancelling a booking
3. Check the recipient's email inbox

## Troubleshooting

**If emails still don't work:**

1. **Check Render Logs:**
   - Go to Render dashboard → Your service → **Logs** tab
   - Look for email-related errors

2. **Verify App Password:**
   - Make sure you're using App Password, not regular password
   - Remove spaces from the password when pasting

3. **Check Gmail Settings:**
   - Make sure "Less secure app access" is NOT required (App Passwords don't need this)
   - If using organization email, check with IT about SMTP restrictions

4. **Test Connection:**
   - After setting variables, your server logs will show connection status
   - Look for "✅ Email service ready" or error messages

## Other Environment Variables Needed

Make sure these are also set in Render:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- Any other variables from your `.env` file

