# TalentFlow - A Mini Hiring Platform

TalentFlow is a front-end-only React application designed as a mini hiring platform for HR teams. It allows users to manage job postings, track candidates through various hiring stages, and build job-specific assessments. This project was built to demonstrate proficiency in modern front-end technologies and architectural patterns without a real backend.

[**Live Demo Link**](https://talentflowkd.netlify.app/) 

## Table of Contents

- [Features](#features)
- [Technical Decisions & Architecture](#technical-decisions--architecture)
- [Project Setup](#project-setup)
- [Scripts](#scripts)
- [Challenges & Issues Faced](#challenges--issues-faced)

## Features

### 1. Job Management
- **Jobs Board:** List jobs with server-side-like pagination and filtering (by title, status, tags).
- **CRUD Operations:** Create and Edit jobs within a modal. Includes validation for required fields and unique slugs.
- **Drag-and-Drop Reordering:** Easily reorder jobs on the board with optimistic UI updates and a rollback mechanism on simulated API failure.
- **Archiving:** Archive and unarchive jobs to manage visibility.
- **Deep Linking:** Each job has a unique, shareable URL (`/jobs/:jobId`).

### 2. Candidate Tracking
- **Virtualized List:** Efficiently displays a large dataset (1,000+ candidates) using a virtualized list to ensure high performance.
- **Search & Filter:** Supports client-side search (by name/email) and server-side-like filtering (by hiring stage).
- **Kanban Board:** A drag-and-drop Kanban board to visually move candidates between hiring stages (`Applied`, `Screen`, `Tech`, `Offer`, etc.).
- **Candidate Profile:** A detailed profile page for each candidate (`/candidates/:id`) showing a timeline of their progress and status changes.
- **Notes & Mentions:** Ability to attach notes to a candidate's profile, with a simple `@mention` rendering feature.

### 3. Assessment Builder
- **Dynamic Form Builder:** Create custom assessments for each job.
- **Variety of Question Types:** Supports single-choice, multi-choice, short/long text, numeric range, and a file upload stub.
- **Live Preview:** A real-time preview pane that renders the assessment form as it's being built.
- **Conditional Logic:** Implement conditional questions (e.g., "Show Question 3 only if the answer to Question 1 is 'Yes'").
- **Local Persistence:** The state of the assessment builder and candidate responses are persisted locally.

## Technical Decisions & Architecture

This project is built with a focus on modern React practices, robustness, and a clean user experience.

- **Core Framework:** **React 18** is used for building the user interface, utilizing functional components and Hooks (`useState`, `useEffect`, `useContext`, etc.).

- **Bundler:** **Parcel** was chosen for its fast, zero-configuration setup, which is ideal for rapid development.

- **Routing:** **React Router v6** (`react-router-dom`) handles all client-side routing, enabling deep linking to jobs and candidate profiles.

- **API Simulation:** **MirageJS** is used to create a complete mock API layer.
    - It intercepts network requests and simulates a real REST API, including artificial latency (200-1200ms) and a 5-10% error rate on write operations to test resilience.
    - It acts as the "network" layer, but all data is written through to the browser's local storage or IndexedDB to ensure persistence across sessions.

- **UI & Styling:**
    - **Material-UI (MUI)** (`@mui/material`, `@mui/x-data-grid`) provides a comprehensive suite of pre-built, accessible components, accelerating UI development.
    - **Emotion** (`@emotion/react`, `@emotion/styled`) is used for styling, allowing for CSS-in-JS with excellent performance and theming capabilities that integrate seamlessly with MUI.
    - The `@mui/x-data-grid` is leveraged for the powerful, virtualized data grid to display the large list of candidates efficiently.

- **Drag and Drop:**
    - **Dnd Kit** (`@dnd-kit/core`, `@dnd-kit/sortable`) was selected for its modern, accessible, and performant drag-and-drop capabilities. It is used for both reordering jobs and the candidate Kanban board.
    - The implementation includes optimistic updates for a smooth UX, with logic to handle rollbacks if the simulated API returns an error.

- **State Management:**
    - For this project, a combination of local component state (`useState`) and React Context (`useContext`) is used for managing state.
    - Given the scope, a full-scale global state library like Redux was deemed unnecessary. State that needs to be shared across different component trees is handled via Context.
    - The primary source of truth for data is the persistence layer (managed via MirageJS writing to local storage/IndexedDB), which is fetched on application load.

- **Code Quality:**
    - **ESLint** and **Prettier** are configured to enforce a consistent code style and catch potential errors early.

## Project Setup

To run this project locally, follow these steps:

1.  **Prerequisites:**
    -   Node.js (v18.x or later recommended)
    -   npm or yarn

2.  **Clone the repository:**
    ```bash
    git clone https://github.com/ZenKD/Talentflow
    cd react-technical-assignment
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Run the development server:**
    The application will be available at `http://localhost:1234`.
    ```bash
    npm start
    ```

## Scripts

-   `npm start`: Starts the development server using Parcel.
-   `npm run build`: Creates a production-ready build in the `dist/` directory.
-   `npm test`: Runs tests using Jest.
-   `npm run lint`: Lints the codebase using ESLint.
-   `npm run lint:fix`: Automatically fixes linting issues.
-   `npm run prettier`: Formats the code using Prettier.

## Challenges & Issues Faced

-   **Optimistic UI with Rollback:** Implementing the drag-and-drop reordering with an optimistic update was straightforward, but adding a robust rollback mechanism that correctly reverts the state on a simulated API failure required careful state management. The UI must handle the error gracefully without confusing the user.

-   **State Synchronization:** Ensuring the UI state, MirageJS's in-memory database, and the browser's persistent storage (IndexedDB/localStorage) are always in sync was a key challenge. This is especially true on initial app load and after mutations (create, update, delete).

-   **Complex Form Logic:** The assessment builder's conditional question logic required a flexible data structure for defining rules and a rendering engine that could dynamically show/hide questions based on user input in other fields.

-   **Performance with Large Datasets:** While `@mui/x-data-grid` handles virtualization well, ensuring that client-side search and filtering remain snappy on a list of 1,000+ candidates required debouncing input and optimizing the filtering logic.
