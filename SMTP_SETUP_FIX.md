# 🔧 Fix Gmail SMTP Authentication Error

## ❌ Error You're Seeing

```
Failed to send OTP email: Invalid login: 535-5.7.8 Username and Password not accepted
```

This means Gmail is rejecting your credentials. You need to use a **Gmail App Password**, not your regular password.

---

## ✅ Quick Fix (5 minutes)

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

1. Open `.env` file in the project root
2. Find or add these lines:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-actual-email@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=your-actual-email@gmail.com
SMTP_SECURE=false
```

**Important**:
- Replace `your-actual-email@gmail.com` with your actual Gmail address
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
# Stop the server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### Step 5: Test

1. Go to: http://localhost:3000
2. Register a new user
3. Click "Send OTP"
4. Check your email inbox!

---

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

---

## 🆘 Still Not Working?

### Check 1: App Password Format
- Must be exactly 16 characters
- No spaces
- Generated from https://myaccount.google.com/apppasswords

### Check 2: 2-Step Verification
- Must be enabled before generating App Password
- Check: https://myaccount.google.com/security

### Check 3: Server Restart
- **Always restart** after changing `.env`
- Environment variables are loaded at startup

### Check 4: Email Address
- Use the **exact same email** that you used to generate the App Password
- `SMTP_USER` and `SMTP_FROM` should match

### Check 5: Test Connection

Create a test file `test-smtp.js`:

```javascript
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify()
  .then(() => console.log('✅ SMTP connection successful!'))
  .catch(err => console.error('❌ SMTP error:', err.message));
```

Run:
```bash
node test-smtp.js
```

---

## ✅ Success Indicators

When it works, you'll see:
- ✅ "OTP sent successfully" message
- ✅ Email arrives in inbox (check spam too!)
- ✅ No authentication errors in console

---

**Need more help?** Check the server console for detailed error messages.

