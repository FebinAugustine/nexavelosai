# Project State Reference (as of 31 January 2026)

## **1. Initial Request & Goal**
*   Implement a queue mechanism for handling AI agent requests and responses.
*   Target thousands of concurrent users.
*   Act as an expert Next.js and NestJS developer.
*   Don't break existing functionalities.
*   No new features beyond the queue.
*   Follow industry standards.

## **2. Architectural Choices**
*   **Backend (NestJS):** BullMQ with Redis for the queue. WebSockets (Socket.io) for real-time asynchronous responses to the frontend.
*   **Frontend (Next.js):** Axios for initial request to backend, `socket.io-client` for listening to real-time agent responses.

## **3. Backend Changes Implemented**

### **3.1. Agent Queue Module (`backend/src/agent-queue`)**
*   **`backend/src/agent-queue/agent-queue.module.ts`**:
    *   Configures `BullModule` to connect to Redis (host/port from `.env`).
    *   Registers `agent-requests` queue.
    *   Imports `EventsModule` and `AgentsModule` (using `forwardRef` to resolve circular dependency).
    *   Added `Logger` and a log message within `BullModule.forRootAsync` to show Redis connection details.
*   **`backend/src/agent-queue/agent-queue.service.ts`**: Provides `addAgentRequest` method to add jobs to the queue.
*   **`backend/src/agent-queue/agent-queue.processor.ts`**:
    *   Implements BullMQ worker (`@Processor('agent-requests')`).
    *   Picks up jobs, calls `AgentsService.processQueuedAgentRequest`.
    *   Emits results/errors via `EventsGateway` (`agent-result-${userId}`).
    *   Adds comprehensive logging for job lifecycle.
    *   **Fix:** Correctly destructured `job.data` to pass `agentId`, `userId`, `message` as separate arguments to `agentsService.processQueuedAgentRequest`.

### **3.2. Agents Module (`backend/src/agents`)**
*   **`backend/src/agents/agents.module.ts`**: Imports `AgentQueueModule`.
*   **`backend/src/agents/agents.service.ts`**:
    *   `processQueuedAgentRequest(agentId, userId, message)`: Contains original heavy agent processing logic.
        *   **Fix:** Modified to handle empty `userId` by only attempting `userModel.findById(userId)` if `userId` is not empty. Defaults to 'free' plan if `userId` is empty or user not found. Prevents Mongoose `CastError`.
        *   **Logging:** Added `Logger` instance and extensive `debug`/`warn`/`error` logs. Corrected `Date.Now()` to `Date.now()`. Replaced `console.error` with `this.logger.error`.
    *   `chat(agentId, userId, message)`: New method to enqueue agent requests using `AgentQueueService`, returning `jobId`.
        *   **Fix:** Changed return type to `Promise<{ jobId: string | number }>` to accommodate BullMQ's `job.id` type.
    *   `getUserPlan(userId)`: Method to retrieve user plan.
*   **`backend/src/agents/agents.controller.ts`**:
    *   `@Post(':id/chat')` method:
        *   No longer directly processes chat requests; calls `agentsService.chat()` to enqueue.
        *   Returns `jobId` immediately.
        *   **Fix:** Removed `@UseGuards(JwtAuthGuard)` and applied `@Public()` decorator to allow unauthenticated access from the widget while still attempting to authenticate if a token is present.
    *   `getSnippet` method: Updated to use `agentsService.getUserPlan()` for plan checks.
    *   **Fix:** Removed `@InjectModel(User.name)` from constructor; logic moved to `AgentsService`.

### **3.3. Authentication Module (`backend/src/auth`)**
*   **`backend/src/auth/public.decorator.ts`**: **New file** defining `IS_PUBLIC_KEY` and `@Public()` decorator.
*   **`backend/src/auth/jwt-auth.guard.ts`**:
    *   Modified to use `Reflector` to check for `IS_PUBLIC_KEY` metadata.
    *   **Fix:** `canActivate` now *always* calls `super.canActivate(context)` to attempt authentication. If the route is public and authentication fails (`UnauthorizedException`), it still returns `true` to allow access (but `req.user` will be `null`).
    *   **Fix:** `handleRequest` override now logs `err`, `user`, and `info` for debugging. If a route is public, it will return `null` for `user` if authentication fails (e.g., no token), allowing the request to proceed with `req.user` as `null` or `undefined`.

### **3.4. App Module (`backend/src/app`)**
*   **`backend/src/app.module.ts`**:
    *   **Fix:** Imported `AgentQueueModule` into `AppModule` to ensure proper initialization.
    *   **Fix:** Removed duplicated/misplaced `getUserPlan` and `getDetailedAnalytics` blocks during prior error resolution.

## **4. Frontend Changes Implemented (`frontend/app/dashboard/page.tsx`)**
*   **`handleSendMessage`:** Modified to:
    *   Call backend API expecting `jobId` in return.
    *   Display "processing" toast message.
    *   No longer waits for direct agent response.
*   **WebSocket Listener:** Added `useEffect` hook to listen for `agent-result-${user._id}` events from the backend.
    *   Updates `messages` state with `agent` response.
    *   Handles success (`toast.success`) and failure (`toast.error`).
    *   Sets `setChatLoading(false)`.

## **5. Infrastructure & External Services**
*   **Redis Server:**
    *   `redis-server.exe` was not found in PATH.
    *   Installed `redis-64` via Chocolatey, which installed `Memurai Developer`.
    *   **Confirmed `Memurai` (Redis-compatible server) is running as a Windows Service.** This means Redis is active and accessible on `localhost:6379`.

## **6. Current State & Outstanding Issues (as of 31 January 2026, 6:38 PM)**

The core queueing mechanism and agent processing are functional. Backend logs show jobs being processed and responses generated.

**Frontend Issue:** The frontend (both dashboard and website widget) is still displaying "Agent request queued successfully." but **NOT receiving the actual agent's reply via WebSocket.** The UI remains in a loading state.

**Root of the Frontend Issue:** The backend is emitting WebSocket events named `agent-result-` (because `userId` is an empty string `""`), but the frontend is listening for `agent-result-${user._id}`. This is a mismatch.

**Core Problem:** The `userId` is **still `""` (empty)** for *ALL* requests (both dashboard and widget).

*   **Widget `userId`:** Expected to be empty for unauthenticated users. The backend logic (`AgentsService.processQueuedAgentRequest`) handles this by defaulting to the 'free' plan.
*   **Dashboard `userId`:** *NOT* expected to be empty for authenticated users. This is the critical outstanding issue. The `JwtAuthGuard` *should* populate `req.user` when an authenticated request is made from the dashboard, but it is not.

**Primary Next Steps for Debugging (for Tomorrow):**

1.  **Dashboard `userId` Not Populated (`req.user` issue):**
    *   The `JwtAuthGuard.canActivate` was modified to always attempt authentication.
    *   The `JwtAuthGuard.handleRequest` was modified to include `console.log`s for `err`, `user`, and `info`.
    *   **ACTION REQUIRED from user (Tomorrow):** Provide the backend console output, specifically the logs from `JwtAuthGuard handleRequest:` when testing from the dashboard. This will definitively show what the guard is receiving (token status, user object) and help diagnose why `req.user` is not being set for dashboard requests.

2.  **Frontend WebSocket Event Name Mismatch Handling:**
    *   Once the `userId` population issue is resolved for the dashboard, and a clear pattern for `userId` (empty for widget, actual ID for dashboard) is established, we will need to ensure the frontend's WebSocket listener (`frontend/app/dashboard/page.tsx`) is correctly configured to listen for the appropriate event names (`agent-result-${actualUserId}` or `agent-result-` for unauthenticated).

---

This `reference.md` file contains all the context we need to resume debugging tomorrow.
