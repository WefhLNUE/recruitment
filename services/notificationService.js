const Notification = require('../models/Notification');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Email functionality integrated
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      console.warn('SMTP not configured. Email notifications will be disabled.');
    }
  }

  async sendEmail(to, subject, html, text) {
    if (!this.transporter) {
      console.log(`Email would be sent to ${to}: ${subject}`);
      return false;
    }
    try {
      const info = await this.transporter.sendMail({
        from: `"HR Platform" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text: text || html.replace(/<[^>]*>/g, ''),
        html
      });
      console.log(`Email sent to ${to}: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendNotificationEmail(to, notification) {
    const html = `<!DOCTYPE html><html><head><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; } .container { max-width: 600px; margin: 0 auto; padding: 20px; } .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; } .content { padding: 20px; background-color: #f9f9f9; } .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; } .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }</style></head><body><div class="container"><div class="header"><h1>${notification.title}</h1></div><div class="content"><p>${notification.message}</p>${notification.actionUrl ? `<a href="${notification.actionUrl}" class="button">View Details</a>` : ''}</div><div class="footer"><p>This is an automated notification from HR Platform</p></div></div></body></html>`;
    return await this.sendEmail(to, notification.title, html);
  }

  async sendOnboardingWelcomeEmail(to, employeeName, startDate) {
    const html = `<!DOCTYPE html><html><head><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; } .container { max-width: 600px; margin: 0 auto; padding: 20px; } .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; } .content { padding: 20px; background-color: #f9f9f9; }</style></head><body><div class="container"><div class="header"><h1>Welcome to the Team!</h1></div><div class="content"><p>Dear ${employeeName},</p><p>Welcome! We're excited to have you join us. Your start date is ${new Date(startDate).toLocaleDateString()}.</p><p>Please complete your onboarding tasks in the portal to ensure a smooth first day.</p><p>Best regards,<br>HR Team</p></div></div></body></html>`;
    return await this.sendEmail(to, 'Welcome to the Team!', html);
  }
}

const emailService = new EmailService();

// Notification Service
class NotificationService {
  async createNotification(data) {
    const notification = new Notification(data);
    await notification.save();
    if (data.sendEmail !== false) {
      try {
        const user = await User.findById(data.userId);
        if (user && user.email) {
          await emailService.sendNotificationEmail(user.email, {
            title: data.title,
            message: data.message,
            type: data.type,
            actionUrl: data.actionUrl
          });
          notification.emailSent = true;
          notification.emailSentDate = new Date();
          await notification.save();
        }
      } catch (error) {
        console.error('Error sending email notification:', error);
      }
    }
    return notification;
  }

  async getNotifications(userId, filters = {}) {
    const query = { userId };
    if (filters.isRead !== undefined) query.isRead = filters.isRead;
    if (filters.type) query.type = filters.type;
    return await Notification.find(query).sort({ createdAt: -1 }).limit(filters.limit || 50);
  }

  async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readDate: new Date() },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readDate: new Date() }
    );
  }

  async getUnreadCount(userId) {
    return await Notification.countDocuments({ userId, isRead: false });
  }

  async sendTaskReminder(userId, onboardingId, taskName, dueDate) {
    return await this.createNotification({
      userId, onboardingId, type: 'TASK_REMINDER', title: 'Task Reminder',
      message: `Reminder: ${taskName} is due on ${new Date(dueDate).toLocaleDateString()}`,
      priority: 'MEDIUM', actionUrl: `/onboarding/${onboardingId}`
    });
  }

  async sendTaskAssignedNotification(userId, onboardingId, taskName) {
    return await this.createNotification({
      userId, onboardingId, type: 'TASK_ASSIGNED', title: 'New Task Assigned',
      message: `You have been assigned a new task: ${taskName}`,
      priority: 'MEDIUM', actionUrl: `/onboarding/${onboardingId}`
    });
  }

  async sendDocumentUploadedNotification(userId, onboardingId, documentName) {
    return await this.createNotification({
      userId, onboardingId, type: 'DOCUMENT_UPLOADED', title: 'Document Uploaded',
      message: `Document "${documentName}" has been uploaded and is pending review`,
      priority: 'LOW', actionUrl: `/onboarding/${onboardingId}/documents`
    });
  }

  async sendOnboardingCompleteNotification(userId, onboardingId) {
    return await this.createNotification({
      userId, onboardingId, type: 'ONBOARDING_COMPLETE', title: 'Onboarding Complete',
      message: 'Congratulations! Your onboarding process has been completed.',
      priority: 'HIGH', actionUrl: `/onboarding/${onboardingId}`
    });
  }
}

module.exports = new NotificationService();
