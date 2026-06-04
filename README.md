# GitCommit — Premium GitHub Commit Viewer

GitCommit is a full-stack web application built using **TypeScript**, **Node.js (Express)**, **React (Vite)**, and **Docker**. It allows users to query any public GitHub repository, inspect commits, view aggregated unique contributors, and browse/preview commit comments directly in a premium dark-themed user interface.

---

## Key Features

1. **Repository Explorer**: Query any repository by typing `owner/repo` (e.g. `octocat/Spoon-Knife`, `facebook/react`, `microsoft/vscode`).
2. **Aggregated Contributors Dropdown**: Displays a sorted dropdown of unique commit authors, listing their usernames, and commit counts. Selecting an author filters the commits table instantly.
3. **Interactive Commits Table**: Displays the author avatar/username, formatted date, short SHA, commit title (first line of the commit message), and comments count.
4. **Comment Preview Modals**: Clicking the comment count badge on any commit fetches and displays all related comment logs (commenter avatar, handle, message body, creation date, and links to the GitHub thread).
5. **Robust API Handling**: Independently handles API responses, ensuring main commit lists display even if comments or author aggregation endpoints hit temporary blocks.
6. **API Limits Shield**: Displays remaining API request capacity from GitHub headers, warning the user when approaching limits.

---

## Technology Stack & Libraries

### 1. Backend (`/backend`)
- **Node.js + Express**: Core server framework. Selected for its lightweight footprint and clean TypeScript integration.
- **Axios**: Promised-based HTTP client used to fetch from GitHub API. Configured with default timeouts and error mappings.
- **CORS**: Middleware to allow safe frontend requests.
- **Dotenv**: Manages environment configurations (e.g. custom ports, GitHub tokens).
- **ts-node & nodemon**: Development server with automatic compilation and hot reloading.

### 2. Frontend (`/frontend`)
- **React + Vite**: Setup using the React-TypeScript Vite compiler engine. Chosen for lightning-fast build speeds.
- **Axios**: Communicates with the proxy routes.
- **Lucide React**: Clean vector icon library for modern dashboard representations.
- **Vanilla CSS (CSS Custom Properties)**: Complete modern responsive stylesheet utilizing glassmorphic panel variables, scroll animations, loading skeletons, and interactive neon accent variables. Avoids standard framework constraints.

### 3. Orchestration
- **Docker & Docker Compose**: Used to multi-stage compile both client/server services and bind them into a single virtual network.
- **Nginx (Alpine)**: Serves static compiled React builds and reverse-proxies requests matching `/api` to the backend server container, preventing CORS issues.

---

## Project Structure

```
read_commit_project/
├── docker-compose.yml              # Combined multi-container docker manager
├── README.md                       # Documentation
├── IMPLEMENTATION_PLAN.md          # Architectural planning blueprint
│
├── backend/                        # Node.js + Express + TS Service
│   ├── Dockerfile                  # Multi-stage production node Docker build
│   ├── package.json                # Server configurations and dependencies
│   ├── tsconfig.json               # strict compiler properties
│   └── src/
│       ├── index.ts                 # Server entrypoint and CORS setups
│       ├── routes/
│       │   └── github.ts            # Commit, unique author, and comment endpoints
│       ├── services/
│       │   └── githubService.ts     # Axios wrapper querying api.github.com
│       └── types/
│           └── index.ts             # TypeScript definitions
│
└── frontend/                       # React 18 + Vite + TS UI
    ├── Dockerfile                  # Multi-stage Nginx host Docker build
    ├── nginx.conf                   # Reverse proxy and path fallbacks
    ├── package.json                # Frontend dependencies
    ├── tsconfig.json               # typescript properties
    ├── vite.config.ts              # Proxy setups routing /api to localhost:3001
    ├── index.html                  # HTML template linking Google Fonts Inter
    └── src/
        ├── main.tsx                 # Mounting entrypoint
        ├── App.tsx                  # Root page control containing logic & layout
        ├── App.css                  # Grids, dashboards, and error panels
        ├── index.css                # Custom theme colors and scrollbar styling
        ├── api/
        │   └── github.ts           # Frontend queries and Link header parses
        ├── components/              # Reusable React components
        │   ├── Header.tsx           # Logo and live status badge
        │   ├── Header.css
        │   ├── RepoInput.tsx        # Owner/Repo input with regex validations
        │   ├── RepoInput.css
        │   ├── AuthorFilter.tsx     # Dropdown listing contribution stats
        │   ├── AuthorFilter.css
        │   ├── CommitTable.tsx      # Table display with pagination bar
        │   ├── CommitTable.css
        │   ├── CommentModal.tsx     # Comments browser with scroll lock
        │   └── CommentModal.css
        └── types/
            └── index.ts            # TypeScript definitions matching backend
```

---

## How to Run the Application

The entire full-stack application can be launched with a single command.

### 1. Run using Docker Compose (Recommended)

1. Make sure you have **Docker Desktop** installed on your system.
2. First start **Docker Desktop** on your local system
3. In the root project directory (`repo-commit-viewer`), run:
   ```bash
   docker-compose up --build
   ```
4. Once the build completes, the services are available at:
   - **Frontend**: [http://localhost:5173](http://localhost:5173) (Interactive UI)
   - **Backend**: [http://localhost:3001](http://localhost:3001) (API Endpoint root)
   - **Backend Health Check**: [http://localhost:3001/health](http://localhost:3001/health)

#### API Rate Limiting Note
GitHub limits unauthenticated API requests to **60 requests per hour**. For larger repositories, or if you hit rate limit thresholds (returning 403 blocks), you can inject a GitHub Personal Access Token. 
To run with a token, pass it to Docker Compose:
```bash
GITHUB_TOKEN=your_personal_access_token_here docker-compose up --build
```

---


## AI Code Generation Disclosure

This project was built with the assistance of **Google Gemini and cloud**, a developer-centric agentic coding assistant.

### Workflow & Tooling:
- **Design & Architecture**: Gemini was used to design the API transformations, reverse-proxy architectures, and state structure.
- **Code Generation**: All components, stylesheets, configurations (TypeScript/Nginx/Vite), and container scripts were generated using Gemini, then linted and compiled locally.
- **Testing Assistance**: Local cURL tests and TypeScript compilation processes were orchestrated using terminal integration within the IDE.

---
