# Firebase Custom Email Verification Setup

## 🎯 Overview

This implementation allows you to:
1. **Ask Firebase** for a verification link WITHOUT Firebase sending the email
2. **Use your custom HTML template** (`email_template.html`)
3. **Send the email yourself** using NodeMailer

## 📋 Prerequisites

- Firebase Admin SDK configured ✅ (Already done!)
- NodeMailer installed
- Email service credentials (Gmail App Password or SMTP)

## 🚀 Quick Start

### 1. Install NodeMailer

```bash
cd backend
npm install nodemailer
```

### 2. Configure Email Credentials

Add to your `backend/.env` file:

```env
# Email Service
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
FRONTEND_URL=http://localhost:5173
```

#### How to Get Gmail App Password:

1. Go to [Google Account](https://myaccount.google.com/)
2. Click **Security** → **2-Step Verification** (enable if not already)
3. Scroll down → **App passwords**
4. Create a new app password for "Mail"
5. Copy the 16-character password
6. Paste it as `EMAIL_PASSWORD` in `.env`

### 3. Test the Email Service

```bash
# Start your backend server
npm run dev
```

## 📤 API Endpoints

### Send Verification Email

**POST** `/api/auth/send-verification-email`

```json
{
  "email": "user@example.com",
  "userId": "optional-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent successfully",
  "recipient": "user@example.com",
  "messageId": "abc123@gmail.com"
}
```

### Send Password Reset Email

**POST** `/api/auth/send-password-reset`

```json
{
  "email": "user@example.com"
}
```

### Check Email Verification Status

**GET** `/api/auth/check-verification/:email`

**Response:**
```json
{
  "success": true,
  "email": "user@example.com",
  "emailVerified": true,
  "uid": "firebase-uid"
}
```

## 🧪 How to Test

### Using cURL:

```bash
# Test sending verification email
curl -X POST http://localhost:5000/api/auth/send-verification-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Using Postman or Thunder Client:

1. **Method:** POST
2. **URL:** `http://localhost:5000/api/auth/send-verification-email`
3. **Headers:** `Content-Type: application/json`
4. **Body:**
   ```json
   {
     "email": "your-test-email@gmail.com"
   }
   ```

### Using JavaScript (Frontend):

```javascript
const sendVerificationEmail = async (userEmail) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/send-verification-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail,
        userId: 'optional-user-id'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Verification email sent!');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Usage
sendVerificationEmail('user@example.com');
```

## 🎨 Customizing the Email Template

Your custom template is at: `email_template.html`

**Available Placeholders:**
- `{{action_url}}` - The Firebase verification link (required)
- `{{user_email}}` - User's email address
- `{{user_id}}` - User ID (if provided)

You can add more placeholders by modifying `emailService.js`:

```javascript
const htmlContent = await this.loadTemplate('email_template.html', {
    action_url: verificationLink,
    user_name: 'John Doe',  // Add custom data
    custom_message: 'Welcome!'
});
```

## 🔧 How It Works

```javascript
// 1. Firebase generates the link (NO EMAIL SENT by Firebase)
const verificationLink = await auth.generateEmailVerificationLink(email, settings);

// 2. Your code loads the custom HTML template
const htmlContent = await loadTemplate('email_template.html', {
    action_url: verificationLink
});

// 3. Your code sends the email via NodeMailer
await transporter.sendMail({
    to: email,
    subject: 'Verify Your Email',
    html: htmlContent
});
```

## 📝 Important Notes

1. **Firebase Admin SDK** is used on the backend (not client-side Firebase Auth)
2. **No email is sent by Firebase** - you have full control
3. **Custom HTML template** is used for all verification emails
4. **Works with any email provider** (Gmail, SendGrid, SMTP, etc.)

## 🔐 Security Best Practices

- ✅ Store email credentials in `.env` file
- ✅ Never commit `.env` to version control
- ✅ Use app passwords, not your actual password
- ✅ Validate email addresses before sending
- ✅ Rate limit your email endpoint to prevent abuse

## 🐛 Troubleshooting

### "Invalid credentials" error:
- Make sure you're using a Gmail App Password, not your regular password
- Enable 2-Step Verification first

### "Email not sending":
- Check your `.env` file has correct credentials
- Verify email service connection: `await emailService.verifyConnection()`
- Check spam folder

### "Template not found":
- Ensure `email_template.html` is in the project root
- Check file path in `emailService.js`

## 📚 Alternative Email Services

### SendGrid:

```javascript
// backend/services/emailService.js
this.transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
    }
});
```

### Custom SMTP:

```javascript
this.transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});
```

## ✨ Next Steps

1. Install dependencies: `cd backend && npm install nodemailer`
2. Add email credentials to `.env`
3. Test the endpoint with Postman or cURL
4. Integrate with your frontend signup flow
5. Customize the email template to match your brand

---

**Created by:** Antigravity AI Assistant  
**Date:** 2025-12-24
