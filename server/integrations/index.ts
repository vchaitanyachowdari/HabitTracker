import { getGoogleCalendarIntegration } from './googleCalendar';
import { getNotionIntegration } from './notionCalendar';
import { Habit, HabitRecord } from '@shared/schema';

// This class provides a unified interface for syncing habits to external services
export class CalendarIntegrations {
  // Sync habits to Google Calendar
  async syncToGoogleCalendar(habits: Habit[], habitRecords: HabitRecord[]): Promise<boolean> {
    try {
      const googleCalendar = getGoogleCalendarIntegration();
      
      // Check if we have the required credentials
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
        console.log('Google Calendar credentials not found');
        return false;
      }
      
      await googleCalendar.syncHabitsToCalendar(habits, habitRecords);
      return true;
    } catch (error) {
      console.error('Error syncing to Google Calendar:', error);
      return false;
    }
  }
  
  // Sync habits to Notion
  async syncToNotion(habits: Habit[], habitRecords: HabitRecord[]): Promise<boolean> {
    try {
      const notion = getNotionIntegration();
      
      // Check if we have the required credentials
      if (!process.env.NOTION_API_KEY) {
        console.log('Notion API key not found');
        return false;
      }
      
      await notion.syncHabitsToNotion(habits, habitRecords);
      return true;
    } catch (error) {
      console.error('Error syncing to Notion:', error);
      return false;
    }
  }
  
  // Sync habits to all connected services
  async syncToAllServices(habits: Habit[], habitRecords: HabitRecord[]): Promise<{
    google: boolean;
    notion: boolean;
  }> {
    const results = {
      google: false,
      notion: false
    };
    
    // Sync to Google Calendar
    results.google = await this.syncToGoogleCalendar(habits, habitRecords);
    
    // Sync to Notion
    results.notion = await this.syncToNotion(habits, habitRecords);
    
    return results;
  }
  
  // Generate authorization URL for Google Calendar
  getGoogleAuthUrl(): string | null {
    try {
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return null;
      }
      
      return getGoogleCalendarIntegration().getAuthUrl();
    } catch (error) {
      console.error('Error generating Google auth URL:', error);
      return null;
    }
  }
  
  // Handle Google OAuth callback
  async handleGoogleCallback(code: string): Promise<boolean> {
    try {
      const googleCalendar = getGoogleCalendarIntegration();
      const tokens = await googleCalendar.getTokensFromCode(code);
      
      // In a real application, you would save this refresh token to the user's profile
      // For this demo, we're just setting it for the current session
      googleCalendar.setRefreshToken(tokens.refresh_token);
      
      return true;
    } catch (error) {
      console.error('Error handling Google callback:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const calendarIntegrations = new CalendarIntegrations();