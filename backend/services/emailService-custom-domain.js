const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

/**
 * Email Service for Custom Domain
 * Use this for sending emails from your own domain
 */

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    /**
     * Initialize email transporter with CUSTOM DOMAIN SMTP
     */
    initializeTransporter() {
        // OPTION 1: Use your domain's SMTP server
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,        // Your SMTP server (e.g., mail.yourdomain.com)
            port: process.env.SMTP_PORT || 465, // Usually 465 (SSL) or 587 (TLS)
            secure: true,                        // true for port 465, false for 587
            auth: {
                user: process.env.EMAIL_USER,    // Your domain email (e.g., noreply@yourdomain.com)
                pass: process.env.EMAIL_PASSWORD // Your email password
            },
            tls: {
                // For self-signed certificates or if you have SSL issues
                rejectUnauthorized: false
            }
        });

        // OPTION 2: If your hosting uses specific settings, uncomment and modify:
        // this.transporter = nodemailer.createTransport({
        //     host: 'smtp.hostinger.com',      // Example: Hostinger
        //     port: 465,
        //     secure: true,
        //     auth: {
        //         user: process.env.EMAIL_USER,
        //         pass: process.env.EMAIL_PASSWORD
        //     }
        // });
    }

    /**
     * Load HTML email template and replace placeholders
     */
    async loadTemplate(templateName, replacements = {}) {
        try {
            const templatePath = path.join(__dirname, '../../', templateName);
            let htmlContent = await fs.readFile(templatePath, 'utf-8');

            Object.keys(replacements).forEach(key => {
                const placeholder = `{{${key}}}`;
                const value = replacements[key];
                htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
            });

            return htmlContent;
        } catch (error) {
            console.error('Error loading email template:', error);
            throw new Error('Failed to load email template');
        }
    }

    /**
     * Send verification email with custom HTML template
     */
    async sendVerificationEmail(toEmail, verificationLink, customData = {}) {
        try {
            const htmlContent = await this.loadTemplate('email_template.html', {
                action_url: verificationLink,
                user_email: toEmail,
                ...customData
            });

            const mailOptions = {
                from: {
                    name: 'SIVA ASTRO',
                    address: process.env.EMAIL_USER  // Will be noreply@yourdomain.com
                },
                to: toEmail,
                subject: 'Verify Your Email - SIVA ASTRO',
                html: htmlContent
            };

            const info = await this.transporter.sendMail(mailOptions);

            console.log(`✅ Verification email sent to: ${toEmail}`);
            console.log(`📧 Message ID: ${info.messageId}`);

            return {
                success: true,
                messageId: info.messageId,
                recipient: toEmail
            };

        } catch (error) {
            console.error('❌ Error sending verification email:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    /**
     * Send any custom email
     */
    async sendCustomEmail(to, subject, htmlContent) {
        try {
            const mailOptions = {
                from: {
                    name: 'SIVA ASTRO',
                    address: process.env.EMAIL_USER
                },
                to,
                subject,
                html: htmlContent
            };

            const info = await this.transporter.sendMail(mailOptions);

            return {
                success: true,
                messageId: info.messageId,
                recipient: to
            };

        } catch (error) {
            console.error('Error sending custom email:', error);
            throw error;
        }
    }

    /**
     * Verify transporter configuration
     */
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Email service is ready to send emails');
            console.log(`📧 Using: ${process.env.EMAIL_USER}`);
            console.log(`🌐 SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
            return true;
        } catch (error) {
            console.error('❌ Email service verification failed:', error.message);
            return false;
        }
    }
}

module.exports = new EmailService();
