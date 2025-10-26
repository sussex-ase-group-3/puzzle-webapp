# Puzzle Web App — Living Requirements Document

*This document evolves with each project task to capture requirements as they develop. It focuses on **************************************what************************************** the system must do (requirements), while technical specifications (data models, APIs, designs) live in separate documents.*

---

## 1. Overview

The goal of this web application is to provide an offline-capable, browser-based platform for solving and visualising various puzzles. This document is **living**: it will be updated at each task/milestone to reflect the current, agreed requirements.

---

## 2. Related Documents

To maintain clarity and modularity, supporting documents are maintained separately:

* **Data Model Specification** – defines the data structures used for each puzzle.
* **Decisions Log** – records major architectural and design decisions.
* **Project Plan** – composed of:

  * **Organization Plan** – team roles and responsibilities
  * **Development Plan** – overview of architecture and methodology choices
  * **Conflict Resolution Plan** – agreed approaches to team/process issues

This requirements document references these documents where relevant but does not duplicate their contents.

---

## 3. Structure of this Document

This document is designed to be living and cumulative:

* **Core Requirements** – system-wide functional and non-functional requirements applied across puzzles.
* **Task-specific Sections** – each new deliverable appends a section with its own requirements.
* **Version History** – dated notes summarising changes.

---

## 4. Core System Requirements

### 4.1 Functional Requirements (Global)

* **F1:** The application shall run fully offline after installation.
* **F2:** The user shall be able to select different puzzle types (as they become available).
* **F3:** Each puzzle shall provide interactive input appropriate to its model (e.g., board/grid where relevant).
* **F4:** The system shall generate solutions for a given input configuration.
* **F5:** The system shall display one or multiple valid solutions, when available.
* **F6:** The system shall clearly indicate invalid inputs or impossible configurations.

### 4.2 Non-Functional Requirements (Global)

* **NFR1:** Modular architecture separating frontend and backend.
* **NFR2:** Compatibility with local browsers (e.g., Chrome, Firefox, Edge) without internet connection.
* **NFR3:** Consistent, usable UI/UX across puzzles.
* **NFR4:** Accessible UI.

---

## 5. Task 2 — N-Queens

### 5.1 Overview

Implement the N-Queens puzzle, where the user inputs a partial board configuration and the system computes all valid completions. This task establishes the initial, demonstrable version of the app.

### 5.2 Functional Requirements (Task 2)

* **T2-FR1:** The user shall select the board size **N** (1 ≤ N ≤ 20).
* **T2-FR2:** The user shall toggle queens on a grid to define a **partial** configuration.
* **T2-FR3:** The app shall **prevent submission** (disable Solve) when the current partial has **vertical or diagonal** conflicts.
* **T2-FR4:** Upon clicking **Solve**, the frontend shall submit the current configuration to the backend.
* **T2-FR5:** The backend shall return all valid completions of the given partial configuration.
* **T2-FR6:** The frontend shall display all returned solutions and allow navigation between them (e.g., Next/Prev).
* **T2-FR7:** The frontend shall display a clear message when **no solutions** are found.

### 5.3 Non-Functional Requirements (Task 2)

* **T2-NFR1:** The UI should remain responsive up to **N = 14**; beyond this, performance degradation is acceptable.
* **T2-NFR2:** Solution computation shall occur in the backend; the frontend shall not implement a solver.
* **T2-NFR3:** Frontend validation shall be lightweight (no exhaustive solving logic).

### 5.4 Validation Rules (Task 2)

* Horizontal conflicts are inherently prevented (one queen per row).
* **Vertical conflicts**: two rows must not contain the same column value.
* **Diagonal conflicts**: two placed queens must not share `row - col` or `row + col` values.
* When any conflict is present, the **Solve** action is disabled and a user-facing message is shown.

### 5.5 Acceptance Criteria (Task 2)

* Given a valid partial, submitting **Solve** results in solutions being displayed; when multiple exist, the user can navigate between them.
* Given an invalid partial (vertical/diagonal conflict), the **Solve** action is disabled and an explanatory message is visible.
* Given a valid partial with **no** completing solutions, the user is informed clearly that no solutions exist.
* The application runs locally without external network calls at runtime.

---

## 6. Task 3 — Polysphere Puzzle *(placeholder)*

This section will be populated once new requirements are revealed. 

---

## 7. Version History

| Date       | Author              | Description                                             |
| ---------- | ------------------- | ------------------------------------------------------- |
| 2025-10-25 | Max de la Nougerede | Initial living requirements document (Task 2 baseline). |
|            |                     |                                                         |
