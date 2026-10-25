# Keel

Keel is a React and Vite prototype for coordinating critical infrastructure support. Facilities can report needs, coordinators can review and match support, and specialists can manage their assignments.

The application is a browser-only demonstration using fictional sample data. It is not connected to live facilities, people, infrastructure, or external services.

## Requirements

- Node.js 18 or newer
- npm 9 or newer

## Run locally

Clone or download the repository, then open a terminal in the project directory:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. It is normally:

```text
http://localhost:5173
```

The development server supports hot module replacement. Stop it with `Ctrl+C`.

## Build and preview

Create a production build:

```powershell
npm run build
```

The generated files are written to `dist`.

Preview the production build locally:

```powershell
npm run preview
```

The preview server normally runs at:

```text
http://localhost:4173
```

## Available npm scripts

| Command | Purpose |
|---|---|
| `npm install` | Install project dependencies |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create the production build |
| `npm run preview` | Serve the production build locally |

## Platform overview

Keel models a human-reviewed support lifecycle:

1. A facility reports an operational need.
2. The request records its issue, required expertise, operating status, verification notes, and follow-up details.
3. A coordinator reviews the request and checks its priority and available information.
4. The coordinator matches and approves a qualified, available specialist.
5. The specialist confirms the assignment and begins work.
6. The specialist or facility marks the work complete.
7. The request becomes resolved and the decision remains visible in the activity history.

Keel does not make safety decisions, automatically approve assignments, or create real accounts.

## Features

### Request intake

- Facility operators submit requests through **Ask for help**.
- Required information includes the reporting role, callback details, main issue, requested expertise, and verification notes.
- New requests start as **Awaiting review** with **Pending assessment** priority.
- Facility operators see only their facility's requests.
- Coordinators can review and manage requests, but cannot create new requests.

### Simulated assistant suggestion

The intake form includes a clearly labelled local suggestion tool:

- Paste a short, unstructured incident message.
- Keel uses deterministic text checks to suggest a facility, expertise, operating status, and possible information gaps.
- The suggestion never calls a real model.
- It never saves a request, sets urgency, selects a specialist, or approves an assignment.
- The user must review and explicitly confirm the draft before copying it into the form.

### Coordinator review

Coordinators can:

- Search requests by request ID, facility, or skill.
- Filter by area, urgency, and status.
- Sort by priority or recent update.
- Open the full request record.
- Change urgent/elevated priority with a written rationale.
- Start specialist matching.
- Review qualification, verification, availability, geography, and active-assignment conflicts.
- Approve an eligible specialist.
- Escalate an unresolved request for human review.
- Review facilities, specialists, onboarding submissions, and the append-only activity history.
- Use **Show backup view** to simulate an acting backup representative.

Coordinator actions are recorded in the activity log. Coordinators do not see an **Ask for help** or **Add a request** action.

### Specialist matching and assignments

Matching checks:

- Required qualification.
- Database lookup.
- Employer confirmation.
- Recent check-in.
- Availability.
- Rest requirement.
- Existing active assignments.
- Confirmed service area.

An eligible specialist can be assigned only through coordinator approval. Spare-capacity offers from facilities are accepted only when a coordinator approves the resulting assignment.

### Facility spare capacity

Facility operators can offer a verified and available specialist to other facilities:

1. Select **Offer a specialist**.
2. Choose a verified, available specialist.
3. Explicitly select **I consent**.
4. Submit the offer for coordinator review.

The offer does not move or assign the specialist. It becomes accepted only after a coordinator approves a match, and both the offer and approval are recorded.

### Assignment completion

- A specialist sees only their assignments.
- The specialist can set their duty status to **Available** or **Unavailable**.
- After approval, the specialist confirms the assignment.
- Once the work is finished, the specialist selects **Mark work complete**.
- The facility can also mark an assigned or monitored request complete from **My requests**.
- Completion changes the request to **Resolved**, removes it from the facility's open queue, and records a history event.

### Onboarding and verification

- Specialists can submit a local onboarding record.
- Facility operators can submit a facility registration.
- Coordinators review pending submissions under **People to review**.
- A coordinator can approve or reject a submission.
- These records are local prototype data and are not connected to an identity provider or verification service.

### Guided views and responsive interface

- The public home page explains the platform and available personas.
- Each persona has role-specific navigation and a guide.
- The interface includes responsive layouts for smaller screens.
- The visual system uses a warm off-white background, deep teal/lavender primary actions, and muted red, amber, green, and blue status accents.

## How to operate Keel by persona

### Coordinator

1. Open the portal and choose **Coordinator**.
2. Review **Home** for open requests, attention items, specialist capacity, warnings, and recent activity.
3. Open **Requests** to search, filter, sort, and prioritize cases.
4. Select a request to inspect its facility, operating context, verification, dependencies, and next action.
5. Choose **Find expert** to review matching candidates.
6. Approve an eligible specialist after reviewing the qualification and conflict checks.
7. Use **Escalate** when a qualified match cannot be made.
8. Use **All requests**, **Specialists**, **Facilities**, and **People to review** for broader coordination work.
9. Open **History** to review decisions and lifecycle events.
10. Use **Reset workspace** when replaying the seeded walkthrough.

The coordinator reviews and approves requests; request creation is intentionally outside this persona's scope.

### Facility operator

1. Open the portal and choose **Facility operator**.
2. Enter the local facility account. The prototype defaults to Dev Malhotra at Narmada Water Works.
3. Review **Home** for facility status, constraints, open requests, and request progress.
4. Choose **Ask for help**.
5. Enter the issue, requested expertise, operating status, contact details, verification notes, and follow-up information.
6. Optionally use **Suggested draft**, review its gaps, and confirm the draft before editing and submitting.
7. Follow request status and the coordinator's next action from **My requests**.
8. Use **Offer spare capacity** if a verified and available specialist can support another facility.
9. After work is performed, use **Mark work complete** on an assigned or monitored request.
10. Use **Register facility** to submit a local onboarding record.

### Specialist

1. Open the portal and choose **Specialist**.
2. Enter the local specialist account. The prototype defaults to Isha Bhandari.
3. Review **My assignments** and the duty status shown at the top of the page.
4. Set **Available** only when able to accept work, or **Unavailable** when not accepting work.
5. Read each proposed assignment, including the facility, priority, and required skill.
6. Choose **Confirm assignment** when the assignment can be accepted.
7. Choose **Mark work complete** after the work is finished.
8. Use **Specialist onboarding** to submit a local registration record.

An eligible match does not mean the work is safe. Safety decisions remain with the people responsible for the facility.

## Seeded walkthrough

The initial data includes a review, approval, escalation, and completion scenario.

1. Choose **Coordinator**.
2. Open **Requests** and select the urgent **Maharashtra Grid Station** case.
3. Select **Find expert**:
   - Isha Bhandari is eligible.
   - Kiran Desai is unverified.
   - Tanmay Rao requires rest.
4. Approve Isha Bhandari. The case becomes assigned.
5. Select **Show backup view** to see the persisted assignment as Rohan Iyer.
6. Open the urgent **Narmada Water Works** case.
7. Use the human escalation action when no eligible specialist remains.
8. Open **History** to review the approval and escalation events.
9. To test completion, enter the Specialist view, confirm Isha's assignment, and select **Mark work complete**.
10. Return to the coordinator or facility view to see the request as resolved.

Use **Reset workspace** in the sidebar to restore the original scenario.

## Local data and reset behavior

Keel stores prototype changes in the browser's local storage:

- `keel-workspace`: facilities, requests, specialists, assignments, offers, and events.
- `keel-onboarding`: local specialist and facility onboarding submissions.

No data is sent to a backend. Clearing browser storage removes local changes. The in-app **Reset workspace** action restores the seeded records and clears onboarding submissions.

The account screens are simulated. They do not create real accounts, authenticate users, or connect to an identity system.

## Project structure

```text
.
├── index.html             # HTML entry document
├── package.json           # Scripts and dependencies
├── package-lock.json      # Locked dependency versions
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # Shared TypeScript configuration
├── tsconfig.app.json      # Application TypeScript configuration
├── tsconfig.node.json     # Vite/config TypeScript configuration
├── src/
│   ├── main.tsx           # React application, seed data, roles, screens, workflows
│   └── styles.css         # Layout, responsive styles, and visual design tokens
└── dist/                  # Generated production output
```

## Limitations and safety boundaries

This is a demonstration prototype, not an operational coordination system:

- Records are fictional.
- There is no backend, database, real authentication, or authorization service.
- There is no live facility telemetry, sensor feed, external database, or model API.
- The assistant suggestion is deterministic local text matching.
- Notifications, messaging, scheduling, audit immutability, and real verification integrations are not implemented.
- Local storage is not suitable for sensitive or production records.
- Availability and matching indicators do not determine whether work is safe.
- Facility teams remain responsible for on-site safety decisions.

## License and status

Keel is an internal prototype for demonstrating coordination workflows. No production license or deployment claim is provided by this repository.
