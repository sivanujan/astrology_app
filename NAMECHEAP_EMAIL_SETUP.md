# 📧 Namecheap Email Setup - Complete Guide

## ✅ Namecheap PrivateEmail Configuration

You're using Namecheap! Here's your exact setup:

---

## 🔧 Step-by-Step Setup

### Step 1: Create Email Account on Namecheap

1. **Log in to Namecheap:** https://www.namecheap.com/myaccount/login/
2. **Go to Dashboard** → Click on your domain
3. **Find "PrivateEmail"** or **"Email"** section
4. **Create a new email:**
   - Username: `noreply` or `support` or `verify`
   - Full email: `noreply@anehep.com`
   - Password: Create a strong password
   - **IMPORTANT:** Save this password!

### Step 2: Your `.env` Configuration

I've already updated your `backend/.env` file with Namecheap settings:

```env
# Namecheap Email Configuration
EMAIL_USER=noreply@anehep.com
EMAIL_PASSWORD=your-email-password-here

# Namecheap SMTP Settings
SMTP_HOST=mail.privateemail.com
SMTP_PORT=465

FRONTEND_URL=http://localhost:5173
```

**NOW YOU NEED TO:**
1. Open `backend/.env`
2. Replace `noreply@anehep.com` with your actual email
3. Replace `your-email-password-here` with your email password

### Step 3: Email Service Already Updated! ✅

I've already updated `backend/services/emailService.js` to use Namecheap SMTP!

---

## 🧪 Test Your Configuration

### Test 1: Check Configuration
```bash
node backend/check-email-config.js
```

You should see:
```
✅ EMAIL_USER: noreply@anehep.com
✅ EMAIL_PASSWORD: **************** (hidden)
✅ SMTP_HOST: mail.privateemail.com
✅ SMTP_PORT: 465
```

### Test 2: Send Test Email
```bash
node backend/test-email.js
```

Change the test email in the script to your own email to receive the test.

### Test 3: Restart Your Server
```bash
# Stop with Ctrl+C, then:
npm run dev:all
```

---

## 📧 Namecheap SMTP Details

| Setting | Value |
|---------|-------|
| **SMTP Host** | `mail.privateemail.com` |
| **SMTP Port** | `465` (SSL) or `587` (TLS) |
| **Security** | SSL/TLS |
| **Username** | Your full email address |
| **Password** | Your email password |

---

## 🎯 What Users Will See

Emails will be sent from:
```
From: SIVA ASTRO <noreply@anehep.com>
Subject: Verify Your Email - SIVA ASTRO
```

Beautiful, professional, and branded! ✨

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Connection refused" or "Authentication failed"

**Solution:**
- Double-check your email password
- Make sure the email account exists in Namecheap
- Try port 587 instead of 465 (see alternative config below)

### Issue 2: "Self-signed certificate error"

**Solution:** Already handled in the code with:
```javascript
tls: {
    rejectUnauthorized: false
}
```

### Issue 3: Email not arriving

**Solution:**
- Check spam folder
- Verify email account is active in Namecheap
- Test with a different recipient email

---

## 🔄 Alternative Configuration (Port 587)

If port 465 doesn't work, try port 587:

In `backend/.env`:
```env
SMTP_PORT=587
```

The code will automatically use TLS mode for port 587.

---

## 📋 Quick Checklist

- [ ] Created email account in Namecheap (e.g., noreply@anehep.com)
- [ ] Updated `backend/.env` with email and password
- [ ] Verified SMTP settings: `mail.privateemail.com` and port `465`
- [ ] Ran `node backend/check-email-config.js` ✅
- [ ] Ran `node backend/test-email.js` ✅
- [ ] Restarted server with `npm run dev:all`
- [ ] Tested registration to receive verification email

---

## 🎉 You're All Set!

Once you add your Namecheap email credentials to `.env`:

1. ✅ Emails send from your domain
2. ✅ Beautiful custom HTML template
3. ✅ Professional branding
4. ✅ Perfect user experience

---

## 🆘 Need More Help?

If you have issues:
1. Check Namecheap support: https://www.namecheap.com/support/knowledgebase/article.aspx/308/2214/how-to-set-up-free-email-forwarding
2. Verify your email quota (Namecheap has sending limits)
3. Contact Namecheap support if SMTP is blocked

---

**Your configuration is ready! Just add your email password and test!** 🚀
