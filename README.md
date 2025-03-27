# HabitTrack Pro - Comprehensive Habit Tracking Application

![Screenshot 2025-03-27 at 7 09 05 PM](https://github.com/user-attachments/assets/acfebc0b-bbbf-4041-96fb-01dc5aeb953b)


HabitTrack Pro is a powerful habit tracking application designed to help users build, monitor, and maintain consistent routines through intuitive visual analytics and modern user interface design. The application combines habit tracking with college class attendance management and meeting scheduling in one seamless platform.

## Table of Contents
- [Features](#features)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies](#technologies)
- [API Integrations](#api-integrations)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Features

### User Authentication & Account Management
- User registration with secure password hashing
- User login with JWT token authentication
- User profile management
- Protected routes requiring authentication

### Habit Tracking System
- Create, view, update, and delete habits
- Custom habit categories with color coding
- Habit tagging for better organization
- Daily, weekly, and monthly habit frequency options
- Habit completion tracking with statistics
- Habit streak monitoring
- Habit record management with notes

### College Class Management
- Add and manage college classes
- Schedule classes with recurring day/time settings
- Track class attendance (attended/skipped)
- View attendance statistics and reports
- Associate classes with habits or meetings

### Meeting Integration
- Schedule virtual meetings (Zoom, Google Meet, etc.)
- Meeting templates for quick scheduling
- Create meetings from templates
- Meeting participant management
- Meeting categorization by type and platform
- Meeting status tracking (scheduled, completed, canceled)
- Associate meetings with habits or college classes

### Calendar Integration
- Google Calendar synchronization for habits and meetings
- Notion Calendar integration
- Two-way calendar sync capabilities
- OAuth authentication flow

### Notification System
- WhatsApp notifications via Twilio integration
- Email notifications
- Configurable notification preferences
- Notification settings by feature (habits, classes, meetings)
- Configurable reminder times

### Visualization & Statistics
- Habit completion tracking visualizations
- Class attendance statistics
- Meeting trends and analytics
- Data visualization components for performance tracking
- Calendar view of all scheduled activities

## Screenshots

### Dashboard
The main dashboard provides an overview of your habits, upcoming classes, and scheduled meetings.

![Screenshot 2025-03-27 at 7 01 17 PM](https://github.com/user-attachments/assets/bf38948d-85ba-4af3-b040-1133b17715d2)


### Habit Tracking
Create and manage your habits with custom categories and tags.

![Screenshot 2025-03-27 at 7 01 32 PM](https://github.com/user-attachments/assets/86d1d003-d158-42c2-8a3d-fbdd9b106279)


### College Class Management
Track your class attendance and view statistics.

![Screenshot 2025-03-27 at 7 02 18 PM](https://github.com/user-attachments/assets/a79a4298-7616-49c0-9ce0-4af91a9594c9)


### Meeting Scheduling
Schedule and manage virtual meetings with integration to popular platforms.

![Meetings](./screenshots/meetings.png)

### Calendar Integration
Synchronize your habits, classes, and meetings with your Google or Notion calendar.

![Screenshot 2025-03-27 at 7 01 46 PM](https://github.com/user-attachments/assets/d7967d27-2f07-4e8f-a8de-49165f8d4c3c)


### Statistics and Visualization
View comprehensive statistics and visualizations of your habits and progress.

![Screenshot 2025-03-27 at 7 02 02 PM](https://github.com/user-attachments/assets/1085336f-5851-46a9-a5bf-9d7042b1d666)


### Settings
Configure your notification preferences, API integrations, and account settings.

![Screenshot 2025-03-27 at 7 03 14 PM](https://github.com/user-attachments/assets/48657e98-d0e3-4b4e-af98-4272b6041612)


## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/habittrack-pro.git
cd habittrack-pro
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add the following variables:
```
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=your_google_redirect_uri
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5000`.

## Usage

### User Registration and Login
1. Navigate to the login page by clicking the "Login" button in the top navigation.
2. Click "Register" to create a new account or enter your credentials to log in.
3. Once logged in, you'll be redirected to the dashboard.

### Adding and Tracking Habits
1. Go to the "Habits" page from the sidebar.
2. Click "Add New Habit" to create a new habit.
3. Fill in the habit details, including name, description, frequency, category, and tags.
4. Track your habits by marking them as complete each day.
5. View your progress and streaks in the habit details view.

### Managing College Classes
1. Go to the "College" page from the sidebar.
2. Click "Add New Class" to create a new class.
3. Fill in the class details, including name, instructor, location, and schedule.
4. Mark your attendance for each class session.
5. View your attendance statistics in the class details view.

### Scheduling Meetings
1. Go to the "Meetings" page from the sidebar.
2. Click "Schedule Meeting" to create a new meeting.
3. Fill in the meeting details, including title, description, platform, and participants.
4. Optionally, create a meeting template for recurring meetings.
5. Join meetings directly from the application using the provided meeting link.

### Integrating with Google Calendar
1. Go to the "Calendar" page from the sidebar.
2. Click "Connect to Google Calendar" and follow the authentication flow.
3. Once connected, your habits, classes, and meetings will be synchronized with your Google Calendar.

### Configuring Notification Settings
1. Go to the "Settings" page from the sidebar.
2. Navigate to the "Notifications" tab.
3. Configure your notification preferences for habits, classes, and meetings.
4. Connect your WhatsApp number for WhatsApp notifications via Twilio.

## Technologies

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Query
- Recharts for data visualization
- React Hook Form

### Backend
- Node.js
- Express.js
- JSON Web Tokens (JWT) for authentication
- In-memory storage with persistence options

### API Integrations
- Google Calendar API
- Notion Calendar API
- Twilio API for WhatsApp notifications
- Zoom and Google Meet for virtual meetings

## API Integrations

### Google Calendar
The application integrates with Google Calendar to synchronize habits, classes, and meetings. To enable this integration:

1. Create a project in the Google Cloud Console.
2. Enable the Google Calendar API.
3. Create OAuth 2.0 credentials.
4. Configure the redirect URI to match your application's callback URL.
5. Add the client ID and client secret to your environment variables.

### Notion Calendar
The application integrates with Notion Calendar to synchronize habits, classes, and meetings. To enable this integration:

1. Create an integration in the Notion Integrations dashboard.
2. Grant the integration access to the pages you want to synchronize.
3. Add the Notion API key to your environment variables.

### Twilio for WhatsApp Notifications
The application uses Twilio to send WhatsApp notifications for habit reminders, class alerts, and meeting notifications. To enable this integration:

1. Create a Twilio account.
2. Set up a WhatsApp Sandbox.
3. Add your Twilio account SID, auth token, and WhatsApp-enabled phone number to your environment variables.

## Configuration

### Environment Variables
- `JWT_SECRET`: Secret key for JWT token generation and validation.
- `GOOGLE_CLIENT_ID`: Google Cloud client ID for OAuth authentication.
- `GOOGLE_CLIENT_SECRET`: Google Cloud client secret for OAuth authentication.
- `GOOGLE_REDIRECT_URI`: Redirect URI for Google OAuth flow.
- `TWILIO_ACCOUNT_SID`: Twilio account SID for WhatsApp notifications.
- `TWILIO_AUTH_TOKEN`: Twilio auth token for WhatsApp notifications.
- `TWILIO_PHONE_NUMBER`: Twilio WhatsApp-enabled phone number.

### Application Settings
The application settings can be configured in the "Settings" page, including:
- Theme preferences (light/dark mode)
- Notification preferences
- Calendar integration settings
- WhatsApp notification settings

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.
