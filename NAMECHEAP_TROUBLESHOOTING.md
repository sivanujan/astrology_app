# 🔍 Namecheap Email Troubleshooting Guide

## ❌ Current Issue

**Authentication Error (EAUTH):** Cannot connect to Namecheap SMTP server

```
Error: Missing credentials
Code: EAUTH
```

This means Namecheap is rejecting the email/password combination.

---

## ✅ What to Check

### 1. Verify Email Account Exists

**Log in to Namecheap:**
1. Go to: https://www.namecheap.com/myaccount/login/
2. Go to **Dashboard** → Select your domain (**astrozen.app**)
3. Find **"PrivateEmail"** or **"Email"** section
4. Check if `support@astrozen.app` exists

**If it doesn't exist:**
- Create it now
- Set a new password
- Update `.env` with new password

### 2. Verify Password is Correct

**Reset your email password:**
1. In Namecheap dashboard → Email section
2. Find `support@astrozen.app`
3. Click **"Reset Password"** or **"Change Password"**
4. Set a NEW simple password (without special characters for now)
   - Example: `MyPassword123` (no #  $ ! symbols)
5. Update `.env` with the new password

### 3. Check SMTP Settings

Namecheap PrivateEmail SMTP settings should be:

| Setting | Value |
|---------|-------|
| Server | `mail.privateemail.com` |
| Port | `465` (SSL) or `587` (TLS) |
| Username | Full email: `support@astrozen.app` |
| Password | Your email password |

### 4. Verify SMTP is Enabled

Some Namecheap email plans don't include SMTP access by default:

1. Check your email plan features
2. Verify "SMTP sending" is enabled
3. Check if there are any restrictions on your account

### 5. Check for Two-Factor Authentication

If your Namecheap account has 2FA:
- You might need an **App Password** instead of your regular password
- Check Namecheap documentation for app passwords

---

## 🔧 Quick Fix: Try Gmail Temporarily

While troubleshooting Namecheap, you can use Gmail to test that everything else works:

### Update `backend/.env`:
```env
# Temporarily use Gmail
EMAIL_USER=yourpersonal@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Comment out Namecheap settings
# SMTP_HOST=mail.privateemail.com
# SMTP_PORT=465
```

### Update `backend/services/emailService.js` (line 13-26):
```javascript
this.transporter = nodemailer.createTransport({
    service: 'gmail',  // Temporarily use Gmail
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
```

This way you can:
1. Test that your custom email template works
2. Verify the whole system is functioning
3. Then fix Namecheap later

---

## 📞 Contact Namecheap Support

If nothing works, contact Namecheap:

**Support URL:** https://www.namecheap.com/support/

**Ask them:**
1. "Is SMTP enabled for my email account `support@astrozen.app`?"
2. "What are the correct SMTP server settings?"
3. "Are there any restrictions on my account?"
4. "Can you verify my email credentials are correct?"

---

## 🎯 Recommended Next Steps

### Option A: Use Gmail Temporarily (Fastest)
1. Switch to Gmail configuration (see above)
2. Test the whole email system
3. Fix Namecheap issues later
4. Switch back when ready

### Option B: Fix Namecheap Now
1. Log in to Namecheap dashboard
2. Verify `support@astrozen.app` exists
3. Reset password to something simple (no special chars)
4. Update `.env` with new password
5. Test again: `node backend/test-namecheap-connection.js`

### Option C: Create New Email
1. Create a new email like `verify@astrozen.app`
2. Use a simple password
3. Update `.env` with new credentials
4. Test connection

---

## 🧪 Test Commands

After making changes:

```bash
# Test configuration
node backend/check-email-config.js

# Test connection
node backend/test-namecheap-connection.js

# Test all possible configurations
node backend/test-all-namecheap-configs.js
```

---

## ✅ When It Works

You'll see:
```
✅ SUCCESS! Connected to Namecheap email server!
📧 Emails will be sent from: support@astrozen.app
```

Then restart your server:
```bash
npm run dev:all
```

And test registration to send a verification email!

---

**My recommendation: Try Gmail temporarily so you can test the system, then troubleshoot Namecheap.**
