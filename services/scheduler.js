const cron = require('node-cron');
const SystemAccess = require('../models/SystemAccess');
const Onboarding = require('../models/Onboarding');
const PayrollInitiation = require('../models/PayrollInitiation');
const notificationService = require('./notificationService');
const Employee = require('../models/Employee');

class SchedulerService {
  start() {
    console.log('🕐 Starting scheduled jobs...');

    // Run every day at 9:00 AM - Check for system access activation
    cron.schedule('0 9 * * *', async () => {
      await this.activateSystemAccess();
    });

    // Run every day at 9:00 AM - Check for task reminders
    cron.schedule('0 9 * * *', async () => {
      await this.sendTaskReminders();
    });

    // Run every hour - Check for payroll initiation
    cron.schedule('0 * * * *', async () => {
      await this.initiatePayroll();
    });

    // Run every day at 10:00 AM - Check for signing bonus processing
    cron.schedule('0 10 * * *', async () => {
      await this.processSigningBonuses();
    });

    console.log('✅ Scheduled jobs started');
  }

  async activateSystemAccess() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const pendingAccess = await SystemAccess.find({
        status: 'PENDING',
        activationDate: { $lte: today }
      }).populate('employeeId');

      for (const access of pendingAccess) {
        // Simulate system access provisioning
        access.status = 'PROVISIONED';
        access.provisionedDate = new Date();
        await access.save();

        // Notify system admin or HR
        console.log(`✅ System access provisioned for employee: ${access.employeeId?.employeeId}`);
      }
    } catch (error) {
      console.error('Error in activateSystemAccess:', error);
    }
  }

  async sendTaskReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      const onboardings = await Onboarding.find({
        overallStatus: { $in: ['NOT_STARTED', 'IN_PROGRESS'] }
      }).populate('employeeId');

      for (const onboarding of onboardings) {
        for (const task of onboarding.tasks) {
          if (task.status !== 'COMPLETED' && task.dueDate) {
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            if (dueDate.getTime() === tomorrow.getTime()) {
              // Task is due tomorrow - send reminder
              if (task.assignedTo === 'NEW_HIRE' && onboarding.employeeId?.userId) {
                await notificationService.sendTaskReminder(
                  onboarding.employeeId.userId,
                  onboarding._id,
                  task.name,
                  task.dueDate
                );
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in sendTaskReminders:', error);
    }
  }

  async initiatePayroll() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const pendingPayrolls = await PayrollInitiation.find({
        payrollStatus: 'PENDING',
        payrollEffectiveDate: { $lte: today }
      }).populate('employeeId');

      for (const payroll of pendingPayrolls) {
        try {
          // Simulate payroll initiation
          payroll.payrollStatus = 'INITIATED';
          payroll.payrollInitiatedDate = new Date();
          await payroll.save();

          console.log(`✅ Payroll initiated for employee: ${payroll.employeeId?.employeeId}`);
        } catch (error) {
          payroll.payrollStatus = 'ERROR';
          payroll.errorMessage = error.message;
          await payroll.save();
        }
      }
    } catch (error) {
      console.error('Error in initiatePayroll:', error);
    }
  }

  async processSigningBonuses() {
    try {
      const pendingBonuses = await PayrollInitiation.find({
        signingBonus: { $gt: 0 },
        signingBonusStatus: 'PENDING'
      }).populate('contractId');

      for (const payroll of pendingBonuses) {
        if (payroll.contractId?.status === 'SIGNED') {
          // Process signing bonus
          payroll.signingBonusStatus = 'PROCESSED';
          payroll.signingBonusProcessedDate = new Date();
          await payroll.save();

          console.log(`✅ Signing bonus processed for employee: ${payroll.employeeId}`);
        }
      }
    } catch (error) {
      console.error('Error in processSigningBonuses:', error);
    }
  }
}

module.exports = new SchedulerService();
