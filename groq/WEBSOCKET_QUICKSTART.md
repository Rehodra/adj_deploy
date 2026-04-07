# WebSocket Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Backend Setup

```bash
# 1. Install dependencies
cd backend
pip install python-socketio==5.11.0 python-engineio==4.9.0

# 2. Run backend
python -m uvicorn app.main:app --reload
# Server will be at http://localhost:8000
# WebSocket at ws://localhost:8000/socket.io
```

### Frontend Setup

```bash
# 1. Install dependencies
cd frontend
npm install socket.io-client@4.7.2

# 2. Add environment variable
# In .env or .env.local:
REACT_APP_SOCKET_URL=http://localhost:8000

# 3. Run frontend
npm start
# Frontend at http://localhost:3000
```

## ✅ Verification Checklist

- [ ] Backend running and accessible at http://localhost:8000/docs
- [ ] Frontend running at http://localhost:3000
- [ ] No CORS errors in browser console
- [ ] WebSocket connection appears in browser DevTools → Network → WS
- [ ] Can see "🔌 WebSocket: ws://localhost:8000/socket.io" in backend console

## 🧪 Test Connection

### Browser Console Test

```javascript
// Open browser DevTools Console and paste:
import gameSocket from './api/gameSocket.js';

// Connect
await gameSocket.connect();
console.log('Connected:', gameSocket.isConnected());

// Join session
gameSocket.joinSession('test-session-123', 'plaintiff', 'user-123');

// Listen for confirmation
gameSocket.onSessionJoined((data) => {
  console.log('Session joined:', data);
});

// Submit argument
gameSocket.submitArgument(
  'test-session-123',
  'The defendant violated IPC Section 304.',
  'CRIM_HARD_1'
);
```

### Backend Test Endpoint

```bash
# Check WebSocket is ready
curl http://localhost:8000/health

# View API info
curl http://localhost:8000/api/info
```

## 🎮 Try It in the App

1. Go to [Simulator](http://localhost:3000/simulator)
2. Create or join a session
3. Select your role (plaintiff/defense/spectator)
4. Start submitting arguments
5. Watch AI judge evaluate and opponent respond

## 📊 Monitor Connection

Open browser DevTools:
1. **Network tab**: Filter by "WS" to see WebSocket
2. Click the WebSocket connection
3. View "Messages" tab for real-time events
4. See both sent (↑) and received (↓) frames

## 🐛 Debug Issues

### Connection Refused

```
Error: Unable to connect
Solution: 
- Backend running? Check http://localhost:8000
- Port 8000 not used by something else? netstat -tuln
```

### CORS Error

```
Cross-Origin Request Blocked
Solution:
- Check CORS_ORIGINS in settings
- For localhost: should be "*" in development
```

### Socket.io Not Found

```
404 on socket.io/
Solution:
- Ensure app/sockets/events.py is imported
- Check socket_asgi_app is passed to uvicorn.run()
```

### Arguments Not Evaluating

```
Solution:
- Check case_id is valid (e.g., "CRIM_HARD_1")
- Verify AI API keys are configured
- Check backend logs for errors
```

## 📚 Key Files

| File | Purpose |
|------|---------|
| `app/sockets/socket_manager.py` | Socket.io server setup |
| `app/sockets/events.py` | Game logic and event handlers |
| `app/main.py` | FastAPI app with socket integration |
| `frontend/src/api/gameSocket.ts` | Client service |
| `frontend/src/components/GameRoom.tsx` | Example component |
| `WEBSOCKET_SETUP_GUIDE.md` | Detailed documentation |

## 🔧 Configuration

### Backend (.env or app/config.py)

```python
# Socket configuration
SOCKET_CORS_ORIGINS = "*"  # Change in production
SOCKET_DEBUG = True        # Set to False in production
SOCKET_LOGGER = False      # Set to True for debugging
```

### Frontend (.env or .env.local)

```
REACT_APP_SOCKET_URL=http://localhost:8000
REACT_APP_SOCKET_DEBUG=true
```

## 📖 Common Operations

### Join a Session

```typescript
gameSocket.joinSession(
  'game-123',
  'plaintiff',  // or 'defense', 'spectator'
  'user@email.com'
);
```

### Submit Argument

```typescript
gameSocket.submitArgument(
  'game-123',
  'The defendant clearly violated...',
  'CRIM_HARD_1'  // case ID
);
```

### Request a Hint

```typescript
gameSocket.requestHint(
  'game-123',
  'What are the elements of criminal negligence?'
);
```

### Listen to Events

```typescript
// Argument was evaluated
gameSocket.onArgumentEvaluated((data) => {
  console.log('Score:', data.scores);
  console.log('Feedback:', data.evaluation);
});

// Opponent replied
gameSocket.onOpponentResponse((data) => {
  console.log('Opponent:', data.argument);
});

// Game ended
gameSocket.onVerdictReached((data) => {
  console.log('Winner:', data.winner);
  console.log('Final Scores:', data.final_scores);
});
```

## 🚨 Common Errors & Solutions

| Error | Fix |
|-------|-----|
| `Connection refused` | Start backend: `python -m uvicorn app.main:app --reload` |
| `CORS policy blocked` | Ensure CORS_ORIGINS includes frontend URL |
| `404 socket.io` | Check imports in app/main.py |
| `"Not your turn"` | Wait for turn to change, watch the UI |
| `Session not found` | Use valid session ID, other player must join first |
| `Case not found` | Use valid case_id from data/cases/case_index.json |

## 🔐 Production Checklist

- [ ] CORS_ORIGINS set to specific domains
- [ ] SSL/TLS enabled (wss://)
- [ ] Redis for session storage (not in-memory)
- [ ] Rate limiting enabled
- [ ] Logging configured for monitoring
- [ ] Error handling and alerting set up
- [ ] Database connection pooling
- [ ] Load testing completed

## 📞 Support

For detailed documentation, see `WEBSOCKET_SETUP_GUIDE.md`

For API endpoints, visit http://localhost:8000/docs

For Socket.io events reference, check `app/sockets/events.py`
