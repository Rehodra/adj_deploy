# Socket.io disabled for deployment (reduces bundle by ~50 MB).
# All game logic is handled via the REST API (/api/session, /api/argument, etc.).

from typing import Dict, Any

# In-memory room state kept as a stub (not used without socket.io)
active_sessions: Dict[str, Dict[str, Any]] = {}


def get_sio():
    return None


async def broadcast_to_session(session_id: str, event: str, data: dict):
    pass


async def emit_to_player(sid: str, event: str, data: dict):
    pass
