# Drift — Soft Deadline Manager

A modern task and deadline management application built with React + TypeScript that makes deadline changes visible and transparent. Drift helps you track when deadlines shift, why they shift, and understand patterns in how projects evolve.

## Features

### Core Task Management
- **Create, read, update, and delete tasks** with due dates
- **Deadline tracking**: Original deadline is immutable; current deadline reflects all extensions
- **Deadline extension history** with reasons and timestamps for full transparency
- **Task organization** by status (active, completed, overdue)

### Visual Feedback & Insights
- **Color-coded status** based on extension count (0 extensions = green, 1-2 = yellow, 3+ = red)
- **Timeline view** showing original deadline, each extension point, and completion date
- **Insights page** with analytics:
  - Tasks with most extensions
  - Average extension count
  - Common extension reasons
- **Calendar view** of upcoming deadlines with critical deadline highlighting

### User Experience
- **Multi-page app** with intuitive navigation (Dashboard, Calendar, New Task, Settings, Insights)
- **User authentication** with sign-in/sign-up (localStorage-backed)
- **Persistent storage** using browser localStorage
- **Responsive design** for desktop and mobile devices
- **User settings** (name, accent color, notification preferences)

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: CSS (custom)
- **State Management**: React hooks + localStorage
- **Icons**: Font Awesome
- **Testing**: Built-in utilities for core logic

## Project Structure

```
Drift/
  src/
    App.tsx                 # Main app wrapper and routing
    main.tsx               # Entry point
    auth.ts                # Authentication logic (localStorage)
    models.ts              # TypeScript interfaces for Task, User
    utils.ts               # Core business logic (extensions, dates, stats)
    storage.ts             # localStorage helpers
    styles.css             # Global styles
    components/
      TaskList.tsx         # Display list of tasks
      TaskDetail.tsx       # Individual task view with extensibles
      Insights.tsx         # Analytics and statistics
    pages/
      SignInPage.tsx       # Login page
      SignUpPage.tsx       # Registration page
      DashboardPage.tsx    # Main task dashboard
      CalendarPage.tsx     # Calendar view
      NewTaskPage.tsx      # Create new task
      SettingsPage.tsx     # User settings
```

## Getting Started

### Prerequisites
- Node.js >= 16
- npm or yarn

### Installation & Running

```bash
cd Drift
npm install
npm run dev
```

The app will start at `http://localhost:5173` (or the next available port).

### Build for Production

```bash
npm run build
```

## Design Philosophy

- **Determinism**: All date operations use ISO 8601 strings for consistency across sessions and devices
- **Immutability**: Original deadlines are never overwritten; extensions create read-only history entries
- **Clarity**: The UI surfaces deadline drift explicitly so you understand when and why timelines change
- **Simplicity**: Core business logic is concentrated in `src/utils.ts`; components focus on presentation
- **Transparency**: Every deadline change is logged with timestamp and reason for full auditability

## Key Concepts

### Tasks
Each task has:
- `id`: Unique identifier
- `title`: Task name
- `description`: Optional details
- `originalDeadline`: Never changes (ISO date string)
- `currentDeadline`: Updated when extended
- `extensions`: Array of extension objects `{ length, reason, timestamp }`
- `completed`: Boolean completion status
- `completedAt`: Date of completion (if completed)

### Extension Logic
When a deadline is extended:
1. A new extension record is created with length (days), reason, and timestamp
2. `currentDeadline` is recalculated
3. State is persisted to localStorage
4. Storage updates propagate to all task views (list, detail, calendar)

## Future Enhancements
- Cloud sync (Firebase, Supabase)
- Team collaboration and shared tasks
- Email reminders for critical deadlines
- Export task history to CSV
- Advanced filtering and search
