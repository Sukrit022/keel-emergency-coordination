# Keel

Keel is a small React and Vite prototype for coordinating critical infrastructure requests, facilities, specialists, and coordinator review.

## Requirements

- Node.js 18 or newer
- npm 9 or newer

## Run on your computer

1. Install Node.js from [nodejs.org](https://nodejs.org/).
2. Open PowerShell or a terminal.
3. Move into the project folder:

   ```powershell
   cd E:\FK
   ```

4. Install the project packages:

   ```powershell
   npm install
   ```

5. Start the local development server:

   ```powershell
   npm run dev
   ```

6. Open the local address shown in the terminal. It is usually:

   [http://localhost:5173](http://localhost:5173)

## Build for a production check

Run:

```powershell
npm run build
```

The compiled files are written to the `dist` folder.

To preview the production build locally:

```powershell
npm run preview
```

## Using the prototype

When Keel opens, the public home page explains the service and the three available roles. Select **Choose your role** or **Open portal**, then choose:

- Coordinator: reviews requests, facilities, specialists, and registrations.
- Facility operator: sees the Narmada Water Works facility and its requests.
- Specialist: sees only Isha Bhandari's assignments.

Use **Log out** in the top bar to return to the public home page. Choose **Open portal** to select a different role. The selected role cannot be changed from inside a dashboard.

The workspace is fictional and runs in the browser. Changes are stored in local browser storage under:

- `keel-workspace`
- `keel-onboarding`

The New Request form includes a clearly labelled simulated assistant suggestion. It uses simple local text checks only, never calls a real model, never saves automatically, and never sets urgency, selects specialists, or approves assignments. All suggestions must be reviewed and confirmed by the user before they are copied into the form.

Facility operators can also use **Offer spare capacity** to offer a verified, available specialist to other facilities. The home facility must explicitly select **I consent** before the offer is visible to coordinators. An offer is only accepted when a coordinator approves an assignment, and both actions are recorded in the activity history.

After an assignment is approved, the specialist confirms the assignment and later uses **Mark work complete** when the work is finished. The facility can use the same action from **My requests**. Either action resolves the shared request, removes it from the facility's open queue, and records the completion in the coordinator's History view. No assignment is completed automatically.

## Profile walkthrough

To replay the seeded approval and escalation scenario:

1. Choose **Coordinator** and open **Requests**.
2. Open the urgent **Maharashtra Grid Station** case.
3. Select **Find expert**. The matching review shows:
   - **Isha Bhandari** as eligible
   - **Kiran Desai** as unverified
   - **Tanmay Rao** as resting
4. As Asha Verma, approve Isha Bhandari. The case becomes assigned.
5. Use **Show backup view** to see the same persisted assignment as Rohan Iyer, acting backup.
6. Open the urgent **Narmada Water Works** case. After Isha Bhandari is assigned, no eligible specialist remains because Kiran Desai is unverified and Tanmay Rao is resting. Use the human escalation action.
7. Open **History** to review the approval and escalation events.
8. Use **Reset workspace** to restore the original walkthrough records.

To test the completion lifecycle, enter the specialist view after approving Isha, confirm the assignment, then mark the work complete. The same request will show as **Resolved** for the coordinator and will be removed from the facility's open requests.

The records are fictional and local to the browser. Reset is useful when replaying the walkthrough after changing an assignment.

Use **Reset workspace** in the sidebar to restore the starting records.

## Project structure

- `src/main.tsx`: application screens, sample records, role access, and workflows
- `src/styles.css`: application styling and responsive layout
- `index.html`: Vite entry document
- `package.json`: scripts and dependencies

## Notes

This is a prototype for demonstrating coordination workflows. It is not connected to live facilities, real people, or operational infrastructure.
