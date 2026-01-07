# SendGrid Setup Guide - Fix Email Issues on Render

## Why SendGrid?

**Render.com blocks Gmail SMTP connections**, causing `ETIMEDOUT` errors. SendGrid uses HTTP API which works perfectly on Render.

## Quick Setup (5 minutes)

### Step 1: Create SendGrid Account

1. Go to https://signup.sendgrid.com/
2. Sign up for free account (100 emails/day free)
3. Verify your email address

### Step 2: Create API Key

1. Go to SendGrid Dashboard → **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it: `House Service Production`
4. Select **Full Access** (or just Mail Send permissions)
5. Click **Create & View**
6. **COPY THE API KEY** (you won't see it again!)

### Step 3: Verify Sender Email

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details:
   - **From Email**: `your-email@gmail.com` (or your domain email)
   - **From Name**: `House Service Support Team`
   - Complete the form
4. Check your email and click the verification link

### Step 4: Add to Render Environment Variables

1. Go to Render Dashboard → Your Backend Service → **Environment** tab
2. Add these variables:

   **Required:**
   - `SENDGRID_API_KEY` = `SG.xxxxxxxxxxxxx` (the API key you copied)

   **Optional (recommended):**
   - `SENDGRID_FROM_EMAIL` = `your-verified-email@gmail.com`
   - `SENDGRID_FROM_NAME` = `House Service Support Team`

3. Click **Save Changes**
4. Render will automatically redeploy

### Step 5: Test

After deployment, test by creating a booking. Check Render logs - you should see:
```
[Email] Using SendGrid (attempt 1/2)
✅ Booking notification email sent to employee
```

## Fallback to Gmail

If `SENDGRID_API_KEY` is not set, the system will automatically fall back to Gmail SMTP (for localhost development).

## Troubleshooting

**Email still not working?**
1. Check Render logs for error messages
2. Verify `SENDGRID_API_KEY` is set correctly in Render
3. Make sure sender email is verified in SendGrid
4. Check SendGrid dashboard → Activity Feed for delivery status

**Need more emails?**
- Free tier: 100 emails/day
- Paid plans start at $19.95/month for 50,000 emails

## Benefits

✅ Works reliably on Render.com  
✅ Better deliverability than Gmail  
✅ Email analytics and tracking  
✅ No SMTP connection issues  
✅ Free tier is generous for most apps

