# 🚀 ArchFlow AI

### Less catching up. More moving forward.

> **Turn scattered project conversations into structured project intelligence.**

ArchFlow AI is an AI-powered project communication intelligence platform built for the **ArchScale Guild Intern Technology Hackathon 2026 — AS-02: "Make project communication intelligent, not overwhelming."**

It transforms project conversations into structured insights so teams can quickly understand:

**Summary • Decisions • Action Items • Deadlines • People Involved**

---

## ✨ Why ArchFlow AI?

Project communication is often scattered across meetings, emails, chats, and notes.

Important information can easily get buried inside long conversations:

- What was decided?
- Who needs to do something?
- What needs to be completed?
- When is it due?
- Who is involved?

ArchFlow AI turns unstructured communication into information that is easier to understand and act on.

### Without ArchFlow AI

```text
Long Project Conversation
          ↓
      Manual Reading
          ↓
   Find Important Details
          ↓
     Create Tasks
          ↓
      Follow Up
```

### With ArchFlow AI

```text
Project Communication
          ↓
      AI Analysis
          ↓
   Structured Insight
          ↓
 ┌────────┼──────────┐
 ↓        ↓          ↓
Summary Decisions Action Items
          ↓
      Deadlines
          ↓
   People Involved
          ↓
 Project Intelligence
```

---

## 🎯 Problem Statement

### AS-02 — Make project communication intelligent, not overwhelming

Project teams communicate constantly through meetings, emails, chats, notes, and project updates.

While these conversations contain valuable information, important details can become difficult to find.

This can result in:

- Missed action items
- Unclear ownership
- Forgotten deadlines
- Repeated follow-ups
- Difficulty tracking project decisions
- Time wasted reading lengthy communication

### The Goal

Instead of building another large project-management platform, ArchFlow AI focuses on one specific intervention:

> **Turn project communication into clear, structured, actionable information.**

---

## 💡 The Solution

ArchFlow AI provides a centralized workspace where users can:

1. Create and manage projects
2. Add project communications
3. Capture communication context
4. Analyze conversations with AI
5. Extract structured insights
6. Review decisions and action items
7. Identify deadlines and people involved

The core idea is simple:

> **Capture the conversation → understand what matters → make the next steps visible.**

---

# ✨ Key Features

### 🔐 Authentication

- User registration
- Secure login
- Password hashing using bcrypt
- JWT-based authentication
- Protected API routes

### 📁 Project Management

Create and manage projects with:

- Project name
- Description
- Client name
- Project status
- Project ownership

Supported project statuses:

- Planning
- Active
- Completed
- On Hold

### 💬 Communication Capture

Store project communications with:

- Communication title
- Communication source
- Content
- Participants
- Associated project

Supported sources:

- 🗓️ Meeting
- 📧 Email
- 💬 Chat
- 📝 Note

### 🧠 AI-Powered Analysis

ArchFlow AI analyzes communication and extracts:

#### 📝 Summary

A concise overview of the communication.

#### ✅ Decisions

Important decisions explicitly mentioned in the communication.

#### 📋 Action Items

Tasks that need to be completed, including the responsible person and deadline when available.

#### ⏰ Deadlines

Important dates and deadlines mentioned in the communication.

#### 👥 People Involved

People or roles mentioned in the communication.

### 📊 Structured AI Insights

Instead of returning a long AI response, ArchFlow AI presents extracted information in structured sections that are easier to scan and verify.

### ✨ Animated Interface

Motion is used only where it carries meaning. Every animation respects
`prefers-reduced-motion`.

- Staggered fade-and-rise entrances (`BlurFade`) across pages, lists and
  insight sections
- Counting-up stat values (`NumberTicker`) on the dashboard and insight
  section counts
- A light sweep on the primary action (`ShimmerButton`) and a restrained
  hover sweep on cards (`ShimmerCard`)
- An AI "thinking" state (`AIScanner`) with a rotating compass and cycling
  phase labels while a communication is being analyzed
- Animated progress bars (`ProgressBar`) for real proportions
- Slide-in, auto-expiring toasts (`Toast`) that replace the previous
  static success banners
- Route-level page transitions (`PageTransition`)

### 🎨 Design Approach

The interface deliberately avoids the things that make a product look
generated:

- **No ornamental texture.** No decorative grids, corner ticks, dimension
  lines, particle backgrounds or title blocks. Every rule on screen
  separates real content.
- **Typography does the work.** A deliberate modular type scale, tight
  leading and negative tracking on display type, a real spacing scale, and
  a controlled measure on long-form copy.
- **Monospace is reserved for metadata** — numerals, codes and labels —
  never used as decoration.
- **Asymmetry over symmetry.** The landing hero is top-aligned and
  unbalanced on purpose rather than a centred two-column template.
- **The product is described, not pictured.** The hero states what the
  software extracts instead of showing a floating mock-product card.
- **Flat surfaces.** Hairline borders and almost no shadow, so cards sit on
  the page instead of floating above it.
- **Specific content.** Demo data uses real project names, locations,
  clients and construction detail, including open questions and things
  still outstanding.

> Tailwind CSS is configured with Preflight **disabled** on purpose. The
> project styles itself with a hand-written design system in
> `src/styles/app.css`; Tailwind's reset would override those element
> defaults. Tailwind is available for utilities only.
>
> `src/styles/theme.css` holds the palette, type scale and spacing scale
> and is applied purely by overriding CSS custom properties — switching
> palettes requires no component changes.

### 🔎 Searchable Project Memory

Project details include a lightweight frontend search across the communication history already loaded for that project. Search matches communication titles, content, sources, participants, and available saved AI insight data, including summaries, decisions, action items, assignees, deadlines, and people involved.

Search results remain within the existing project communication list and link directly to the existing communication details route.

---

# 🔄 How It Works

```mermaid
flowchart LR
    A[User] --> B[Create Project]
    B --> C[Add Communication]
    C --> D[AI Analysis]
    D --> E[Structured Insight]

    E --> F[Summary]
    E --> G[Decisions]
    E --> H[Action Items]
    E --> I[Deadlines]
    E --> J[People Involved]
```

### Complete Product Workflow

```mermaid
flowchart TD
    A[Create Project] --> B[Add Communication]
    B --> C[Analyze Communication]
    C --> D[AI Processing]
    D --> E[Generate Structured Insight]
    E --> F[Review AI Insight]
    F --> G[Understand Next Steps]
```

---

# 🤖 AI Intelligence

ArchFlow AI uses the **Hugging Face Inference API** with the **OpenAI GPT-OSS 120B** model.

The AI is instructed to analyze communication and return structured JSON rather than an unstructured conversational response.

The generated insight follows this structure:

```json
{
  "summary": "",
  "decisions": [],
  "actionItems": [
    {
      "task": "",
      "assignee": "",
      "deadline": "",
      "status": "pending"
    }
  ],
  "deadlines": [
    {
      "description": "",
      "date": ""
    }
  ],
  "peopleInvolved": []
}
```

### 🛡️ AI Design Principle

ArchFlow AI is designed to avoid inventing information.

If something is not explicitly mentioned in the communication, the AI is instructed to return an empty value or array instead of creating unsupported information.

---

# 🧠 AI Insight Example

### Raw Communication

```text
The client approved the revised living room layout and requested
larger windows on the east side.

The architect will prepare the updated floor plan by Friday.

The supplier confirmed that the selected tiles are available and
can be delivered next week.

The client asked the architect to confirm the final window
dimensions before ordering.
```

### Generated Insight

#### 📝 Summary

The client approved the revised living room layout and requested larger windows. The architect will prepare an updated floor plan, while the supplier confirmed tile availability.

#### 📋 Action Item

```text
Task:
Prepare revised design for the living room layout

Assignee:
Architect

Deadline:
Friday

Status:
Pending
```

#### ⏰ Deadline

```text
Revised design delivery
Friday
```

#### 👥 People Involved

```text
Client
Architect
Supplier
```

This structured insight represents the core product experience of ArchFlow AI.

---

# 🏗️ System Architecture

```mermaid
flowchart TB
    U[User]

    FE[React Frontend]
    API[Express REST API]
    AUTH[JWT Authentication]
    DB[(MongoDB Atlas)]
    AI[Hugging Face Inference API]

    U --> FE
    FE --> API

    API --> AUTH
    API --> DB
    API --> AI

    AI --> API
    API --> DB
```

### Architecture Overview

**Frontend**

React application responsible for:

- User interface
- Routing
- Authentication state
- Project management
- Communication management
- AI insight presentation

**Backend**

Node.js + Express REST API responsible for:

- Authentication
- Authorization
- Project operations
- Communication operations
- AI analysis requests
- Insight storage

**Database**

MongoDB stores:

- Users
- Projects
- Communications
- AI insights

**AI Layer**

Communication text is sent to the Hugging Face inference service for analysis. The structured result is then returned through the backend and stored as an AI insight.

---

# 🛠️ Tech Stack

## Frontend

- ⚛️ React
- ⚡ Vite
- 🔀 React Router
- 🔗 Axios
- 🎨 CSS
- ✨ Tailwind CSS (utilities only — Preflight deliberately disabled)
- 🧩 shadcn / Magic UI animated components

## Backend

- 🟢 Node.js
- 🚂 Express.js
- 🍃 MongoDB
- 🧩 Mongoose
- 🔐 JWT
- 🔒 bcryptjs

## AI

- 🤗 Hugging Face Inference API
- OpenAI GPT-OSS 120B

## Deployment

- ▲ Vercel — Frontend
- Render — Backend
- MongoDB Atlas — Database

---

# 📂 Project Structure

```text
ArchFlow-AI/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── projectController.js
│   │   ├── communicationController.js
│   │   └── aiController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── validateObjectId.js
│   │   ├── ownership.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Communication.js
│   │   └── AIInsight.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── communicationRoutes.js
│   │   └── aiRoutes.js
│   ├── services/
│   │   ├── aiService.js
│   │   └── aiResponseParser.js
│   ├── scripts/
│   │   ├── seed-insight.js   # dev helper: demo insight without AI calls
│   │   └── cleanup-demo.js   # dev helper: remove seeded demo data
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── asyncHandler.js
│   │   └── env.js
│   ├── tests/
│   │   ├── aiResponseParser.test.js
│   │   ├── api.test.js
│   │   └── testDb.js
│   ├── server.js
│   ├── eslint.config.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/           # shadcn/Magic UI animated components
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/          # AuthContext + ToastContext
│   │   ├── lib/              # cn() helper
│   │   └── styles/
│   │       ├── app.css       # base design system
│   │       ├── tailwind.css  # Tailwind utilities (no Preflight)
│   │       ├── animations.css
│   │       └── theme.css     # palette, type scale, spacing scale
│   ├── components.json       # shadcn config
│   ├── scripts/
│   │   └── seed-demo.mjs     # dev helper: seeds demo projects
│   ├── index.html
│   ├── eslint.config.js
│   ├── package.json
│   └── vite.config.js
│
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore
└── README.md
```

---

# 🔌 API Overview

ArchFlow AI uses authenticated REST APIs for workspace data and AI analysis.

## 🔐 Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

## 👤 Current User

These routes always act on the signed-in user and never accept an `:id`,
so one account can never read, modify or delete another's data.

```text
GET    /api/users/me
PATCH  /api/users/me
DELETE /api/users/me
```

## 📁 Projects

```text
POST   /api/projects
GET    /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id
```

Deleting a project cascades to its communications and their AI insights.

## 💬 Communications

```text
POST   /api/communications
GET    /api/communications/project/:projectId
GET    /api/communications/:id
PATCH  /api/communications/:id
DELETE /api/communications/:id
```

Editing a communication's **content** deletes its saved insight, because
an insight describes specific text. The response sets
`insightInvalidated: true` so the UI can prompt for a re-analysis. Title,
source or participant edits keep the existing insight.

Deleting a communication cascades to its AI insight.

## 🧠 AI Insights

Analyze a communication:

```text
POST /api/ai/analyze/:communicationId
```

Retrieve an existing insight:

```text
GET /api/ai/insight/:communicationId
```

Fetch many insights in a single request (used by the project details page):

```text
POST /api/ai/insights/batch
```

Aggregate counts for the dashboard:

```text
GET /api/ai/insights/summary
```

Protected endpoints require a valid JWT authentication token.

> Searchable Project Memory is implemented in the frontend over the existing project communication and saved insight responses; it does not add a separate backend search endpoint or database index.

---

# 🔒 Security

ArchFlow AI follows basic security practices including:

- Password hashing with bcrypt
- JWT authentication
- Protected API routes
- Project and communication ownership validation
- User routes scoped to the authenticated account only
- Security headers via Helmet
- CORS restricted to a configured origin allowlist
- Rate limiting on auth, AI analysis, and all routes globally
- Request payload size limits
- Environment variables for sensitive credentials
- `.env` excluded from Git

### 🛡️ Error Handling

All routes funnel through a central error handler. Only deliberate
`ApiError` messages and allow-listed Mongoose errors are sent to the
client; unexpected failures are logged server-side and replaced with a
generic message so internals are never exposed.

Malformed identifiers are rejected with a `400` before reaching the
database layer.

### ⏱️ Rate Limits

| Scope | Limit |
| ----- | ----- |
| `/api/auth/*` | 20 failed attempts per 15 min |
| `/api/ai/analyze/*` | 20 analyses per min |
| All routes | 1000 requests per 15 min |

### 🔁 AI Response Handling

Model output is not trusted blindly. Responses are stripped of markdown
fences and reasoning preambles, extracted as a balanced JSON object,
parsed, then validated and normalized into the schema shape before
storage. Malformed or transient failures are retried up to 3 times with
exponential backoff.

Sensitive environment variables include:

```env
MONGODB_URI=
JWT_SECRET=
HF_TOKEN=
CORS_ORIGIN=
```

Copy `backend/.env.example` to `backend/.env` and fill in the values.
The server validates the environment at startup and exits with a clear
message if anything required is missing.

> **Never commit real secret values to GitHub.**

---

## 📸 Screenshots

Screenshots of the deployed application showcasing the main product experience.

### 🏠 Landing Page

![ArchFlow AI Landing Page](./screenshots/landing-page.png)

### 📊 Dashboard

![ArchFlow AI Dashboard](./screenshots/dashboard.png)

### 📁 Projects

![ArchFlow AI Projects](./screenshots/projects.png)

### 💬 Communication Details

![ArchFlow AI Communication Details](./screenshots/communication-details.png)

### 🧠 AI Insights

![ArchFlow AI Insights](./screenshots/ai-insights.png)

> **AI Insights is the core product-defining experience of ArchFlow AI.**

# 🚀 Local Development

## Prerequisites

Make sure you have:

- Node.js
- npm
- MongoDB or MongoDB Atlas
- Hugging Face API access

## 1. Clone the Repository

```bash
git clone https://github.com/SHRUTI-GAJJAR/ArchFlow-AI.git
cd ArchFlow-AI
```

## 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create `backend/.env`:

```env
PORT=5500
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
HF_TOKEN=your_huggingface_token
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

See `backend/.env.example` for the full annotated list.

The backend will run locally on:

```text
http://localhost:5500
```

## 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5500/api
```

See `frontend/.env.example` for details.

### Optional: Seed Demo Data

To populate the workspace with example projects and communications:

```bash
cd frontend
node scripts/seed-demo.mjs
```

It prints a generated email, password, and JWT you can use to sign in.

To exercise the insight panel without spending AI provider credits, seed a
sample insight for one of the generated communications:

```bash
cd backend
node scripts/seed-insight.js <communicationId>
```

To remove everything the seed scripts created:

```bash
cd backend
node scripts/cleanup-demo.js
```

---

# ✅ Quality Checks

Both packages ship lint and test tooling.

```bash
# Backend
cd backend
npm run lint
npm test

# Frontend
cd frontend
npm run lint
npm run build
```

The backend test suite covers the AI response parser and the REST API
(ownership, ObjectId validation, cascade deletes, insight invalidation,
batch insights, and auth behaviour). It uses an in-memory MongoDB, so no
external database or API calls are required.

GitHub Actions runs lint, tests, and the production build on every push
and pull request. See `.github/workflows/ci.yml`.

---

# 🌐 Deployment

ArchFlow AI uses a separated frontend/backend deployment architecture.

```text
                    ┌────────────────────┐
                    │       Vercel       │
                    │   React Frontend   │
                    └─────────┬──────────┘
                              │
                              ↓
                    ┌────────────────────┐
                    │      Render        │
                    │  Express Backend   │
                    └─────────┬──────────┘
                              │
                 ┌────────────┴────────────┐
                 ↓                         ↓
        ┌──────────────────┐     ┌──────────────────┐
        │  MongoDB Atlas   │     │ Hugging Face API │
        │     Database     │     │   AI Inference   │
        └──────────────────┘     └──────────────────┘
```

### Frontend

Hosted on **Vercel**.

### Backend

Hosted on **Render**.

Production backend:

```text
https://archflow-ai-hj5p.onrender.com
```

### Database

Hosted on **MongoDB Atlas**.

The frontend communicates with the deployed backend through:

```text
https://archflow-ai-hj5p.onrender.com/api
```

---

# 🏆 Hackathon Context

ArchFlow AI was built for the:

## ArchScale Guild Intern Technology Hackathon 2026

### Selected Challenge

**AS-02 — Make project communication intelligent, not overwhelming**

The project intentionally focuses on one painful part of project workflows instead of attempting to replace an entire project-management ecosystem.

The intervention is:

```text
Capture Conversation
        ↓
Analyze Communication
        ↓
Extract Important Information
        ↓
Make Next Steps Visible
```

---

# 🎯 Product Focus

ArchFlow AI focuses on the point where:

> **A conversation needs to become action.**

Rather than replacing every project-management tool, ArchFlow AI acts as an intelligence layer between communication and execution.

```text
Conversation
     ↓
Understanding
     ↓
Structured Insight
     ↓
Action
```

---

# 🔮 Future Improvements

The following are future possibilities and are **not currently implemented features**.

### 📧 Email Integration

Automatically analyze project-related email conversations.

### 💬 Slack / Microsoft Teams Integration

Capture communication directly from collaboration platforms.

### 🎙️ Meeting Transcript Analysis

Analyze meeting transcripts and extract project intelligence.

### ⏰ Action Item Reminders

Notify responsible team members when tasks approach their deadlines.

### 🔔 Deadline Notifications

Provide proactive notifications for upcoming deadlines.

### 📈 Team-Level Analytics

Analyze communication patterns and project-level activity.

### 🎯 AI Confidence Indicators

Show confidence levels for extracted information.

---

# 🎥 Demo

## 🌐 Live Demo

**[View ArchFlow AI Live](https://arch-flow-ai-eosin.vercel.app/)**

## 💻 GitHub Repository

**[View Source Code](https://github.com/SHRUTI-GAJJAR/ArchFlow-AI)**

---

# 🧪 Validation

The application has been validated through:

- Frontend production builds
- Protected backend API routes
- JWT authentication
- MongoDB persistence
- Project CRUD operations
- Communication CRUD operations
- AI communication analysis
- Structured AI insight storage and retrieval

The interface is designed to provide a responsive experience across:

- 🖥️ Desktop
- 💻 Laptop
- 📱 Tablet
- 📲 Mobile

---

# 👩‍💻 Author

## Shruti Ujeniya

**Full-Stack Web Developer | MERN Stack**

ArchFlow AI was designed and developed as a full-stack AI-powered project communication intelligence platform for the **ArchScale Guild Intern Technology Hackathon 2026**.

### Core Areas

- React.js
- Node.js
- Express.js
- MongoDB
- REST APIs
- JWT Authentication
- AI Integration
- Responsive Web Development

---

# ⭐ Project Highlights

```text
✨ AI-powered communication analysis
🧠 Structured project intelligence
📋 Automatic action-item extraction
⏰ Deadline extraction
👥 People identification
📁 Project-based communication organization
🔐 JWT authentication
⚡ Modern React frontend
🌐 Full-stack deployment
📱 Responsive SaaS experience
```

---

# ❤️ Built with Purpose

## ArchFlow AI

### Less catching up. More moving forward.

> **Turning project conversations into the next actionable step.**
