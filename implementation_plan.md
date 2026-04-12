# Real-Time Notification System Architecture & Plan

Real-time notifications will allow Users, Sellers, and Admins to instantly receive updates (e.g., when an order is placed, an account is verified, or a status changes) without refreshing the page.

Here is the comprehensive plan covering the technology choice, database schema changes, and feature breakdown.

## 1. Technological Approach

For real-time functionality, **WebSockets (via `socket.io`)** is the recommended industry standard for a marketplace application. 
- **Why Socket.io?** It establishes a persistent, bi-directional connection between the React frontend and Express backend. It's much faster than polling and paves the way for future features like live chatting between buyers and sellers.
- **Alternative (SSE)**: Server-Sent Events are simpler but only allow one-way communication. WebSockets are much more powerful for this scale.

## 2. Database Changes (MySQL)

We need to create a new `notifications` table to store all notifications. This is crucial because if a user is offline when an event happens, they still need to see it in their notification history when they log in.

### `notifications` Table Schema
| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK, Auto-Increment) | Unique identifier |
| `user_id` | INT (FK) | The ID of the user receiving the notification |
| `type` | VARCHAR | Event type (e.g., `ORDER_PLACED`, `STATUS_UPDATE`, `SYSTEM`) |
| `message` | TEXT | What the notification actually says |
| `link` | VARCHAR | (Optional) URL to navigate to when clicked |
| `is_read` | BOOLEAN | Default `FALSE`. Changes to `TRUE` when clicked/viewed |
| `created_at` | TIMESTAMP | Default `CURRENT_TIMESTAMP` |

## 3. Features to Implement

### A. Backend (`backend/`)
1. **Install Dependencies**: `npm install socket.io`
2. **Socket Server Setup**: Wrap the existing Express server with `http` and attach the Socket.io server in `server.js`.
3. **Session Management**: Map connected `socket_id` to `user_id` (using JWT tokens for authentication over sockets) so we know exactly *who* to send a message to.
4. **Notification APIs**:
   - `GET /api/notifications` — Fetch historical/unread notifications.
   - `PUT /api/notifications/:id/read` — Mark a specific notification as read.
   - `PUT /api/notifications/read-all` — Mark all as read.
5. **Event Triggers**: Inject notification logic into existing controllers. For example:
   - *Checkout/Order*: When a user buys something, notify the User ("Order Placed") and the Seller ("New Order Received").
   - *Admin Approval*: When admin approves a seller, notify the Seller ("Account Verified").

### B. Frontend (`frontend/`)
1. **Install Dependencies**: `npm install socket.io-client`
2. **Socket Context**: Create a `SocketContext` or integrate it tightly with the existing `NotificationContext`. Needs to connect when a user logs in and disconnect on logout.
3. **Notification Bell UI**: Add a bell icon (`🔔`) with a red unread badge counter in the headers of all 3 layouts (`UserLayout`, `SellerLayout`, `AdminLayout`).
4. **Dropdown Panel**: Clicking the bell opens an elegant UI dropdown showing recent notifications. Clicking a notification marks it as read and navigates to the relevant page via the `link`.
5. **Real-time Toasts**: When a socket event fires *while* the user is active, trigger an immediate toast notification on screen.

> [!IMPORTANT]
> **User Review Required**
> 1. Do you agree with using **Socket.io**, or did you want a simpler non-realtime polling system?
> 2. Are there any specific notifications you consider highest priority to build first? (e.g., just Order Notifications for now?)
> 
> Please reply to approve this plan or suggest changes!
