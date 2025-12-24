const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

/**
 * Email Service for sending custom HTML emails
 * Uses NodeMailer with Gmail/SMTP
 */

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    /**
     * Initialize email transporter
     * Using Namecheap PrivateEmail
     */
    initializeTransporter() {
        // NAMECHEAP Configuration
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'mail.privateemail.com',
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

        // GMAIL (Switch to this if Namecheap doesn't work):
        // this.transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         user: process.env.EMAIL_USER,
        //         pass: process.env.EMAIL_PASSWORD
        //     }
        // });

        // Alternative SMTP configuration:
        // this.transporter = nodemailer.createTransporter({
        //     host: process.env.SMTP_HOST,
        //     port: process.env.SMTP_PORT,
        //     secure: true,
        //     auth: {
        //         user: process.env.SMTP_USER,
        //         pass: process.env.SMTP_PASSWORD
        //     }
        // });
    }

    /**
     * Load HTML email template and replace placeholders
     * @param {string} templateName - Name of the template file
     * @param {object} replacements - Object with placeholder-value pairs
     * @returns {Promise<string>} - HTML content with replaced values
     */
    async loadTemplate(templateName, replacements = {}) {
        try {
            // Load template from project root
            const templatePath = path.join(__dirname, '../../', templateName);
            let htmlContent = await fs.readFile(templatePath, 'utf-8');

            // Replace all placeholders
            Object.keys(replacements).forEach(key => {
                const placeholder = `{{${key}}}`;
                const value = replacements[key];
                // Use global regex to replace all occurrences
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
     * @param {string} toEmail - Recipient email address
     * @param {string} verificationLink - The Firebase verification link
     * @param {object} customData - Additional data for template (optional)
     * @returns {Promise<object>} - Email send result
     */
    async sendVerificationEmail(toEmail, verificationLink, customData = {}) {
        try {
            // Load and populate the custom template
            const htmlContent = await this.loadTemplate('email_template.html', {
                action_url: verificationLink,
                user_email: toEmail,
                ...customData
            });

            // Email options
            const mailOptions = {
                from: {
                    name: 'Astrozen',
                    address: process.env.EMAIL_USER
                },
                to: toEmail,
                subject: 'Verify Your Email - Astrozen',
                html: htmlContent
            };

            // Send email
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
     * Send password reset email with custom HTML template
     * @param {string} toEmail - Recipient email address
     * @param {string} resetLink - The Firebase password reset link
     * @param {object} customData - Additional data for template (optional)
     * @returns {Promise<object>} - Email send result
     */
    async sendPasswordResetEmail(toEmail, resetLink, customData = {}) {
        try {
            // Load and populate the password reset template
            const htmlContent = await this.loadTemplate('password_reset_template.html', {
                action_url: resetLink,
                user_email: toEmail,
                ...customData
            });

            // Email options
            const mailOptions = {
                from: {
                    name: 'Astrozen',
                    address: process.env.EMAIL_USER
                },
                to: toEmail,
                subject: '🔐 Reset Your Password - Astrozen',
                html: htmlContent
            };

            // Send email
            const info = await this.transporter.sendMail(mailOptions);

            console.log(`✅ Password reset email sent to: ${toEmail}`);
            console.log(`📧 Message ID: ${info.messageId}`);

            return {
                success: true,
                messageId: info.messageId,
                recipient: toEmail
            };

        } catch (error) {
            console.error('❌ Error sending password reset email:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    /**
     * Send any custom email
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject
     * @param {string} htmlContent - HTML content
     * @returns {Promise<object>} - Email send result
     */
    async sendCustomEmail(to, subject, htmlContent) {
        try {
            const mailOptions = {
                from: {
                    name: 'Astrozen',
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
     * @returns {Promise<boolean>}
     */
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Email service is ready to send emails');
            return true;
        } catch (error) {
            console.error('❌ Email service verification failed:', error);
            return false;
        }
    }
}

// Export singleton instance
module.exports = new EmailService();
