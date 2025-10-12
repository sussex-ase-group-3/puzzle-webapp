# Conflict Resolution Plan

To support effective collaboration while accommodating the diverse schedules of team members, all coordination and conflict resolution will be handled asynchronously using GitHub’s project management features. The customer will only be contacted in cases where deliverables or timelines are impacted.

## Task Management and Accountability

- All tasks will be created, assigned, and tracked using GitHub Issues and the Projects tab.
- Each task will include a clear description, deadline, and assignee. Tasks will be broken down as granularly as necessary to ensure transparency and visibility.
- Team members are expected to update the status of their tasks regularly through GitHub comments, project board status changes (e.g., "in progress", "ready for review") and task relationships (e.g. blocked by).

## Missed Deadlines (Individual Tasks)

- If a task deadline is missed without prior notice, it will be flagged within GitHub (e.g., with a comment or label).
- The task will be reassigned if it is time-sensitive or critical to the project timeline.
- The original assignee will be contacted asynchronously to understand the cause of the delay. Workload expectations may be adjusted where appropriate.

## Group Member Withdrawal

- In the event that a team member formally withdraws from the project, their tasks will be redistributed among the remaining members.
- The team will evaluate whether the current scope is still achievable.
- If the team cannot reasonably deliver on time with the reduced capacity, a revised timeline will be proposed to the customer.

## Supporting Quality and Growth as a Team

- If a team member is consistently struggling to meet quality expectations, we treat it first and foremost as a learning and support opportunity.
  - Feedback will be shared constructively via GitHub pull request comments and conversations, with a focus on helping each other grow.
  - The team may revisit whether the types of tasks being taken on are the best fit for the individual’s current skill level, and explore adjustments collaboratively.
  - We’ll encourage pairing, mentoring, or peer support as needed, and make space for learning through simpler or more focused tasks when helpful.
- If the same challenges continue over time despite feedback and support, the team may need to plan around current capacity more deliberately. Any such changes will be discussed openly with the individual involved.
- The customer will only be informed if there is a meaningful risk to overall deliverables.

## Communication and Documentation

- All important communication will occur within GitHub (issues, pull requests, or discussion threads), Discord or weekly meetings which will be kept documented.
- This ensures all decisions and progress are documented, traceable, and visible to the full team.
- We recognize that unexpected challenges can arise. Team members are encouraged to communicate early if they anticipate delays or need help, so the team can adapt collaboratively.
- Meetings will happen on Fridays 13:00-15:00
- Regular communication between team members is recommended to facilitate team growth and idea generation.

## Customer Communication

- The customer will be communicated with whenever a deliverable is ready for them.
- With regards to problems within the project, the customer should only be informed if scope or timelines are impacted by the issue.
- Any communication regarding issues will clearly explain:
  - The nature of the issue
  - The internal steps taken to address it
  - A proposed solution, such as a revised timeline or re-scoped deliverables

## Technical Disagreements

- Disagreements on major design or implementation decisions will be discussed via GitHub Discussions, Issue threads or Discord.
- If consensus cannot be reached within 48 hours, the majority preference will be followed, or a lightweight vote will be held among the team.
- All major decisions will be documented in GitHub for future reference.
- Minor decisions or differences in approach are a normal part of collaboration. It's better to choose a reasonable path forward and keep momentum than to let small disagreements disrupt progress.
- Minor decisions include:
  - Naming conventions that don't impact readability or consistency (i.e. sorted_list vs sorted_vector)
  - Implementation details where multiple options are valid and the trade-offs are negligible
  - Choice of utility functions, tools, or approaches when performance, maintainability, and clarity are not meaningfully affected
  - Style preferences that are not enforced by linters or code formatters
    - Linters and code formatters should be used with a shared project configuration before each commit
    - This project configuration could be the default or a custom configuration built for the project
