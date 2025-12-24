# ✅ Custom Domain Email - Quick Summary

## 🎯 You Asked: Can I use my domain for verification emails?

**YES!** Absolutely! You can send from `noreply@yourdomain.com`

---

## 📧 Two Options Available:

### **Option 1: Gmail** (Easier, Free)
```env
EMAIL_USER=yourname@gmail.com
EMAIL_PASSWORD=gmail-app-password
```

Users see: `From: SIVA ASTRO <yourname@gmail.com>`

✅ Free  
✅ Easy setup  
✅ Works immediately  
⚠️ Shows Gmail address

---

### **Option 2: Your Domain** (Professional) ⭐ **RECOMMENDED**
```env
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your-email-password
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=465
```

Users see: `From: SIVA ASTRO <noreply@yourdomain.com>`

✅ Professional  
✅ Your own domain  
✅ Builds trust  
⚠️ Requires SMTP setup

---

## 🚀 To Use Your Domain:

### 1. Update `backend/.env`:
```env
# Replace Gmail settings with:
EMAIL_USER=noreply@anehep.com
EMAIL_PASSWORD=your-email-password
SMTP_HOST=mail.anehep.com
SMTP_PORT=465
FRONTEND_URL=http://localhost:5173
```

### 2. Update `backend/services/emailService.js`:

Change line 13-18 from:
```javascript
this.transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
```

To:
```javascript
this.transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
```

### 3. Test it:
```bash
node backend/test-email.js
```

---

## 📖 Full Guide:
See `SETUP_CUSTOM_DOMAIN_EMAIL.md` for complete instructions!

---

## ❓ Need Your Hosting SMTP Settings?

Tell me your hosting provider:
- Hostinger?
- GoDaddy?
- Namecheap?
- Other?

I'll give you the exact settings! 🎯
