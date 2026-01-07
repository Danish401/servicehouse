# 🚨 QUICK FIX: Email Not Working on Render

## The Problem
Your logs show: `[Email] Using Gmail SMTP` → This means **SendGrid is NOT configured**.

Render.com **BLOCKS Gmail SMTP**, so emails will always timeout until you add SendGrid.

## ⚡ 3-Minute Fix

### Step 1: Get SendGrid API Key (2 minutes)
1. Go to: **https://signup.sendgrid.com/**
2. Sign up (free account - 100 emails/day)
3. Verify your email
4. Go to: **Settings → API Keys → Create API Key**
5. Name: `House Service`
6. Permissions: **Full Access** (or just "Mail Send")
7. **COPY THE KEY** (starts with `SG.`)

### Step 2: Add to Render (1 minute)
1. Go to: **Render Dashboard → Your Backend Service**
2. Click **Environment** tab
3. Click **Add Environment Variable**
4. Add:
   - **Key**: `SENDGRID_API_KEY`
   - **Value**: `SG.xxxxxxxxxxxxx` (paste your key)
5. Click **Save Changes**
6. Render will auto-redeploy

### Step 3: Verify (30 seconds)
After redeploy, check Render logs. You should see:
```
✅ Email service: SendGrid API configured (recommended for Render.com)
```

Instead of:
```
⚠️  WARNING: SendGrid API key not found!
```

## ✅ That's It!

After adding `SENDGRID_API_KEY`, emails will work immediately. No code changes needed!

---

**Still not working?**
- Check Render logs for error messages
- Make sure API key starts with `SG.`
- Verify sender email in SendGrid dashboard

