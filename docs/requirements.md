# Requirements

This document evolves with each project task to capture requirements as they develop. It focuses on **what** the system must do (requirements), while technical specifications (data models, APIs, designs) live in separate documents.

---

## Overview

The goal of this web application is to provide an offline-capable, browser-based platform for solving and visualising various puzzles. This document is **living**: it will be updated at each task/milestone to reflect the current, agreed requirements.

---

## Related Documents

To maintain clarity and modularity, supporting documents are maintained separately:

- Data Model Specification – defines the data structures used for each puzzle.
- Decisions Log – records major architectural and design decisions.
- Project Plan – composed of:
  - Organization Plan – team roles and responsibilities
  - Development Plan – overview of architecture and methodology choices
  - Conflict Resolution Plan – agreed approaches to team/process issues

This requirements document references these documents where relevant but does not duplicate their contents.

---

## Structure of this Document

This document is designed to be living and cumulative:

### Core Requirements

system-wide functional and non-functional requirements applied across puzzles.

### Task-specific Sections:

each new deliverable appends a section with its own requirements.

### Version History

dated notes summarising changes.

---

## Core System Requirements

### Functional Requirements

- The application shall run fully offline after installation.
- The user shall be able to select different puzzle types (as they become available).
- Each puzzle shall provide interactive input appropriate to its model (e.g., board/grid where relevant).
- The system shall generate solutions for a given input configuration.
- The system shall display one or multiple valid solutions, when available.
- The system shall clearly indicate invalid inputs or impossible configurations.

### Non-Functional Requirements

- Modular architecture separating frontend and backend.
- Compatibility with local browsers (e.g., Chrome, Firefox, Edge) without internet connection.
- Consistent, usable UI/UX across puzzles.
- Accessible UI.

---

## Task 2: — N-Queens

Implement the N-Queens puzzle, where the user inputs a partial board configuration and the system computes all valid completions. This task establishes the initial, demonstrable version of the app.

### Functional Requirements

- The user shall select the board size `N` (1 ≤ N ≤ 20).
- The user shall toggle queens on a grid to define a **partial** configuration.
- The app shall **prevent submission** (disable Solve) when the current partial has **vertical or diagonal** conflicts.
- Upon clicking `Solve`, the frontend shall submit the current configuration to the backend.
- The backend shall return all valid completions of the given partial configuration.
- The frontend shall display all returned solutions and allow navigation between them (e.g., Next/Prev).
- The frontend shall display a clear message when `no solutions` are found.

### Non-Functional Requirements

- The UI should remain responsive up to `N = 11`; beyond this, performance degradation is acceptable.
- Solution computation shall occur in the backend; the frontend shall not implement a solver.
- Frontend validation shall be lightweight (no exhaustive solving logic).

### Validation Rules

- Horizontal conflicts are inherently prevented (one queen per row).
- Vertical conflicts: two rows must not contain the same column value.
- Diagonal conflicts: two placed queens must not share `row - col` or `row + col` values.
- When any conflict is present, the `Solve` action is disabled and a user-facing message is shown.

### Acceptance Criteria

- Given a valid partial, submitting `Solve` results in solutions being displayed; when multiple exist, the user can navigate between them.
- Given an invalid partial (vertical/diagonal conflict), the `Solve` action is disabled and an explanatory message is visible.
- Given a valid partial with no completing solutions, the user is informed clearly that no solutions exist.
- The application runs locally without external network calls at runtime.

---

## Task 3: Polysphere Puzzle _(placeholder)_

Implement the Polysphere puzzle, where the user inputs a partial board configuration and the system computes all valid completions. This task establishes the initial, demonstrable version of the app.

### Functional Requirements

- The user should be able to drag and drop pieces onto the board for a partial configuration.
- The user should not be able to place pieces in ways that result in multiple pieces occupying the same cells.
- Upon clicking `Solve`, the frontend shall submit the current configuration to the backend.
- The backend shall yield all valid completions of the given partial configuration one at a time.
- The frontend shall display all returned solutions and allow navigation between them (e.g., Next/Prev).
- The frontend shall display a clear message when `no solutions` are found.

### Non-Functional Requirements

- Solution computation shall occur in the backend; the frontend shall not implement a solver.
- Frontend validation shall be lightweight (no exhaustive solving logic).

### Acceptance Criteria

- Given a valid partial, submitting `Solve` results in solutions being displayed; when multiple exist, the user can navigate between them.
- Given an invalid partial (vertical/diagonal conflict), the `Solve` action is disabled and an explanatory message is visible.
- Given a valid partial with no completing solutions, the user is informed clearly that no solutions exist.
- The application runs locally without external network calls at runtime.
