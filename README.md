# ArchFlow AI

> Less catching up. More moving forward.

ArchFlow AI is a project communication intelligence platform built for the AS-02 challenge: "Make project communication intelligent, not overwhelming." It turns scattered project conversations into structured insight so teams can quickly understand decisions, action items, deadlines, and people involved.

## Overview

Project communication often lives across meetings, emails, chats, and notes. That information is valuable, but it is easy to lose in the noise. ArchFlow AI brings those conversations together and extracts the signals that matter most.

The platform helps teams:

- capture communication records in one place
- organize project context around each initiative
- analyze conversations with AI
- surface decisions, priorities, owners, and due dates
- keep project momentum visible without manual follow-up

## Problem Statement

The AS-02 challenge focuses on one key problem: project communication is often fragmented and overwhelming. Important details get buried in long conversations, leading to missed action items, unclear ownership, and inconsistent follow-through.

ArchFlow AI addresses this by turning raw communication into structured project intelligence.

## Key Features

- User authentication and protected workspace access
- Project creation and management
- Communication capture across different sources
- AI-powered communication analysis
- Automatic summaries
- Decision extraction
- Action item extraction
- Deadline extraction
- People identification
- Structured AI insight display
- Responsive SaaS-style dashboard

## How It Works

Communication
↓
AI Analysis
↓
Summary
↓
Decisions
↓
Action Items
↓
Deadlines
↓
Project Intelligence

## Tech Stack

### Frontend
- React
- Vite
- Axios
- React Router
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

### AI
- Hugging Face Inference API
- OpenAI GPT-OSS 120B model

### Deployment
- Vercel
- Render
- MongoDB Atlas

## Architecture

ArchFlow AI follows a simple full-stack architecture:

- Frontend: React app served through Vite for the user interface and routed workspace experience
- Backend: Express API for authentication, project management, communication records, and AI endpoints
- Database: MongoDB with Mongoose models for users, projects, communications, and AI insights
- AI layer: communication analysis requests are sent to the AI service and saved as structured insight data

The frontend calls backend APIs for project and communication data, while the backend protects routes with JWT authentication and stores records in MongoDB.

## Project Structure

```text
ArchFlow-AI/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── README.md
└── package.json
```

## API Overview

The application uses authenticated API endpoints for workspace data and AI analysis.

### Authentication
- POST /api/auth/register
- POST /api/auth/login

### Projects
- POST /api/projects
- GET /api/projects
- GET /api/projects/:id
- PATCH /api/projects/:id
- DELETE /api/projects/:id

### Communications
- POST /api/communications
- GET /api/communications/project/:projectId
- GET /api/communications/:id
- PATCH /api/communications/:id
- DELETE /api/communications/:id

### AI insights
- POST /api/ai/analyze/:communicationId
- GET /api/ai/insight/:communicationId

## Screenshots

A clean gallery section for project visuals will be added here later.

### Landing Page

### Dashboard

### Projects

### Communication Details

### AI Insights

## Local Development

### Prerequisites
- Node.js
- MongoDB instance or MongoDB Atlas connection
- API token for the Hugging Face Inference service

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set the frontend API base URL locally in the environment:

```bash
VITE_API_URL=
```

### Backend

```bash
cd backend
npm install
npm run dev
```

Set the following environment variables locally before running the backend. Keep secret values local and never commit them to Git:

```bash
PORT=
MONGODB_URI=
JWT_SECRET=
HF_TOKEN=
```

## Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## Hackathon Context

ArchFlow AI was designed for the ArchScale Guild Intern Technology Hackathon and addresses the AS-02 challenge by making project communication intelligent instead of overwhelming. It helps teams capture the context of a conversation and immediately translate it into practical next steps.

## Future Improvements

The following are planned future ideas and are not currently implemented features:

- email ingestion
- Slack and Teams integration
- meeting transcript ingestion
- action item reminders
- deadline notifications
- team-level analytics
- AI confidence indicators

## Demo

- Live Demo: Add your deployment URL here
- GitHub Repository: Add repository link here
- Demo Video: Add video link here

## Author

This project is maintained in the ArchFlow-AI repository. No additional author information was provided for the project metadata.

## License

No license file was found in the repository, and no licensing information has been specified. This project currently does not include a formal license declaration.
