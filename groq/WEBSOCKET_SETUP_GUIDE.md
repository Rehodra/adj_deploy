# WebSocket Integration Guide

This guide explains the complete WebSocket setup for the AI Legal Courtroom Simulator, including backend socket.io server and frontend client integration.

## Overview

The WebSocket system enables real-time, bidirectional communication between players in the courtroom simulator. It handles:
- Session management (joining/leaving games)
- Argument submission and evaluation
- AI opponent responses
- Turn management and scoring
- Hint requests
- Player presence indicators

## Architecture

### Backend Socket.io Server

**Location:** `app/sockets/`

```
app/sockets/
├── __init__.py           # Module initialization
├── socket_manager.py     # Socket.io server setup and utilities
└── events.py            # Event handlers and game logic
```

### Key Components

#### 1. **socket_manager.py**
- Sets up the Socket.io AsyncServer
- Manages in-memory session state
- Provides utility functions for broadcasting

```python
# Core utilities
sio = socketio.AsyncServer(...)          # Main socket server
active_sessions = {}                     # Room state storage
broadcast_to_session()                   # Send to room
emit_to_player()                        # Send to specific player
```

#### 2. **events.py**
- Handles connection lifecycle
- Manages game sessions
- Processes argument submissions
- Coordinates AI evaluation and opponent responses

### Frontend Socket.io Client

**Location:** `frontend/src/api/gameSocket.ts`

Single-instance service class for managing socket connections and events.

```typescript
import gameSocket from "../api/gameSocket";

await gameSocket.connect();
gameSocket.joinSession(sessionId, role);
gameSocket.submitArgument(sessionId, text);
gameSocket.onArgumentEvaluated(callback);
```

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install python-socketio==5.11.0 python-engineio==4.9.0
```

### 2. Socket.io Server Configuration

The server is initialized in `app/sockets/socket_manager.py`:

```python
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",  # Tighten in production
    logger=False,
    engineio_logger=False,
)
```

**Important:** 
- `async_mode="asgi"` - Required for FastAPI integration
- `cors_allowed_origins="*"` - Change to specific domains in production
- Set `logger=True` for debugging

### 3. FastAPI Integration

The socket.io server is wrapped around FastAPI in `app/main.py`:

```python
from socketio import ASGIApp
from app.sockets.socket_manager import get_sio

# Create ASGI app wrapper
sio = get_sio()
socket_asgi_app = ASGIApp(sio, app)

# Run with socket_asgi_app
if __name__ == "__main__":
    uvicorn.run(
        socket_asgi_app,
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
```

### 4. Session State Management

Sessions are stored in-memory in `active_sessions`:

```python
active_sessions[session_id] = {
    "players": {
        "sid1": "plaintiff",
        "sid2": "defense"
    },
    "turn": "plaintiff",
    "round": 1,
    "scores": {"plaintiff": 0, "defense": 0},
}
```

**Note:** For production with multiple processes, migrate to Redis using socket.io's adapter system.

## Event Reference

### Server Events (Sent by Backend)

| Event | Data | Description |
|-------|------|-------------|
| `session_joined` | `{session_id, role, current_turn, round, scores}` | Confirms session join and current state |
| `player_joined` | `{role, user_id, player_count}` | New player joined |
| `player_left` | `{role, player_count}` | Player disconnected |
| `argument_received` | `{role, argument, round}` | Argument acknowledgment |
| `argument_evaluated` | `{role, evaluation, scores}` | Judge's evaluation results |
| `opponent_response` | `{role, argument}` | AI opponent's counter-argument |
| `turn_changed` | `{current_turn, round, scores}` | Turn and round advancement |
| `verdict_reached` | `{winner, final_scores}` | Game ended |
| `hint_response` | `{hints}` | Legal document hints |
| `player_typing` | `{role}` | Player is typing indicator |
| `error` | `{message}` | Error message |

### Client Events (Sent by Frontend)

| Event | Data | Description |
|-------|------|-------------|
| `join_session` | `{session_id, role, user_id}` | Join game room |
| `leave_session` | `{session_id}` | Leave game room |
| `submit_argument` | `{session_id, argument_text, case_id}` | Submit argument for evaluation |
| `request_hint` | `{session_id, question}` | Request legal document hints |
| `typing` | `{session_id}` | Broadcast typing indicator |

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install socket.io-client@4.7.2
```

### 2. Environment Configuration

Add to `.env` file:

```env
REACT_APP_SOCKET_URL=http://localhost:8000
```

### 3. Basic Usage

```typescript
import gameSocket from "../api/gameSocket";

// Initialize connection
await gameSocket.connect();

// Join a session
gameSocket.joinSession("session-123", "plaintiff", "user-456");

// Listen for events
gameSocket.onArgumentEvaluated((data) => {
  console.log("Evaluation:", data.evaluation);
  console.log("Scores:", data.scores);
});

// Send events
gameSocket.submitArgument(
  "session-123",
  "The defendant clearly violated IPC Section 304...",
  "CRIM_HARD_1"
);
```

### 4. React Component Integration

See `GameRoom.tsx` for a complete example component that:
- Initializes socket connection
- Manages game state
- Handles user input
- Updates UI based on socket events
- Manages error states

**Key Features:**
- Automatic connection/disconnection
- Event listener cleanup
- Loading states
- Error handling
- Real-time score updates
- Turn management UI

## Game Flow Sequence

```
1. Player connects to server
   └─> Browser opens WebSocket connection

2. Player joins session
   └─> Client: emit "join_session"
   └─> Server: adds to active_sessions
   └─> Server: emit "session_joined" to player
   └─> Server: emit "player_joined" to others

3. Player submits argument
   └─> Client: emit "submit_argument"
   └─> Server: emit "argument_received" (acknowledgment)
   └─> Server: run judge evaluation (background)
   └─> Server: emit "argument_evaluated"
   └─> Server: generate opponent response (if AI)
   └─> Server: emit "opponent_response"
   └─> Server: emit "turn_changed"

4. Check win condition
   └─> If rounds > 10: emit "verdict_reached"
   └─> Game ends

5. Player leaves
   └─> Client: emit "leave_session"
   └─> Server: remove from session
   └─> Server: emit "player_left" to room
```

## Production Considerations

### 1. CORS Configuration

**Development:**
```python
cors_allowed_origins="*"
```

**Production:**
```python
cors_allowed_origins=[
    "https://yourdomain.com",
    "https://app.yourdomain.com"
]
```

### 2. Session State Storage

For multi-process production deployment, migrate from in-memory to Redis:

```python
from socketio import RedisManager

mgr = RedisManager("redis://localhost:6379")
sio = socketio.AsyncServer(
    async_mode="asgi",
    client_manager=mgr,
)
```

### 3. Authentication

Add authentication to socket events:

```python
@sio.event
async def join_session(sid, data, auth):
    # Verify auth token
    user = verify_token(auth.get("token"))
    if not user:
        return False
    # Continue...
```

### 4. Rate Limiting

Prevent abuse:

```python
from socketio import RateLimiter

@sio.event
@RateLimiter(max_events=10, window_size=60)
async def submit_argument(sid, data):
    # Handle argument submission
```

### 5. Logging

Enable logging for debugging:

```python
sio = socketio.AsyncServer(
    logger=True,
    engineio_logger=True,
)
```

### 6. SSL/TLS

Enable secure WebSocket (wss://):

```python
ssl_context = ssl.create_default_context(
    ssl.Purpose.CLIENT_AUTH
)
ssl_context.load_cert_chain("cert.pem", "key.pem")

uvicorn.run(app, ssl_context=ssl_context)
```

## Troubleshooting

### Connection Issues

**Problem:** Client can't connect to server

**Solutions:**
1. Check server is running on correct port
2. Verify CORS origins configuration
3. Check network/firewall settings
4. Enable logging: `logger=True`

```python
sio = socketio.AsyncServer(logger=True, engineio_logger=True)
```

### Events Not Being Received

**Problem:** Client emits but server never receives

**Solutions:**
1. Verify session ID is correct
2. Check player role is valid (plaintiff/defense/spectator)
3. Ensure event handler is registered
4. Check browser console for errors

### Disconnections

**Problem:** Random socket disconnections

**Solutions:**
1. Increase reconnection timeout: `reconnectionDelayMax: 10000`
2. Check server resource limits
3. Monitor network latency
4. Enable heartbeat/ping-pong

### State Desynchronization

**Problem:** Frontend and backend state mismatch

**Solutions:**
1. Always update frontend state on server events
2. Don't assume state, request from server
3. Implement acknowledgments for critical operations
4. Use version numbers for state

## Monitoring & Debugging

### Backend Monitoring

```python
# Check active sessions
print(active_sessions)

# Check connected clients
print(f"Connected clients: {len(sio.manager.rooms.get('sockets', {}))}")

# Enable debug logging
settings.LOG_LEVEL = "DEBUG"
```

### Frontend Monitoring

```typescript
// Log all socket events (development only)
gameSocket.socket.onAny((event, ...args) => {
  console.log(`[Socket Event] ${event}`, args);
});

// Check connection status
console.log(gameSocket.isConnected());
console.log(gameSocket.getSocketId());
```

### Network Debugging

Use browser DevTools:
1. Open DevTools → Network tab
2. Filter by "ws" (WebSocket)
3. Click WebSocket to inspect frames
4. See both sent and received messages

## Testing

### Unit Tests

Test socket events in isolation:

```python
# test_socket_events.py
import pytest
from app.sockets.events import *

@pytest.mark.asyncio
async def test_join_session():
    # Setup
    test_data = {
        "session_id": "test-session",
        "role": "plaintiff"
    }
    # Test and assert
```

### Integration Tests

Test full game flow:

```typescript
// gameSocket.test.ts
describe("Game Socket", () => {
  test("Player joins and receives session state", async () => {
    const socket = await gameSocket.connect();
    gameSocket.joinSession("test", "plaintiff");
    
    const joined = await waitFor(() => 
      expect(onSessionJoinedCalled).toBe(true)
    );
  });
});
```

## Performance Optimization

1. **Message Batching:** Combine multiple events into single message
2. **Compression:** Enable socket.io binary compression
3. **Selective Broadcasting:** Only broadcast to relevant players
4. **Connection Pooling:** Use connection pools for database operations
5. **Caching:** Cache RAG retrieval results

## Security

1. **Validate All Input:** Check argument length, format
2. **Rate Limiting:** Limit submissions per user
3. **Authentication:** Verify user identity
4. **Authorization:** Check user permissions
5. **Sanitization:** Clean user input
6. **HTTPS/WSS:** Use secure protocols

## References

- [Socket.io Documentation](https://socket.io/docs/)
- [Python-socketio](https://python-socketio.readthedocs.io/)
- [FastAPI WebSockets](https://fastapi.tiangolo.com/advanced/websockets/)
