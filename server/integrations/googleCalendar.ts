import { google, calendar_v3 } from 'googleapis';
import { Habit, HabitRecord } from '@shared/schema';

// Google Calendar integration
export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
}

export class GoogleCalendarIntegration {
  private calendar: calendar_v3.Calendar;
  private config: GoogleCalendarConfig;

  constructor(config: GoogleCalendarConfig) {
    this.config = config;
    
    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    if (config.refreshToken) {
      oauth2Client.setCredentials({
        refresh_token: config.refreshToken
      });
    }

    this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  }

  // Generate OAuth URL for user authorization
  getAuthUrl(): string {
    const oauth2Client = new google.auth.OAuth2(
      this.config.clientId,
      this.config.clientSecret,
      this.config.redirectUri
    );

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Exchange authorization code for tokens
  async getTokensFromCode(code: string): Promise<{ access_token: string, refresh_token: string }> {
    const oauth2Client = new google.auth.OAuth2(
      this.config.clientId,
      this.config.clientSecret,
      this.config.redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Failed to retrieve tokens');
    }

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token
    };
  }

  // Set refresh token
  setRefreshToken(refreshToken: string): void {
    this.config.refreshToken = refreshToken;
    const oauth2Client = new google.auth.OAuth2(
      this.config.clientId,
      this.config.clientSecret,
      this.config.redirectUri
    );
    
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  }

  // Sync habits to Google Calendar
  async syncHabitsToCalendar(habits: Habit[], habitRecords: HabitRecord[]): Promise<void> {
    // Check if we have a refresh token
    if (!this.config.refreshToken) {
      throw new Error('Refresh token not set. User must authorize the application first.');
    }

    // Create a calendar for habit tracking if it doesn't exist
    const calendarId = await this.getOrCreateHabitCalendar();
    
    // Get existing events for the calendar
    const existingEvents = await this.listCalendarEvents(calendarId);
    
    // Create events for each habit
    for (const habit of habits) {
      // Find records for this habit
      const records = habitRecords.filter(record => record.habitId === habit.id);
      
      for (const record of records) {
        // Skip if not completed
        if (!record.completed) continue;
        
        const eventDate = new Date(record.date);
        const eventTitle = `✓ ${habit.name}`;
        
        // Check if this event already exists
        const eventExists = existingEvents.some(event => {
          return event.summary === eventTitle && 
                 new Date(event.start?.dateTime || event.start?.date || '').toDateString() === eventDate.toDateString();
        });
        
        // Skip if event already exists
        if (eventExists) continue;
        
        // Create an event for the completed habit
        await this.createCalendarEvent(calendarId, {
          summary: eventTitle,
          description: habit.description || '',
          start: {
            date: eventDate.toISOString().split('T')[0], // YYYY-MM-DD format
          },
          end: {
            date: eventDate.toISOString().split('T')[0], // YYYY-MM-DD format
          },
          colorId: this.getColorIdForHabit(habit.colorTag),
        });
      }
    }
  }

  // Get or create a calendar for habit tracking
  private async getOrCreateHabitCalendar(): Promise<string> {
    try {
      // List user calendars
      const response = await this.calendar.calendarList.list();
      const calendars = response.data.items || [];
      
      // Look for the habit calendar
      const habitCalendar = calendars.find(calendar => calendar.summary === 'Habit Tracker');
      
      if (habitCalendar && habitCalendar.id) {
        return habitCalendar.id;
      }
      
      // If not found, create a new calendar
      const newCalendar = await this.calendar.calendars.insert({
        requestBody: {
          summary: 'Habit Tracker',
          description: 'Calendar for tracking habits',
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
      
      return newCalendar.data.id || '';
      
    } catch (error) {
      console.error('Error getting or creating habit calendar:', error);
      throw error;
    }
  }

  // List events from a calendar
  private async listCalendarEvents(calendarId: string): Promise<calendar_v3.Schema$Event[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(), // Last 30 days
        timeMax: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(), // Next 30 days
        singleEvents: true,
        orderBy: 'startTime',
      });
      
      return response.data.items || [];
    } catch (error) {
      console.error('Error listing calendar events:', error);
      throw error;
    }
  }

  // Create a calendar event
  private async createCalendarEvent(calendarId: string, event: calendar_v3.Schema$Event): Promise<void> {
    try {
      await this.calendar.events.insert({
        calendarId,
        requestBody: event,
      });
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  // Map habit color tag to Google Calendar color ID
  private getColorIdForHabit(colorTag: string): string {
    // Google Calendar color IDs:
    // 1: Lavender, 2: Sage, 3: Grape, 4: Flamingo, 5: Banana, 6: Tangerine, 
    // 7: Peacock, 8: Graphite, 9: Blueberry, 10: Basil, 11: Tomato
    switch (colorTag) {
      case 'primary': return '9'; // Blueberry
      case 'secondary': return '10'; // Basil
      case 'accent': return '6'; // Tangerine
      case 'danger': return '11'; // Tomato
      case 'purple': return '3'; // Grape
      case 'pink': return '4'; // Flamingo
      default: return '1'; // Lavender
    }
  }
}

// Create a singleton instance that will be initialized with env vars
let googleCalendarInstance: GoogleCalendarIntegration | null = null;

export function getGoogleCalendarIntegration(): GoogleCalendarIntegration {
  if (!googleCalendarInstance) {
    // Get config from environment variables
    const config: GoogleCalendarConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback',
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN
    };

    googleCalendarInstance = new GoogleCalendarIntegration(config);
  }

  return googleCalendarInstance;
}