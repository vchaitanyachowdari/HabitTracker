import { Client } from '@notionhq/client';
import { Habit, HabitRecord } from '@shared/schema';

export interface NotionConfig {
  apiKey: string;
  databaseId?: string;
}

export class NotionIntegration {
  private notion: Client;
  private config: NotionConfig;

  constructor(config: NotionConfig) {
    this.config = config;
    this.notion = new Client({ auth: config.apiKey });
  }

  // Create a new database for habit tracking
  async createHabitDatabase(): Promise<string> {
    try {
      // We need a parent page ID to create a database within it
      // This would typically be provided by the user after they connect their account
      // For now, we'll throw an error if not provided
      if (!process.env.NOTION_PARENT_PAGE_ID) {
        throw new Error('NOTION_PARENT_PAGE_ID environment variable is required to create a database');
      }

      const parentPageId = process.env.NOTION_PARENT_PAGE_ID;

      // Create a new database
      const response = await this.notion.databases.create({
        parent: {
          type: 'page_id',
          page_id: parentPageId,
        },
        title: [
          {
            type: 'text',
            text: {
              content: 'Habit Tracker',
            },
          },
        ],
        properties: {
          'Habit Name': {
            title: {},
          },
          'Date': {
            date: {},
          },
          'Completed': {
            checkbox: {},
          },
          'Habit ID': {
            number: {},
          },
          'Description': {
            rich_text: {},
          },
          'Color': {
            select: {
              options: [
                { name: 'primary', color: 'blue' },
                { name: 'secondary', color: 'green' },
                { name: 'accent', color: 'orange' },
                { name: 'danger', color: 'red' },
                { name: 'purple', color: 'purple' },
                { name: 'pink', color: 'pink' },
              ],
            },
          },
        },
      });

      // Store the database ID for future use
      this.config.databaseId = response.id;
      return response.id;
    } catch (error) {
      console.error('Error creating Notion database:', error);
      throw error;
    }
  }

  // Get or create the habit tracking database
  async getOrCreateHabitDatabase(): Promise<string> {
    // If we already have a database ID, return it
    if (this.config.databaseId) {
      return this.config.databaseId;
    }

    // Check if there's a database ID in env vars
    if (process.env.NOTION_DATABASE_ID) {
      this.config.databaseId = process.env.NOTION_DATABASE_ID;
      return this.config.databaseId;
    }

    // If no database ID is found, create a new one
    return await this.createHabitDatabase();
  }

  // Sync habits to Notion
  async syncHabitsToNotion(habits: Habit[], habitRecords: HabitRecord[]): Promise<void> {
    try {
      // Get or create the habit database
      const databaseId = await this.getOrCreateHabitDatabase();

      // Query existing entries in the database to avoid duplicates
      const existingEntries = await this.queryExistingEntries(databaseId);

      // Process each habit record
      for (const record of habitRecords) {
        // Find the corresponding habit
        const habit = habits.find(h => h.id === record.habitId);
        if (!habit) continue;

        const recordDate = new Date(record.date);
        const dateString = recordDate.toISOString().split('T')[0]; // YYYY-MM-DD

        // Check if this record already exists in Notion
        const existingEntry = existingEntries.find(entry => {
          const entryHabitId = entry.properties['Habit ID']?.number;
          const entryDate = entry.properties['Date']?.date?.start;
          return entryHabitId === record.habitId && entryDate === dateString;
        });

        if (existingEntry) {
          // Update existing entry if completion status has changed
          const existingCompleted = existingEntry.properties['Completed']?.checkbox;
          if (existingCompleted !== record.completed) {
            await this.updateNotionPage(existingEntry.id, {
              'Completed': {
                checkbox: record.completed,
              },
            });
          }
        } else {
          // Create a new entry
          await this.createNotionPage(databaseId, {
            'Habit Name': {
              title: [
                {
                  text: {
                    content: habit.name,
                  },
                },
              ],
            },
            'Date': {
              date: {
                start: dateString,
              },
            },
            'Completed': {
              checkbox: record.completed,
            },
            'Habit ID': {
              number: habit.id,
            },
            'Description': {
              rich_text: [
                {
                  text: {
                    content: habit.description || '',
                  },
                },
              ],
            },
            'Color': {
              select: {
                name: habit.colorTag,
              },
            },
          });
        }
      }
    } catch (error) {
      console.error('Error syncing habits to Notion:', error);
      throw error;
    }
  }

  // Query existing entries in the database
  private async queryExistingEntries(databaseId: string): Promise<any[]> {
    try {
      const response = await this.notion.databases.query({
        database_id: databaseId,
      });
      return response.results;
    } catch (error) {
      console.error('Error querying Notion database:', error);
      throw error;
    }
  }

  // Create a new page in the database
  private async createNotionPage(databaseId: string, properties: any): Promise<any> {
    try {
      return await this.notion.pages.create({
        parent: {
          database_id: databaseId,
        },
        properties,
      });
    } catch (error) {
      console.error('Error creating Notion page:', error);
      throw error;
    }
  }

  // Update an existing page
  private async updateNotionPage(pageId: string, properties: any): Promise<any> {
    try {
      return await this.notion.pages.update({
        page_id: pageId,
        properties,
      });
    } catch (error) {
      console.error('Error updating Notion page:', error);
      throw error;
    }
  }
}

// Create a singleton instance that will be initialized with env vars
let notionInstance: NotionIntegration | null = null;

export function getNotionIntegration(): NotionIntegration {
  if (!notionInstance) {
    // Get config from environment variables
    const config: NotionConfig = {
      apiKey: process.env.NOTION_API_KEY || '',
      databaseId: process.env.NOTION_DATABASE_ID,
    };

    notionInstance = new NotionIntegration(config);
  }

  return notionInstance;
}