# Development Plan

This project is a web application designed to generate and present solutions for a particular set of puzzles. The core functionality centers around server-based puzzle generation and solution logic, presented via a React-based frontend. Development is following an Agile-inspired workflow.

## Architecture

The application will use a Node.js backend to handle puzzle generation and solution logic. The backend will expose a simple API for the frontend to consume.

The frontend will be built in React with TypeScript. The choice between a single-page application, multi-page architecture, or server-rendered approach is still under discussion.

Key architectural decisions:
- Puzzle logic will preferably run on the server but may be client-side if needed for performance or responsiveness.
- CI/CD will be handled via GitHub Actions.

## Methodology

The team follows a lightweight, iterative methodology inspired by Agile principles. Development work is tracked using GitHub Projects in a Kanban-style board, with a Gantt view used for retrospective analysis of task completion timelines.

- **Planning**: Major tasks and milestones are planned during weekly meetings, with flexibility to add new issues asynchronously throughout the week.
- **Communication**: Team members collaborate primarily through GitHub — using issues, pull requests, and discussions — as well as during weekly meetings.
- **Quality Assurance**: One team member is responsible for QA, testing, and maintaining a living style guide. All pull requests require their approval, though this can be overridden by the team lead if necessary.
- **Testing**: Testing will be prioritized as time allows, with a preference for unit and integration tests. Tooling is still under evaluation.

## Frameworks

The tech stack for the project includes:

- **Frontend**: React with TypeScript
- **Backend**: Node.js
- **Testing**: Likely Jest, pending further evaluation
- **CI/CD**: GitHub Actions, integrated with GitHub Projects workflows

No additional tooling or libraries have been selected at this stage but these will be chosen as the project evolves.
