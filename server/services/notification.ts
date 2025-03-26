import { Twilio } from 'twilio';
import { log } from '../vite';
import { CollegeClass } from '@shared/schema';

export interface NotificationSettings {
  enabled: boolean;
  phoneNumber?: string;
  notifyBeforeClass?: boolean;
  notifyMissedClass?: boolean;
  reminderTime?: number; // minutes before class to send reminder
}

export class NotificationService {
  private client: Twilio | null = null;
  private twilioPhoneNumber: string | null = null;
  private isEnabled: boolean = false;

  constructor() {
    // Initialize Twilio client if environment variables are available
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || null;
    
    if (accountSid && authToken && this.twilioPhoneNumber) {
      try {
        this.client = new Twilio(accountSid, authToken);
        this.isEnabled = true;
        log('Twilio notification service initialized');
      } catch (error) {
        log(`Error initializing Twilio client: ${error}`);
        this.isEnabled = false;
      }
    } else {
      log('Twilio credentials not found, notification service is disabled');
      this.isEnabled = false;
    }
  }

  /**
   * Check if the notification service is enabled
   */
  isServiceEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Send a WhatsApp message
   * @param to Recipient's phone number with country code (e.g., +1234567890)
   * @param message Message to send
   * @returns Promise resolving to success status
   */
  async sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
    if (!this.isEnabled || !this.client || !this.twilioPhoneNumber) {
      log('Cannot send WhatsApp message: notification service is disabled');
      return false;
    }

    try {
      // Format the "to" WhatsApp number as required by Twilio
      const formattedTo = `whatsapp:${to}`;
      const formattedFrom = `whatsapp:${this.twilioPhoneNumber}`;
      
      await this.client.messages.create({
        body: message,
        from: formattedFrom,
        to: formattedTo
      });
      
      log(`WhatsApp message sent to ${to}`);
      return true;
    } catch (error) {
      log(`Error sending WhatsApp message: ${error}`);
      return false;
    }
  }

  /**
   * Send a class reminder notification
   * @param userPhone User's WhatsApp phone number
   * @param collegeClass Class details
   * @returns Promise resolving to success status
   */
  async sendClassReminder(userPhone: string, collegeClass: CollegeClass): Promise<boolean> {
    const message = `📚 Reminder: Your class "${collegeClass.name}" (${collegeClass.courseCode}) starts soon!\n\n` +
      `🕒 Time: ${collegeClass.startTime} - ${collegeClass.endTime}\n` +
      `📍 Location: ${collegeClass.location || 'Not specified'}\n` +
      `👨‍🏫 Instructor: ${collegeClass.instructor || 'Not specified'}\n\n` +
      `Don't forget to mark your attendance in the app!`;
    
    return this.sendWhatsAppMessage(userPhone, message);
  }

  /**
   * Send a missed class notification
   * @param userPhone User's WhatsApp phone number
   * @param collegeClass Class details
   * @returns Promise resolving to success status
   */
  async sendMissedClassAlert(userPhone: string, collegeClass: CollegeClass): Promise<boolean> {
    const message = `❗ Missed Class Alert: You missed "${collegeClass.name}" (${collegeClass.courseCode}) today.\n\n` +
      `🕒 Time: ${collegeClass.startTime} - ${collegeClass.endTime}\n` +
      `📍 Location: ${collegeClass.location || 'Not specified'}\n` +
      `👨‍🏫 Instructor: ${collegeClass.instructor || 'Not specified'}\n\n` +
      `If this is incorrect, please update your attendance in the app.`;
    
    return this.sendWhatsAppMessage(userPhone, message);
  }
}

// Create and export a singleton instance
export const notificationService = new NotificationService();