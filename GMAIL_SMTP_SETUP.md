# 🚀 Gmail SMTP Setup Guide

## Quick Setup (5 minutes)

### Step 1: Enable 2-Step Verification

1. Go to: **https://myaccount.google.com/security**
2. Find **"2-Step Verification"** and click it
3. Follow the prompts to enable it (you'll need your phone)

### Step 2: Generate App Password

1. Go to: **https://myaccount.google.com/apppasswords**
2. You might need to sign in again
3. Select:
   - **App**: Choose "Mail"
   - **Device**: Choose "Other (Custom name)"
   - **Name**: Enter "PCE Campus Assistant"
4. Click **"Generate"**
5. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File

Open your `.env` file in the project root and add/update these lines:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=your-email@gmail.com
SMTP_SECURE=false
```

**Important**:
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `abcdefghijklmnop` with the 16-character App Password (remove spaces!)
- The App Password should be 16 characters with NO spaces

**Example**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=john.doe@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM=john.doe@gmail.com
SMTP_SECURE=false
```

**After copying, remove spaces**:
```env
SMTP_PASS=abcdefghijklmnop
```

### Step 4: Restart Server

**IMPORTANT**: You MUST restart the server after updating `.env`!

```bash
# Stop the server (Ctrl+C) then:
npm run dev
```

### Step 5: Test

1. Go to: http://localhost:3000
2. Register a new user
3. Click "Send OTP"
4. Check your email inbox!

## ✅ Verification Checklist

- [ ] Enabled 2-Step Verification on Google Account
- [ ] Generated Gmail App Password
- [ ] Updated `.env` with Gmail credentials
- [ ] Removed spaces from App Password
- [ ] Restarted the server
- [ ] Tested sending an OTP email

## 🔍 Verify Your Setup

Check your `.env` file has:

```bash
# ✅ Correct format
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=16characterpasswordnospaces

# ❌ Wrong - using regular password
SMTP_PASS=your-regular-gmail-password

# ❌ Wrong - has spaces
SMTP_PASS=abcd efgh ijkl mnop
```

## 🆘 Troubleshooting

### "Invalid credentials" error
- ✅ Use App Password, NOT your regular Gmail password
- ✅ Make sure 2-Step Verification is enabled
- ✅ Remove spaces from App Password
- ✅ Restart server after updating .env

### "Connection timeout" error
- ✅ Check internet connection
- ✅ Verify SMTP settings in .env

### Still not receiving?
- ✅ Check spam folder
- ✅ Verify email address is correct
- ✅ Check server console for errors

## 📧 Need Help?

1. Verify 2-Step Verification is enabled: https://myaccount.google.com/security
2. Generate new App Password: https://myaccount.google.com/apppasswords
3. Check server logs for detailed error messages

---

**Ready to go!** Once configured, your OTP emails will be sent via Gmail SMTP.

