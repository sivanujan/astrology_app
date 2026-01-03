# 🌐 Setup Custom Domain Email

## ✅ Using Your Own Domain for Emails

You have a domain and want emails to send from `noreply@yourdomain.com` instead of Gmail.

---

## 📋 What You Need

1. ✅ Your domain (e.g., `anehep.com`)
2. ✅ Email hosting with your domain
3. ✅ SMTP settings from your hosting provider

---

## 🔧 Step-by-Step Setup

### Step 1: Create Email Account

Create an email account on your domain:
- `noreply@yourdomain.com`
- OR `support@yourdomain.com`
- OR any email you prefer

### Step 2: Get SMTP Settings

Contact your hosting provider or check their documentation for:

- **SMTP Host:** (e.g., `mail.yourdomain.com` or `smtp.hostinger.com`)
- **SMTP Port:** Usually `465` (SSL) or `587` (TLS)
- **Username:** Your email address
- **Password:** Your email password

#### Common Hosting Providers:

**Hostinger:**
```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
```

**GoDaddy:**
```
SMTP_HOST=smtpout.secureserver.net
SMTP_PORT=465
```

**Namecheap:**
```
SMTP_HOST=mail.privateemail.com
SMTP_PORT=465
```

**cPanel/Generic:**
```
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=465
```

### Step 3: Update `.env` File

Open `backend/.env` and add:

```env
# Custom Domain Email Settings
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your-email-password
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=465
FRONTEND_URL=http://localhost:5173
```

**Example for Hostinger:**
```env
EMAIL_USER=noreply@anehep.com
EMAIL_PASSWORD=YourStrongPassword123
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
FRONTEND_URL=http://localhost:5173
```

### Step 4: Update Email Service

Replace the current email service with the custom domain version:

**Option A: Replace the file**
```bash
# Backup current file
mv backend/services/emailService.js backend/services/emailService-gmail-backup.js

# Use custom domain version
mv backend/services/emailService-custom-domain.js backend/services/emailService.js
```

**Option B: Edit manually**

Open `backend/services/emailService.js` and change the transporter:

```javascript
// Replace this section:
this.transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// With this:
this.transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});
```

### Step 5: Test Configuration

```bash
# Check configuration
node backend/check-email-config.js

# Test sending email
node backend/test-email.js
```

### Step 6: Restart Server

```bash
# Stop current server (Ctrl + C)
# Then restart
npm run dev:all
```

---

## ✅ What Users Will See

Emails will now come from:
```
From: SIVA ASTRO <noreply@yourdomain.com>
```

Instead of:
```
From: SIVA ASTRO <yourname@gmail.com>
```

---

## 🐛 Troubleshooting

### Error: "Connection refused" or "ECONNREFUSED"
- Check SMTP_HOST is correct
- Verify SMTP_PORT (try 587 if 465 doesn't work)
- Check your email password is correct

### Error: "Invalid credentials"
- Verify email address and password
- Some hosts require using full email as username

### Error: "Self-signed certificate"
- Add to transporter config:
  ```javascript
  tls: {
      rejectUnauthorized: false
  }
  ```

### Still can't send?
Contact your hosting support and ask:
1. "What are the SMTP settings for my email?"
2. "Can I send emails via SMTP?"
3. "Are there any restrictions?"

---

## 📊 Comparison

| Setting | Gmail | Your Domain |
|---------|-------|-------------|
| Sender | `name@gmail.com` | `noreply@yourdomain.com` |
| Professional | ⚠️ Less | ✅ Yes |
| Cost | Free | Included with hosting |
| Setup | Easy | Medium |
| Limits | 500/day | Varies by host |

---

## 🎯 Quick Reference

**Your .env should have:**
```env
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your-email-password
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=465
FRONTEND_URL=http://localhost:5173
```

**Update emailService.js:**
- Change from `service: 'gmail'`
- To `host: process.env.SMTP_HOST`

**Test:**
```bash
node backend/test-email.js
```

---

**Need help with your specific hosting provider? Let me know which one you use!**
