# Multi-Agent AI Development Workflow — Complete Framework Specification

## Objective

Design and implement a **multi-agent AI framework** where specialized autonomous agents collaborate to manage the entire software development lifecycle — from initial ideation through deployment, maintenance, and long-term evolution. The system must handle two distinct entry points: a **structured requirements document** for planned projects, or a **simple unstructured user prompt** that the agents will decompose and formalize before execution.

**Critical context:** This framework is being applied to an **existing, actively-developed project** — not a greenfield build. The agents must:
- Analyze and understand the current codebase, architecture, and conventions before making changes
- Respect existing patterns, technical debt, and design decisions
- Build incrementally on top of what exists rather than proposing rewrites
- Treat the existing codebase as the source of truth for conventions and style

---

## Autopilot Mode — The Core UX Philosophy

> **The user should feel like a pilot engaging autopilot: set the destination, observe the instruments, and intervene only when desired.**

### What Autopilot Mode Means

The system operates as a **fully autonomous coding IDE** where:
- The user provides intent (a prompt, a spec, or a goal)
- The system takes over execution — planning, coding, testing, reviewing, committing
- The user observes progress in real-time through a live dashboard
- The user can intervene at any moment with follow-up directives
- The system acknowledges directives, adjusts course, and continues

### Autopilot Levels

The user can select how much autonomy the system has:

| Level | Name | Description | User Role |
|---|---|---|---|
| **AP-0** | Manual | Agents propose, user approves every step | Active pilot |
| **AP-1** | Assisted | Agents execute routine tasks, user approves critical ones | Monitoring pilot |
| **AP-2** | Supervised | Agents execute autonomously, user observes and can intervene | Supervisor |
| **AP-3** | Full Autopilot | Agents execute end-to-end, user only sees final report | Passenger |

**Default level:** AP-2 (Supervised) — the sweet spot between autonomy and control.

**Switching levels:** The user can change autopilot level at any time:
- `!autopilot 0` — switch to Manual
- `!autopilot 1` — switch to Assisted
- `!autopilot 2` — switch to Supervised
- `!autopilot 3` — switch to Full Autopilot

---

## Live Progress Observation

> **The user must always know what the system is doing, why, and what comes next.**

### Real-Time Dashboard

The system maintains a **live progress dashboard** that is continuously updated and visible to the user. It contains:

```
╔══════════════════════════════════════════════════════════════════╗
║                    AUTOPILOT DASHBOARD                           ║
╠══════════════════════════════════════════════════════════════════╣
║ MODE: AP-2 (Supervised)          PROJECT: Uber-Clone            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  CURRENT TASK                                                    ║
║  ┌────────────────────────────────────────────────────────────┐  ║
║  │ TASK-47: Implement ride tracking API endpoint              │  ║
║  │ Agent: Backend Agent                                       │  ║
║  │ Status: IN_PROGRESS (writing handler code)                 │  ║
║  │ Elapsed: 2m 34s                                            │  ║
║  └────────────────────────────────────────────────────────────┘  ║
║                                                                  ║
║  PROGRESS                                                        ║
║  ████████████████░░░░░░░░░░  64%  (16/25 requirements verified)  ║
║                                                                  ║
║  MILESTONE: M2-Ride-Tracking                                     ║
║  ████████████████████░░░░░  80%  (4/5 phases complete)           ║
║                                                                  ║
║  ACTIVE AGENTS                                                   ║
║  ● Backend Agent      — TASK-47 (writing code)                   ║
║  ● Database Agent     — TASK-48 (queued, waiting for TASK-47)    ║
║  ● Testing Agent      — idle (next: verify TASK-47)              ║
║  ○ Frontend Agent     — idle                                     ║
║  ○ Security Agent     — idle                                     ║
║                                                                  ║
║  RECENT EVENTS                                                   ║
║  ✓ 14:32  TASK-46 completed by Backend Agent                     ║
║  ✓ 14:32  TASK-46 passed quality gate                            ║
║  ✓ 14:33  TASK-46 verified by Progress Tracker                   ║
║  → 14:33  TASK-47 started by Backend Agent                       ║
║  ⚠ 14:34  WARNING: unused import in ride_handler.go (auto-fixed) ║
║                                                                  ║
║  BLOCKERS: None                                                  ║
║  OPEN DECISIONS: None                                            ║
║                                                                  ║
║  NEXT IN QUEUE                                                   ║
║  1. TASK-48: Add ride tracking DB migration (Database Agent)     ║
║  2. TASK-49: Write ride tracking tests (Testing Agent)           ║
║  3. TASK-50: Add ride tracking UI component (Frontend Agent)     ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  !pause  !resume  !skip  !override  !detail  !autopilot [0-3]   ║
╚══════════════════════════════════════════════════════════════════╝
```

### Dashboard Components

| Component | Description | Update Frequency |
|---|---|---|
| **Current Task** | What the active agent is doing right now | Real-time (every action) |
| **Progress Bar** | Overall requirements completion percentage | After each task completion |
| **Milestone Progress** | Current milestone phase completion | After each phase completion |
| **Active Agents** | Which agents are working, idle, or queued | Real-time |
| **Recent Events** | Chronological log of agent actions and decisions | Real-time |
| **Blockers** | Any active blockers preventing progress | When status changes |
| **Open Decisions** | Decisions awaiting user input | When new decision arises |
| **Next in Queue** | Upcoming tasks and assigned agents | After each task assignment |

### Dashboard Commands

The user can interact with the dashboard at any time:

| Command | Action |
|---|---|
| `!status` | Show current dashboard snapshot |
| `!detail` | Expand current task with verbose output |
| `!agents` | Show detailed agent status and what each is doing |
| `!rtm` | Show the Requirements Traceability Matrix |
| `!log [n]` | Show last N events (default: 20) |
| `!blockers` | Show all blockers with details |
| `!decisions` | Show all pending decisions requiring input |
| `!history` | Show full session history summary |
| `!milestone` | Show current milestone breakdown and progress |
| `!context` | Show what context agents are currently working with |

### Progress Notifications

The system pushes notifications to the user for key events:

| Event | Notification Type | Example |
|---|---|---|
| Task completed | Info | `✓ TASK-46: Ride pricing calculation completed` |
| Requirement verified | Success | `✅ REQ-12: "Display ride fare estimate" — VERIFIED` |
| Quality gate passed | Info | `✓ TASK-46 passed all quality checks` |
| Quality gate failed | Warning | `⚠ TASK-46 failed: test coverage below 80%` |
| Blocker detected | Alert | `🚫 BLOCKED: TASK-49 — database migration pending` |
| Decision needed | Prompt | `❓ DECISION: Choose caching strategy for ride locations` |
| Milestone completed | Success | `🏁 MILESTONE M2 completed — 5/5 phases done` |
| Agent error | Error | `❌ Backend Agent failed on TASK-47 — routing to Debug Agent` |
| Retry attempt | Warning | `↻ Retry 2/3 for TASK-47 after fix by Debug Agent` |
| Autopilot intervention needed | Alert | `🔔 Human intervention required — approval needed for DB schema change` |

---

## User Follow-Up Directives

> **The user can inject commands and directives at any point during execution — the system must acknowledge, adjust, and continue.**

### Directive Types

#### 1. Steering Directives — Change What the System Is Doing

| Directive | Example | Effect |
|---|---|---|
| `!focus <area>` | `!focus authentication` | Shift agent focus to a specific area/module |
| `!prioritize <task>` | `!prioritize TASK-50` | Move a task to the front of the queue |
| `!deprioritize <task>` | `!deprioritize TASK-48` | Move a task to the back of the queue |
| `!skip <task>` | `!skip TASK-48` | Skip a task entirely (marked DESCOPED in RTM) |
| `!add <requirement>` | `!add "Add rate limiting to API"` | Add a new requirement mid-execution |
| `!remove <requirement>` | `!remove REQ-15` | Remove a requirement from scope |
| `!pause` | `!pause` | Pause all agent activity (checkpoint state) |
| `!resume` | `!resume` | Resume from last checkpoint |
| `!stop` | `!stop` | Stop current task, keep agents idle until new directive |
| `!abort` | `!abort` | Abort current milestone, checkpoint everything |

#### 2. Override Directives — Force a Specific Decision

| Directive | Example | Effect |
|---|---|---|
| `!use <technology>` | `!use Redis for caching` | Override technology choice |
| `!approach <method>` | `!approach use repository pattern` | Override implementation approach |
| `!skip-review` | `!skip-review` | Skip code review for current task (not recommended) |
| `!skip-tests` | `!skip-tests` | Skip test generation for current task (not recommended) |
| `!force-commit` | `!force-commit` | Commit current state even if quality gates fail |
| `!revert <task>` | `!revert TASK-46` | Revert changes from a specific task |
| `!redo <task>` | `!redo TASK-47` | Redo a task from scratch |

#### 3. Information Directives — Ask the System Something

| Directive | Example | Effect |
|---|---|---|
| `!explain <decision>` | `!explain why use gRPC` | Explain a specific agent decision |
| `!why <task>` | `!why TASK-47 failed` | Explain why something failed |
| `!alternatives <task>` | `!alternatives for TASK-47` | Show alternative approaches |
| `!impact <change>` | `!impact of removing Redis` | Show blast radius of a change |
| `!estimate <requirement>` | `!estimate REQ-20` | Estimate effort for a requirement |
| `!diff` | `!diff` | Show all uncommitted changes across agents |
| `!conflicts` | `!conflicts` | Show any conflicting agent outputs |

#### 4. Mode Directives — Change How the System Operates

| Directive | Example | Effect |
|---|---|---|
| `!autopilot <0-3>` | `!autopilot 3` | Change autopilot level |
| `!verbose` | `!verbose` | Enable verbose logging for all agents |
| `!quiet` | `!quiet` | Reduce notifications to critical only |
| `!parallel <on/off>` | `!parallel on` | Enable/disable parallel agent execution |
| `!speed <fast/safe>` | `!speed fast` | Optimize for speed (less validation) or safety (more checks) |
| `!checkpoint` | `!checkpoint` | Force an immediate state checkpoint |
| `!snapshot` | `!snapshot` | Save current state as a named snapshot for rollback |

### Directive Processing Flow

When the user issues a directive mid-execution:

```
User issues directive (e.g., "!focus authentication")
    │
    ▼
┌─────────────────────────┐
│  Directive Parser        │
│  (validates syntax)      │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Orchestrator            │
│  (interprets intent,     │
│   assesses impact)       │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Impact Assessment       │
│  - What tasks are affected?│
│  - What agents need to   │
│    adjust?               │
│  - Any conflicts with    │
│    current work?         │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Acknowledgment          │
│  "Directive received.    │
│   Shifting focus to      │
│   authentication.        │
│   TASK-47 will complete  │
│   first, then redirect.  │
│   3 tasks affected."     │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Execution Adjustment    │
│  - Reprioritize task queue│
│  - Notify affected agents │
│  - Update RTM if needed  │
│  - Continue execution    │
└─────────────────────────┘
```

### Directive Rules

1. **Acknowledgment is mandatory** — the system MUST acknowledge every directive within 5 seconds
2. **Impact assessment** — the system must report what will change before making the change
3. **Non-destructive by default** — directives don't discard completed work unless explicitly requested
4. **Queue-aware** — directives consider what's in progress and may wait for the current task to complete
5. **Auditable** — every directive is logged with timestamp, user intent, and system response
6. **Reversible** — most directives can be undone with `!undo` (except destructive ones like `!abort`)

---

## Existing Project Onboarding

Before any agent can begin work, the system must perform a **project intake scan**:

1. **Codebase analysis** — map the directory structure, identify languages/frameworks, detect build tools, and catalog entry points
2. **Architecture inventory** — identify existing patterns (e.g., clean architecture, MVC, microservices), data models, and service boundaries
3. **Convention extraction** — derive coding standards, naming conventions, test patterns, and commit message formats from existing code and config files
4. **Dependency audit** — catalog all dependencies, their versions, and any known constraints
5. **Technology stack detection** — identify all technologies in use (languages, frameworks, databases, message queues, caching layers, etc.) and register them with the Stack Coordinator Agent
6. **Git history analysis** — review recent commit history to understand active areas, contributor patterns, and recent decisions
7. **Infrastructure scan** — detect deployment configs (Docker, K8s, cloud services), CI/CD pipelines, and environment configurations
8. **Knowledge base initialization** — document all findings as the baseline state in the Knowledge Base

This scan produces an **Existing Project Context Document** that all agents must reference before taking action.

---

## Entry Point Flexibility

### Mode A: Structured Input
The user provides a formal specs/requirements document (PRD, technical spec, user stories). The orchestrator parses and validates it against the **existing project context**, identifies gaps, then proceeds to task decomposition.

### Mode B: Unstructured Input
The user provides a casual, free-form prompt (e.g., "add ride tracking and fix the payment bug"). The system must:
1. **Interpret** the raw prompt and extract implicit requirements
2. **Cross-reference** against the existing project context to understand what already exists
3. **Formalize** it into a structured requirements document with clear labeling:
   - **NEW** — requirements that introduce new functionality
   - **MODIFY** — requirements that change existing functionality
   - **FIX** — requirements that address bugs or defects
   - **REFACTOR** — requirements that improve existing code without changing behavior
4. **Present** the structured interpretation back to the user for confirmation
5. **Proceed** with the multi-agent workflow only after user approval

### Mode C: Continuous Prompt Stream *(Autopilot Enhancement)*
The user provides an initial prompt, the system begins execution, and the user **continues to provide follow-up directives in real-time** as the work progresses. This is the natural mode for autopilot — the user steers while the system flies.

---

## GitHub Integration

Configuration is loaded from the `.env` file in the project root directory.

| Property | Source |
|---|---|
| **GitHub Username** | `GITHUB_USER` from `.env` |
| **GitHub Email** | `GITHUB_EMAIL` from `.env` |
| **Authentication** | `GITHUB_TOKEN` from `.env` |
| **Git Config** | Auto-configures `git config user.name` and `git config user.email` on initialization |

**Security Note:** The GitHub token must NEVER be logged, committed, or exposed in agent outputs. The agent reads it from environment variables at runtime only.

---

## Agent Architecture

### Hierarchy Overview

```
                        ┌─────────────────────┐
                        │   USER (Human)       │
                        │   [Autopilot: AP-2]  │
                        │   Observes + Directs │
                        └──────────┬──────────┘
                                   │
                                   │ Directives (!commands)
                                   │ Live Dashboard Feed
                                   ▼
                        ┌─────────────────────┐
                        │  Tier 0: Intake      │
                        │  Agent               │
                        └──────────┬──────────┘
                                   │
                        ┌──────────▼──────────┐
                        │  Tier 1: Main        │
                        │  Orchestrator        │◄──── Central Brain
                        └──┬───┬───┬───┬──┬───┘
                           │   │   │   │  │
              ┌────────────┘   │   │   │  └────────────┐
              │         ┌──────┘   │   └──────┐        │
              ▼         ▼          ▼          ▼        ▼
        ┌──────────┐ ┌────────┐ ┌────────┐ ┌───────┐ ┌────────┐
        │Progress  │ │GitHub  │ │Knowledge│ │Quality│ │Session │
        │Tracking  │ │Ops     │ │Base    │ │Gate   │ │Manager │
        │(Tier 1a) │ │(Tier1b)│ │(Tier1c)│ │(Tier1d)│ │(Tier1e)│
        └──────────┘ └────────┘ └────────┘ └───────┘ └────────┘
              │
              │ (manages)
              ▼
        ┌──────────────────────────────────────────────┐
        │              Tier 2: Stack Coordinator        │
        │         (Technology-Specific Agents)          │
        └──┬────────┬────────┬────────┬────────┬───────┘
           │        │        │        │        │
           ▼        ▼        ▼        ▼        ▼
        ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
        │Back- │ │Front │ │Data- │ │Infra │ │API   │
        │end   │ │end   │ │base  │ │& DevOps│ │Layer │
        └──────┘ └──────┘ └──────┘ └──────┘ └──────┘
           │        │        │        │        │
           └────────┴────────┴────────┴────────┘
                          │
                          ▼
        ┌──────────────────────────────────────────────┐
        │              Tier 3: Specialist Agents        │
        │          (Cross-Cutting Concerns)             │
        └──┬────────┬────────┬────────┬────────┬───────┘
           │        │        │        │        │
           ▼        ▼        ▼        ▼        ▼
        ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
        │Test- │ │Debug │ │Code  │ │Secur-│ │Perf- │
        │ing   │ │ging  │ │Review│ │ity   │ │ormance│
        └──────┘ └──────┘ └──────┘ └──────┘ └──────┘
```

---

### TIER 0 — Requirements Intake Agent *(Entry Point)*

- **Role:** Universal front door — accepts either structured docs or raw prompts
- **Existing project awareness:** Cross-references input against the current codebase to identify what exists, what's new, and what needs modification
- **Structured mode:** Validates completeness against existing architecture, identifies gaps, flags ambiguities
- **Unstructured mode:** Parses casual language, infers requirements, maps them to existing components
- **Complexity assessment:** Classifies the request as Simple / Moderate / Complex / Epic — this determines whether to invoke the Long-Lifecycle Manager
- **Output:** A confirmed, structured requirements document with clear NEW/MODIFY/FIX/REFACTOR labeling
- **Human gate:** Always presents interpretation for user approval before downstream handoff

---

### TIER 1 — Main Orchestrator Agent *(Central Coordinator — All Other Agents Report Here)*

The Orchestrator is the **single source of truth for task management**. All Tier 1 agents are subordinate to it and report back to it.

**Core responsibilities:**
- Receives the confirmed requirements document from Tier 0
- Decomposes requirements into discrete, actionable tasks with:
  - Unique task ID
  - Clear acceptance criteria
  - Dependency mapping (what blocks what)
  - Complexity estimate (simple / moderate / complex)
  - Target files/components in the existing codebase
  - Assigned agent(s)
  - Milestone/phase association (for long-lifecycle projects)
- Manages **task dependencies** — determines what can run in parallel vs. sequentially
- Assigns tasks to the appropriate specialist agents via the Stack Coordinator
- Aggregates results, resolves conflicts, and makes go/no-go escalation decisions
- Routes blockers to the correct specialist agent for resolution
- **Processes user directives** — receives `!commands` from the user, assesses impact, acknowledges, and adjusts execution
- **Feeds the live dashboard** — pushes real-time status updates to the user's observation panel
- Triggers the GitHub Agent when code is ready for version control
- Triggers the Knowledge Base Agent to update after each completed milestone
- **Delegates to the Progress Tracking Agent** for closed-loop verification — does NOT consider a requirement "done" until the Progress Tracking Agent confirms it meets acceptance criteria
- **Delegates to the Session Manager** for state persistence and resumption

**Delegation model — the Orchestrator owns all agents:**
```
Orchestrator
  ├── delegates verification tasks → Progress Tracking Agent
  ├── delegates git/github tasks   → GitHub Operations Agent
  ├── delegates documentation      → Knowledge Base Agent
  ├── delegates quality checks     → Quality Gate Agent
  ├── delegates session persistence→ Session Manager Agent
  ├── delegates stack-specific work→ Stack Coordinator Agent
  │     └── delegates to specific technology agents
  └── delegates cross-cutting work → Tier 3 Specialist Agents
```

**Directive handling responsibility:**
When the user issues a `!command`, the Orchestrator:
1. Receives the directive from the directive parser
2. Assesses impact on current tasks and agent assignments
3. Acknowledges the directive with a summary of what will change
4. Adjusts task queue, agent assignments, and priorities
5. Logs the directive and its effects
6. Continues execution with the new parameters

---

### TIER 1a — Progress Tracking Agent *(Closed-Loop Verification — Reports to Orchestrator)*

- **Reports to:** Main Orchestrator Agent
- **Role:** Continuously monitors implementation progress against the **original requirements and specifications** until ALL objectives are met
- **Does NOT declare work complete** — only reports status back to the Orchestrator, which makes the final decision

#### Requirements Traceability Matrix (RTM)
- Parses the confirmed requirements document from the Intake Agent
- Creates and maintains a **Requirements Traceability Matrix** with:
  - Unique requirement ID
  - Description
  - Acceptance criteria
  - Current status: `NOT_STARTED` | `IN_PROGRESS` | `IMPLEMENTED` | `VERIFIED` | `FAILED` | `BLOCKED` | `DESCOPED`
  - Linked task IDs (which agent tasks address it)
  - Linked artifacts (code files, tests, PRs)
  - Verification evidence (test results, screenshots, logs)
  - Verification timestamp
  - Number of retry attempts (if failed and re-attempted)

#### Closed-Loop Verification Cycle

```
┌─────────────────────────────────────────────────────┐
│                  CLOSED-LOOP CYCLE                   │
│                                                      │
│  ┌──────────┐    ┌──────────────┐    ┌───────────┐  │
│  │ Check    │───▶│ Compare      │───▶│ Report    │  │
│  │ Artifacts│    │ Against RTM  │    │ to Orch.  │  │
│  └──────────┘    └──────────────┘    └─────┬─────┘  │
│       ▲                                     │        │
│       │          ┌──────────────┐           │        │
│       └──────────│ Orchestrator │◀──────────┘        │
│                  │ Re-routes    │                    │
│                  └──────────────┘                    │
│                                                      │
│  Loop continues until ALL requirements = VERIFIED    │
└─────────────────────────────────────────────────────┘
```

1. **Check** — review artifacts produced by specialist agents (code, tests, docs)
2. **Compare** — measure artifacts against each requirement's acceptance criteria
3. **Report** — update the RTM status and return a delta report to the Orchestrator
4. **Orchestrator decides:**
   - `VERIFIED` → move to next requirement
   - `FAILED` → route to Debugging Agent with failure context
   - `BLOCKED` → escalate to user with explanation
   - `NOT_STARTED` / `IN_PROGRESS` → schedule/retry
5. **Repeat** until every requirement reaches `VERIFIED`

#### Completion Gate (Orchestrator-Enforced)
The Orchestrator **CANNOT** declare the work complete until the Progress Tracking Agent reports:
- Every requirement in the RTM has status `VERIFIED`
- All tests pass
- No open blockers remain
- The user has been presented with a final completion report and has confirmed

#### Completion Report
When all requirements are `VERIFIED`, the Progress Agent generates for the Orchestrator:
- A **Requirements Coverage Report** — delivered vs. requested
- A **Gap Analysis** — descoped, deferred, or partially implemented items
- A **Lessons Learned** summary → fed to Knowledge Base

---

### TIER 1b — GitHub Operations Agent *(Reports to Orchestrator)*

- **Reports to:** Main Orchestrator Agent
- Manages all Git/GitHub lifecycle:
  - Branch creation with naming conventions (e.g., `feature/TASK-123-ride-tracking`)
  - Atomic commits with structured messages referencing task IDs
  - Pull request creation with auto-generated descriptions linking to requirements
  - Issue creation and status management
  - Tag creation for releases/milestones
- Monitors CI/CD pipelines and reports build/test status back to the orchestrator
- Handles merge conflicts and rebasing when multiple agents produce parallel work
- **Existing project handling:** Creates feature branches from the current main/default branch, never force-pushes or rewrites history
- **Credential management:** Reads `GITHUB_TOKEN` from `.env`, configures git identity per session
- **Long-lifecycle support:** Manages release branches, hotfix branches, and milestone tags

---

### TIER 1c — Knowledge Base & Documentation Agent *(Reports to Orchestrator)*

- **Reports to:** Main Orchestrator Agent
- Maintains a **version-controlled wiki** documenting:
  - Architectural decisions (ADRs)
  - Implementation patterns and conventions
  - API contracts and data models
  - Existing project baseline (from the onboarding scan)
  - Technology stack inventory
  - Onboarding guides for future contributors
- **Documents progress** as a living record:
  - What was planned vs. what was delivered
  - Decision log — why choices were made
  - Blocker history — what was blocked and how it was resolved
  - Phase/milestone summaries for long-lifecycle projects
- **Documents user directives** — every `!command` and its effect is logged for future reference
- Generates structured progress reports after each milestone
- Syncs the knowledge base with actual codebase state (prevents stale documentation)
- **Distinction from Progress Tracking Agent:** This agent *documents* progress; the Progress Tracking Agent *enforces* it through closed-loop verification

---

### TIER 1d — Quality Gate Agent *(Reports to Orchestrator)*

- **Reports to:** Main Orchestrator Agent
- **Role:** Enforces quality thresholds before any code is considered complete
- Runs and enforces:
  - **Linting** — project-configured linters must pass with zero errors
  - **Type checking** — no type errors (TypeScript strict mode, mypy, etc.)
  - **Code complexity** — cyclomatic complexity within project thresholds
  - **Code duplication** — no significant duplicated blocks
  - **Dependency health** — no known vulnerabilities, no deprecated packages
  - **Test coverage** — minimum coverage threshold met (configurable per project)
  - **Build verification** — project builds successfully with no warnings (or only documented/accepted warnings)
- **Quality report** is attached to every task completion before the Progress Tracking Agent verifies
- **Configurable thresholds** — stored in project configuration, not hardcoded
- **Existing project baseline:** On first run, establishes the current quality baseline — improvements are encouraged but the baseline must not regress
- **Directive-aware:** Respects `!skip-review`, `!skip-tests`, `!force-commit` directives but logs warnings when quality is bypassed

---

### TIER 1e — Session Manager Agent *(Reports to Orchestrator)*

- **Reports to:** Main Orchestrator Agent
- **Role:** Manages state persistence for long-lifecycle projects that span multiple sessions, context windows, and potentially days/weeks of work

**Why this agent is essential:** Complex projects cannot be completed in a single session. Context windows have limits. Users need to stop and resume. The Session Manager ensures no work is lost and no context is forgotten.

**Responsibilities:**
- **State checkpointing** — after every completed task or milestone, serializes the current project state:
  - Current phase/milestone progress
  - Active task assignments and their statuses
  - Open blockers and pending decisions
  - Agent memory and context summaries
  - RTM snapshot from the Progress Tracking Agent
  - Autopilot level and user preferences
  - Recent directive history
- **Session resumption** — when work resumes after interruption:
  - Loads the latest checkpoint
  - Validates that the codebase state matches the checkpoint (detects manual changes)
  - Presents a "where we left off" summary to the user
  - Restores agent context so work continues seamlessly
  - Restores the autopilot dashboard to its last state
- **Context window management** — for large projects where full context exceeds limits:
  - Maintains layered context: critical (always loaded) → important (loaded on demand) → historical (available but not loaded)
  - Summarizes completed work into compact references so agents don't need to re-read everything
  - Prunes resolved blockers and completed task details from active context
- **Milestone archival** — when a milestone is completed:
  - Archives all artifacts, decisions, and lessons learned
  - Creates a clean context slate for the next milestone
  - Preserves the archive for future reference if needed
- **Directive-triggered checkpointing** — the `!checkpoint` and `!snapshot` directives trigger immediate state saves

---

### TIER 2 — Stack Coordinator Agent *(Technology-Specific Delegation — Reports to Orchestrator)*

- **Reports to:** Main Orchestrator Agent
- **Role:** Routes technology-specific tasks to the correct stack agent based on what the project uses
- **Auto-detected from onboarding scan** — the Stack Coordinator reads the Existing Project Context Document to determine which stack agents to activate
- Manages **cross-stack coordination** when a task touches multiple technologies (e.g., "add an API endpoint that modifies the database schema and updates the frontend")
- Resolves **conflicts between stack agents** (e.g., backend agent proposes a schema change that breaks the API contract the frontend agent expects)

**Stack Agents (activated based on project needs):**

#### 2a. Backend Agent
- **Scope:** Server-side logic, business rules, service layer, middleware, background jobs
- **Activated when:** Project uses Go, Python, Java, Node.js, Rust, C#, or any server-side language
- **Responsibilities:**
  - Implements business logic following existing project patterns
  - Writes service/handler/repository code in the project's established architecture
  - Manages backend dependencies and their versions
  - Ensures backward compatibility with existing API consumers
  - Produces backend-specific tests (unit, integration)

#### 2b. Frontend Agent
- **Scope:** UI components, state management, routing, styling, client-side logic
- **Activated when:** Project uses React, Vue, Angular, Svelte, Next.js, or any frontend framework
- **Responsibilities:**
  - Implements UI components following existing design patterns and component library
  - Manages frontend state (Redux, Zustand, Context, Pinia, etc.) consistent with existing approach
  - Handles responsive design and cross-browser compatibility
  - Follows existing CSS/styling approach (Tailwind, CSS Modules, Styled Components, etc.)
  - Produces frontend-specific tests (component tests, visual regression)

#### 2c. Database Agent
- **Scope:** Schema design, migrations, queries, indexing, data integrity
- **Activated when:** Project uses PostgreSQL, MySQL, MongoDB, Redis, or any data store
- **Responsibilities:**
  - Designs and modifies database schemas following existing conventions
  - Writes and manages migrations (up AND down) that are safe for production
  - Optimizes queries and recommends indexing strategies
  - Ensures data integrity constraints (foreign keys, unique constraints, check constraints)
  - Handles seed data and test fixtures
  - Validates migration safety (no data loss, backward compatible when possible)
  - Coordinates with Backend Agent on ORM/query layer changes

#### 2d. Infrastructure & DevOps Agent
- **Scope:** Deployment, CI/CD, containerization, cloud services, monitoring
- **Activated when:** Project uses Docker, Kubernetes, Terraform, GitHub Actions, or any infrastructure tooling
- **Responsibilities:**
  - Manages Docker configurations (Dockerfiles, docker-compose)
  - Configures and maintains CI/CD pipelines
  - Handles environment configurations (dev, staging, production)
  - Manages infrastructure-as-code files
  - Monitors deployment health and rollback procedures
  - Ensures secrets and credentials are properly managed (never committed)

#### 2e. API Layer Agent
- **Scope:** API design, contracts, versioning, documentation, gateway configuration
- **Activated when:** Project exposes REST, GraphQL, gRPC, or any API interface
- **Responsibilities:**
  - Designs API endpoints following existing conventions (RESTful patterns, naming, status codes)
  - Maintains API contracts (OpenAPI/Swagger specs, GraphQL schemas, protobuf definitions)
  - Handles API versioning and backward compatibility
  - Generates and updates API documentation
  - Validates request/response schemas
  - Coordinates with Frontend Agent on API consumption patterns
  - Coordinates with Backend Agent on implementation

#### 2f. Messaging & Integration Agent
- **Scope:** Message queues, event systems, webhooks, third-party integrations
- **Activated when:** Project uses RabbitMQ, Kafka, Redis Pub/Sub, webhooks, or external service integrations
- **Responsibilities:**
  - Implements message producers/consumers following existing patterns
  - Designs event schemas and ensures backward compatibility
  - Manages third-party API integrations (payment processors, email services, etc.)
  - Handles retry logic, dead letter queues, and idempotency
  - Validates integration contracts and error handling

---

### TIER 3 — Cross-Cutting Specialist Agents *(Reports to Orchestrator via Stack Coordinator)*

These agents are invoked by the Orchestrator when specific concerns arise. They work across all stack agents.

#### 3a. Testing Agent *(Cross-Cutting)*
- **Role:** Designs and implements the overall test strategy
- **Scope:** Coordinates testing across all stack agents, not just one technology
- **Responsibilities:**
  - Defines test strategy per task (unit, integration, e2e, performance)
  - Ensures all stack agents produce tests following the same conventions
  - Runs existing tests first to establish baseline (must not break them)
  - Generates cross-stack integration tests (e.g., frontend -> API -> backend -> database)
  - Reports coverage metrics with actionable gaps
  - Validates that implementation meets acceptance criteria
  - Manages test data, fixtures, and mocking strategies consistently

#### 3b. Debugging Agent *(Cross-Cutting)*
- **Role:** Investigates failures across any layer of the stack
- **Responsibilities:**
  - Investigates failures from Testing Agent, CI/CD pipeline, or runtime errors
  - Performs **root cause analysis** across the full stack (not just symptom fixes)
  - **Regression awareness:** Checks if the bug existed before the change or was introduced by it
  - Proposes fixes with explanation of why the failure occurred
  - Validates that fixes resolve the issue **without breaking existing functionality**
  - Feeds lessons learned back to the Knowledge Base Agent

#### 3c. Code Review Agent *(Cross-Cutting)*
- **Role:** Automated code review before code is submitted to the Progress Tracking Agent
- **Responsibilities:**
  - Reviews all code changes for correctness, readability, and maintainability
  - Checks adherence to project conventions and coding standards
  - Identifies potential bugs, race conditions, memory leaks, and logic errors
  - Validates that changes match the task requirements (no scope creep, no missing pieces)
  - Flags security concerns -> routes to Security Agent
  - Flags performance concerns -> routes to Performance Agent
  - Produces a structured review report with severity ratings (critical / warning / suggestion)
  - **Critical findings block progression** — code cannot pass to Progress Tracking Agent until critical findings are resolved

#### 3d. Security Agent *(Cross-Cutting)*
- **Role:** Ensures all changes meet security standards
- **Responsibilities:**
  - Scans for OWASP Top 10 vulnerabilities (injection, XSS, CSRF, etc.)
  - Validates authentication and authorization patterns
  - Checks for hardcoded secrets, credentials, or sensitive data exposure
  - Reviews dependency vulnerabilities (CVE scanning)
  - Validates input sanitization and output encoding
  - Reviews API security (rate limiting, authentication, CORS)
  - For database changes: validates SQL injection prevention, data encryption at rest
  - Produces a security assessment report attached to task completion

#### 3e. Performance Agent *(Cross-Cutting)*
- **Role:** Ensures changes don't degrade performance
- **Responsibilities:**
  - Reviews database query performance (N+1 queries, missing indexes, full table scans)
  - Validates frontend performance (bundle size, lazy loading, rendering efficiency)
  - Checks backend performance (algorithm complexity, memory usage, concurrent access patterns)
  - Reviews API response times against existing baselines
  - Identifies caching opportunities
  - For large-scale changes: recommends load testing before deployment
  - Produces a performance assessment report

---

## Long-Lifecycle Project Support

> **Complex projects cannot be completed in a single session. This section defines how the framework handles projects that span days, weeks, or months.**

### Phase & Milestone Management

The Orchestrator, with input from the Progress Tracking Agent, decomposes large projects into:

```
PROJECT
  └── MILESTONE (major deliverable / feature set)
        └── PHASE (logical grouping of related tasks)
              └── TASK (atomic unit of work assigned to one agent)
                    └── SUBTASK (optional breakdown within a task)
```

**Milestone properties:**
- Unique ID and name
- Description and success criteria
- Dependencies on other milestones
- Target completion (optional, user-defined)
- Status: `PLANNED` | `ACTIVE` | `BLOCKED` | `COMPLETED` | `ARCHIVED`

**Phase properties:**
- Unique ID and name
- Parent milestone
- Task list with dependency ordering
- Status: `NOT_STARTED` | `IN_PROGRESS` | `COMPLETED`
- Completion criteria derived from milestone success criteria

**The Orchestrator manages the progression:**
1. Plan all milestones upfront (high-level)
2. Detail only the current milestone's phases and tasks
3. Re-plan subsequent milestones based on lessons learned from completed ones
4. Never detail-plan too far ahead — plans change as implementation reveals reality

### Session Persistence & Resumption

Handled by the **Session Manager Agent** (Tier 1e):

**Checkpoint triggers:**
- After every completed task
- After every milestone completion
- When the user explicitly requests a pause (`!pause`)
- When the user requests a checkpoint (`!checkpoint`)
- When approaching context window limits
- At configurable intervals (e.g., every 30 minutes of active work)

**Checkpoint contents:**
```json
{
  "checkpoint_id": "cp-20260527-1430",
  "autopilot_level": "AP-2",
  "project_state": {
    "current_milestone": "M2-ride-tracking",
    "current_phase": "phase-3-api-integration",
    "active_tasks": ["TASK-45", "TASK-47"],
    "completed_tasks": ["TASK-40", "TASK-41", "TASK-42", "TASK-43", "TASK-44"],
    "blocked_tasks": []
  },
  "rtm_snapshot": { "..." : "current RTM state" },
  "agent_context": {
    "orchestrator": "summary of decisions and current focus",
    "stack_coordinator": "active stack agents and their current tasks",
    "progress_tracker": "verification status summary"
  },
  "open_decisions": ["decision-12: choose caching strategy"],
  "active_blockers": [],
  "directive_history": ["!focus auth", "!prioritize TASK-45"],
  "codebase_hash": "git SHA or checksum to detect drift",
  "knowledge_base_pointer": "link to current KB state"
}
```

**Resumption sequence:**
1. Session Manager loads the latest checkpoint
2. Validates codebase state matches checkpoint (detects manual changes)
3. If drift detected: presents diff to user and asks how to reconcile
4. Presents "where we left off" summary with dashboard restored
5. Restores autopilot level to last setting
6. Orchestrator resumes from the checkpoint state

### Context Window Management

For projects too large to fit in a single context window:

**Layered context strategy:**
- **Layer 1 — Always loaded:** Current task specs, active blockers, current RTM, project conventions, autopilot state
- **Layer 2 — Loaded on demand:** Completed task summaries, architectural decisions, technology inventory
- **Layer 3 — Available but not loaded:** Historical decisions, archived milestones, resolved blocker details

**Context compression:**
- Completed work is summarized into compact references (not raw code/diffs)
- The Knowledge Base Agent maintains these summaries
- Agents request Layer 2/3 context from the Knowledge Base when needed

### Long-Running Task Handling

For tasks that exceed a single session:
- The Orchestrator breaks them into **resumable sub-tasks**
- Each sub-task is independently verifiable by the Progress Tracking Agent
- Partial progress is checkpointed after each sub-task
- The Session Manager tracks which sub-tasks are complete vs. remaining

### Milestone Transitions

When a milestone is completed:
1. Progress Tracking Agent confirms all milestone requirements are `VERIFIED`
2. Knowledge Base Agent generates a **Milestone Summary** (decisions, lessons, metrics)
3. Session Manager creates a **milestone archive checkpoint**
4. GitHub Operations Agent creates a milestone tag/branch
5. Orchestrator presents the summary to the user for approval
6. User approves -> Orchestrator begins the next milestone with fresh context
7. Archived milestone context is compressed to Layer 3
8. Dashboard updates to reflect the new milestone

---

## Communication Protocol

| Handoff | From -> To | Format |
|---|---|---|
| Project intake complete | Intake -> All Agents | Existing Project Context Document |
| Requirements confirmed | Intake -> Orchestrator | Structured requirements doc with NEW/MODIFY/FIX/REFACTOR labels |
| Task assignment | Orchestrator -> Stack Coordinator -> Stack Agents | Task spec with acceptance criteria, dependencies, target files |
| Cross-cutting concern | Orchestrator -> Tier 3 Agent | Concern type + affected files/tasks |
| Task completion | Stack/Tier 3 Agents -> Orchestrator | Completion report with artifacts + quality report |
| Verification request | Orchestrator -> Progress Tracker | Completed artifacts + linked requirement IDs |
| Verification result | Progress Tracker -> Orchestrator | RTM update — VERIFIED or route back with reason |
| Code ready | Orchestrator -> GitHub Agent | Branch name, files changed, commit message, requirement IDs |
| Quality check | Stack Agent -> Quality Gate -> Orchestrator | Quality report with pass/fail per threshold |
| Code review | Stack Agent -> Code Review -> Orchestrator | Review report with severity ratings |
| Security check | Code Review -> Security Agent -> Orchestrator | Security assessment report |
| Progress documentation | Orchestrator -> Knowledge Base | Delta summary — what changed since last update |
| Session checkpoint | Orchestrator -> Session Manager | Full project state snapshot |
| Blocker escalation | Any Agent -> Orchestrator -> Specialist/User | Blocker report with severity, impact, suggested resolution |
| Milestone transition | Progress Tracker -> Orchestrator -> User | Milestone completion report + approval request |
| CI/CD status | GitHub Agent -> Orchestrator | Pipeline result (pass/fail + logs if failed) |
| Stack conflict | Stack Agents -> Stack Coordinator -> Orchestrator | Conflict description + proposed resolution |
| Completion report | Progress Tracker -> Orchestrator -> User | Final requirements coverage + gap analysis + lessons learned |
| Directive received | User -> Orchestrator | Acknowledged directive + impact assessment |
| Dashboard update | Orchestrator -> User | Real-time status feed |

All inter-agent communication must produce **auditable artifacts** — no silent state changes.

---

## Execution Flow (End-to-End)

```
USER INPUT (structured doc, unstructured prompt, or follow-up directive)
    │
    ▼
┌─────────────────────┐
│  TIER 0: Intake     │ ◄── Existing Project Context
│  Agent              │     (from onboarding scan)
└──────────┬──────────┘
           │ Confirmed Requirements Document
           ▼
┌─────────────────────┐
│  TIER 1: Orchestrator│ ◄── Creates task breakdown
│  (Central Brain)     │     Assigns to agents
│                      │     Processes user directives
│                      │     Feeds live dashboard
└──┬──┬──┬──┬──┬──────┘
   │  │  │  │  │
   │  │  │  │  └──▶ Session Manager (checkpoints state)
   │  │  │  └─────▶ Quality Gate (enforces thresholds)
   │  │  └────────▶ Knowledge Base (documents progress)
   │  └───────────▶ GitHub Ops (version control)
   └──────────────▶ Progress Tracker (closed-loop verification)
        │
        ▼
┌─────────────────────┐
│  TIER 2: Stack       │ ◄── Routes to correct technology
│  Coordinator         │
└──┬──┬──┬──┬──┬──────┘
   │  │  │  │  │
   ▼  ▼  ▼  ▼  ▼
  BE FE DB Infra API  (Stack Agents)
   │  │  │  │   │
   └──┴──┴──┴───┘
        │
        ▼
┌─────────────────────┐
│  TIER 3: Cross-      │ ◄── Quality & safety checks
│  Cutting Agents      │
└──┬──┬──┬──┬──┬──────┘
   │  │  │  │  │
   ▼  ▼  ▼  ▼  ▼
  Test Debug Review Sec Perf
   │  │  │  │  │
   └──┴──┴──┴───┘
        │
        ▼
┌─────────────────────┐
│  BACK TO ORCHESTRATOR│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  PROGRESS TRACKER    │ ◄── Verifies against RTM
│  (Closed Loop)       │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
  ALL PASS    SOME FAIL
     │           │
     ▼           ▼
  COMPLETE    LOOP BACK ──▶ Orchestrator re-routes
  (User       to failed     to appropriate agent
  confirms)   requirements  for retry/fix

    ╔═══════════════════════════════════════╗
    ║  LOOP CONTINUES UNTIL:               ║
    ║  ALL requirements = VERIFIED          ║
    ║  ALL quality gates = PASS             ║
    ║  ALL tests = PASS                     ║
    ║  ALL blockers = RESOLVED              ║
    ║  USER confirms completion             ║
    ╚═══════════════════════════════════════╝
```

---

## Agent Lifecycle Rules

1. **Existing project first** — onboarding scan must complete before any agent begins work
2. **Incremental changes** — extend the existing project, don't rewrite it
3. **Phased agent activation** — not all agents need to be active from day one:
   - **Phase 1:** Orchestrator + Progress Tracker + one Stack Agent + GitHub Agent
   - **Phase 2:** Add remaining Stack Agents + Quality Gate
   - **Phase 3:** Add Tier 3 Specialists (Testing, Debugging, Code Review)
   - **Phase 4:** Add Security + Performance agents
   - **Phase 5:** Full autonomous operation with human-in-the-loop gates only
4. **Human-in-the-loop gates** — critical decisions (architecture, major refactors, production deployments, milestone transitions) require user confirmation
5. **Autonomous operation** — routine tasks (tests, minor features, bug fixes) run without interruption
6. **Closed-loop verification** — nothing is marked complete without Progress Tracker approval via the Orchestrator
7. **Auditability** — every agent action produces a log entry, code diff, or decision record
8. **Fail-safe** — if any agent produces uncertain output, escalate to the user rather than guessing
9. **No regressions** — existing tests must continue passing throughout all changes
10. **Session resilience** — the project can be paused and resumed at any point without losing state
11. **Scalable decomposition** — large projects are broken into milestones -> phases -> tasks -> subtasks to stay manageable
12. **Directive responsiveness** — user `!commands` are acknowledged within 5 seconds and acted upon immediately
13. **Dashboard transparency** — the user always sees what agents are doing and why

---

## Immediate Actions

1. **Perform the existing project onboarding scan** — understand what we're working with
2. **Activate Phase 1 agents** — Orchestrator, Progress Tracker, initial Stack Agent, GitHub Agent
3. **Analyze this architecture** — identify any remaining gaps or workflow bottlenecks
4. **Propose the implementation stack** — what tools/frameworks power these agents? (CrewAI, AutoGen, LangGraph, custom orchestration, etc.)
5. **Build the Orchestrator first** — it's the brain that coordinates everything
6. **Build the Progress Tracking Agent second** — it's the closed-loop guarantee
7. **Generate a phased execution plan** — ordered list of what to build, test, and activate

---

## Context

- **Project:** Existing, actively-developed codebase — NOT a greenfield build
- **GitHub Account:** Credentials loaded from `.env` in project root
- **Input modes:** Structured docs, unstructured prompts, OR continuous directive stream — the system handles all three
- **Core principle:** Closed-loop execution — the work is not done until every requirement is verified against the original specifications
- **UX principle:** Autopilot mode — the user observes, directs, and intervenes only when desired
- **Scale:** Designed for complex, long-lifecycle projects that span multiple sessions and milestones
- **Preference:** Pragmatic, incremental adoption. Working software over perfect architecture. Respect what exists.
