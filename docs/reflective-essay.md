# Reflective Essay — Advanced Software Engineering

## 1. Project Context

Our project involved developing a web-based application capable of generating and presenting solutions to several logic puzzles, including N-Queens and Polysphere variants. The system followed a client–server design: an Express backend implemented the puzzle-solving logic, while a React frontend visualised puzzle states and allowed users to interact with them.

Our team initially consisted of five members, and a sixth member joined shortly after the submission of Tasks 1 and 2. Roles were allocated early, spanning team leadership, quality assurance, backend development, and frontend development. As the project progressed our workflow adapted naturally, both because the newcomer had not been assigned a predefined role and because team members’ availability varied.

We adopted a lightweight Agile-inspired workflow, using GitHub Projects and issues to track tasks, GitHub Actions for continuous integration, and Discord alongside GitHub for communication. Our primary synchronous meeting occurred weekly during the timetabled lab session, and the rest of our coordination relied on asynchronous updates. These decisions shaped both the strengths of our engineering process and the challenges we encountered.

---

## 2. A Helpful Feature of Our Software Engineering Process

One feature of our software engineering process that proved especially helpful was our strong emphasis on **quality assurance**, including code review, CI/CD automation, and consistent coding standards. The responsibilities associated with this work were outlined clearly in our project plan: reviewing and approving pull requests, maintaining documentation and style consistency, and catching issues early through testing and review. :contentReference[oaicite:0]{index=0}

In practice, these procedures were carried out consistently. Pull requests were examined carefully before merging, CI pipelines provided immediate feedback on potential issues, and a well-structured testing framework ensured correctness in our puzzle-solving logic. Backend documentation and the consistent style enforced through linting also helped to maintain clarity across the codebase. This made it easier for contributors to understand the code and reduced integration friction throughout the project.

These quality assurance practices were helpful for several reasons. They provided stability at times when contributions were uneven, ensuring that the project remained coherent even as different members worked at different times. They also raised the overall reliability of the system, helping us identify mistakes early and maintain a clear standard across the entire codebase. Importantly, these practices mirror professional engineering workflows, and adapting them effectively strengthened our capacity to collaborate.

Overall, the emphasis on quality assurance was one of the most successful aspects of our engineering process and made a significant positive contribution to the project’s outcome.

---

## 3. A Problematic Feature of Our Software Engineering Process

A feature of our process that proved problematic was our reliance on a **largely asynchronous, role-based workflow**, which assumed consistent communication and regular task updates from all team members. This structure was chosen to make the most of differing schedules, minimise additional meetings outside the lab, and allow each member to manage their responsibilities autonomously.

### Why we adopted this approach

The approach was grounded in the intentions of our project plan, which emphasised asynchronous coordination through GitHub issues, documentation of progress, and clearly distributed responsibilities. :contentReference[oaicite:1]{index=1} This model is widely used in distributed software development, and it is well suited to student teams balancing multiple commitments.

### Challenges that emerged

In practice, maintaining shared visibility across the team proved challenging. Asynchronous workflows rely on frequent, concise updates to keep everyone aligned, and this level of communication can be difficult to sustain. Across the project, updates to GitHub issues varied in frequency, which sometimes made it hard to assess progress or to know whether anyone was facing blockers. This occasionally led to uncertainty over task status and reduced the opportunities for early coordination.

Recognising this, the group discussed introducing an additional synchronous meeting during the week. One member, drawing on experience with a similar project, proposed this as a way to improve alignment. Although the idea was supported in principle, it proved difficult to find a time slot with sufficient overlap among the team. Some members did not share their availability, and as a result the second meeting was never established.

These difficulties did not stem from disagreements or from the complexity of the work itself. Much of the implementation was straightforward once defined, and the team interacted constructively. Instead, the challenge lay in the fact that asynchronous workflows depend on reliable engagement, and our project plan’s conflict resolution mechanisms were tailored more toward resolving explicit disputes or deadline issues rather than addressing quiet periods or uncertainty around participation.

### Whether the problems were anticipated

We understood in theory that asynchronous processes require consistent communication, but we did not anticipate how easily visibility into progress could diminish when engagement varied. Although our plan included measures for task reassignment and follow-up, there were no explicit conflicts or urgent blocking situations that triggered these mechanisms early in the project.

### Possible refinements

While some proposed refinements would have been challenging to implement fully, there are several realistic lessons for future group work:

1. **Lightweight check-ins**  
   Even a brief mid-week message round in Discord — for example, “One sentence on what I’m doing next” — could help maintain a shared understanding of activity.

2. **Clearer expectations for updating GitHub tasks**  
   Establishing a norm of updating issues after each work session or before each weekly meeting would improve transparency with relatively little overhead.

3. **More structured onboarding when team membership changes**  
   A short orientation or overview of roles and priorities for new members could help integrate them more smoothly into the workflow.

4. **More proactive use of follow-up mechanisms**  
   Earlier reminders or gentle check-ins when tasks appear quiet could prevent uncertainty from persisting.

These refinements would help strengthen communication in an asynchronous workflow while still respecting differing schedules and workloads.

---

## Conclusion

Reflecting on our process, we found that our emphasis on quality assurance was a major strength and contributed significantly to the technical stability and coherence of the project. In contrast, our asynchronous, role-based workflow proved less effective than intended, not because of interpersonal issues or project difficulty, but because it relied on communication patterns that were challenging to maintain consistently. By incorporating lightweight check-ins, clearer expectations for task updates, and more structured onboarding and follow-up, future projects could benefit from greater visibility and coordination while retaining the flexibility that asynchronous work offers.
