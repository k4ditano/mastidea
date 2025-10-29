# Socket.IO Connection Fix - Changes Summary

## Problem Statement

The Socket.IO connection between client and server had several issues that needed to be resolved:

1. **Duplicate Server Implementations**: Two Socket.IO server files existed (`lib/socket.ts` and `lib/socket.js`) causing potential inconsistencies
2. **Client Connection Issues**: Missing explicit server URL configuration
3. **Incomplete Error Handling**: Limited error handling on client side
4. **Missing Reconnection Logic**: No handlers for reconnection events
5. **CORS Configuration**: Could be improved for better environment variable handling

## Changes Made

### 1. Server-Side Changes (`lib/socket.ts`)

**Before:**
- Used local `io` variable
- Basic CORS with single origin or wildcard
- No connection timeout configuration

**After:**
```typescript
// Global scope for server.js compatibility
declare global {
  var io: SocketIOServer | undefined;
}

// Improved CORS configuration
const allowedOrigins = process.env.NEXT_PUBLIC_APP_URL 
  ? [process.env.NEXT_PUBLIC_APP_URL, process.env.NEXT_PUBLIC_APP_URL.replace(/:\d+$/, ':3000')]
  : "*";

global.io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/socket.io/",
  transports: ["websocket", "polling"],
  connectTimeout: 45000,
  pingTimeout: 30000,
  pingInterval: 25000,
});
```

**Key Improvements:**
- ✅ Uses `global.io` pattern for consistency with server.js
- ✅ Better CORS with array of allowed origins
- ✅ Added credentials support for authentication
- ✅ Configured connection and ping timeouts
- ✅ Added initialization success log

### 2. Client-Side Changes (`lib/useRealtimeUpdates.ts`)

**Before:**
- Called `io()` without explicit URL
- Basic reconnection configuration
- Limited error handling

**After:**
```typescript
// Explicit server URL
const serverUrl = typeof window !== 'undefined' 
  ? window.location.origin 
  : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const socketIO = io(serverUrl, {
  path: "/socket.io/",
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  timeout: 20000,
  autoConnect: true,
  withCredentials: true,
});

// Comprehensive error handling
socketIO.on("connect_error", (error) => {
  console.error("[Socket.IO] Error de conexión:", error.message);
  setConnected(false);
});

socketIO.on("reconnect", (attemptNumber) => {
  console.log(`[Socket.IO] Reconectado después de ${attemptNumber} intentos`);
  setConnected(true);
  socketIO.emit("join-idea", ideaId, userId);
});

socketIO.on("reconnect_attempt", (attemptNumber) => {
  console.log(`[Socket.IO] Intento de reconexión #${attemptNumber}`);
});

socketIO.on("reconnect_error", (error) => {
  console.error("[Socket.IO] Error de reconexión:", error.message);
});

socketIO.on("reconnect_failed", () => {
  console.error("[Socket.IO] Falló la reconexión después de todos los intentos");
  setConnected(false);
});
```

**Key Improvements:**
- ✅ Explicit server URL using `window.location.origin`
- ✅ Connection timeout configuration (20 seconds)
- ✅ Comprehensive error event handlers
- ✅ All reconnection event handlers implemented
- ✅ Re-joins room after reconnection
- ✅ Better logging for debugging
- ✅ Proper cleanup with `removeAllListeners()`

### 3. Server Initialization (`server.js`)

**Before:**
```javascript
const { initSocket } = require("./lib/socket.js");
```

**After:**
```javascript
const { initSocket } = require("./lib/socket");
```

**Key Improvements:**
- ✅ Imports from compiled TypeScript module
- ✅ Single source of truth (TypeScript version)

### 4. API Routes Updates

**Files Modified:**
- `app/api/ideas/[id]/expand/route.ts`
- `app/api/ideas/[id]/chat/route.ts`

**Before:**
```typescript
import { emitIdeaUpdate } from '@/lib/socket.js';
```

**After:**
```typescript
import { emitIdeaUpdate } from '@/lib/socket';
```

**Key Improvements:**
- ✅ Consistent imports
- ✅ Use TypeScript module

### 5. File Deletion

**Removed:**
- `lib/socket.js` - Duplicate JavaScript implementation

**Reason:**
- Eliminates duplication
- Single TypeScript implementation as source of truth
- Prevents inconsistencies between two versions

## Benefits

### 1. **Improved Reliability**
- Explicit connection configuration reduces ambiguity
- Better error handling prevents silent failures
- Automatic reconnection with proper state management

### 2. **Better Developer Experience**
- Comprehensive logging for debugging
- Clear error messages
- Single codebase to maintain (TypeScript only)

### 3. **Enhanced Security**
- Proper CORS configuration
- Credentials support for authentication
- Authorization checks before room joining

### 4. **Production Ready**
- Configurable timeouts
- Graceful degradation
- Proper cleanup to prevent memory leaks

## Event Flow

### Connection Establishment

```
Client                          Server
  |                               |
  |-- connect request ----------->|
  |                               |
  |<----------- connect ack ------|
  |                               |
  |-- emit "join-idea" ---------->|
  |                               |
  |                      (verify access)
  |                               |
  |<--- emit "joined-idea" -------|
```

### Real-Time Updates

```
Client A           Server           Client B
  |                  |                  |
  |-- API request -->|                  |
  |                  |                  |
  |<-- response -----|                  |
  |                  |                  |
  |              (emitIdeaUpdate)       |
  |                  |                  |
  |                  |--- broadcast --->|
  |                  |                  |
  |                  |            (receives update)
```

### Reconnection Flow

```
Client                          Server
  |                               |
  |  (connection lost)            |
  X-------------------------------|
  |                               |
  |-- reconnect attempt 1 ------->|
  |                               X (fails)
  |                               |
  |-- reconnect attempt 2 ------->|
  |                               |
  |<----------- connect ack ------|
  |                               |
  |-- emit "join-idea" ---------->|
  |                               |
  |<--- emit "joined-idea" -------|
```

## Configuration

### Environment Variables

```env
# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Socket.IO Server Options

| Option | Value | Purpose |
|--------|-------|---------|
| `connectTimeout` | 45000ms | Maximum time to establish connection |
| `pingTimeout` | 30000ms | Time to wait for ping response |
| `pingInterval` | 25000ms | Interval between ping packets |
| `transports` | `["websocket", "polling"]` | Fallback mechanisms |
| `credentials` | `true` | Support authentication cookies |

### Socket.IO Client Options

| Option | Value | Purpose |
|--------|-------|---------|
| `timeout` | 20000ms | Connection timeout |
| `reconnection` | `true` | Enable auto-reconnection |
| `reconnectionDelay` | 1000ms | Initial delay before reconnect |
| `reconnectionDelayMax` | 5000ms | Maximum delay between attempts |
| `reconnectionAttempts` | 5 | Maximum reconnection attempts |
| `withCredentials` | `true` | Send cookies with requests |

## Testing

See `SOCKET_IO_TESTING.md` for comprehensive testing guide.

### Quick Verification

1. Start server: `npm run dev`
2. Open idea page in browser
3. Check for green "Live Sync" indicator
4. Open browser console and verify logs:
   ```
   [Socket.IO] Conectando a http://localhost:3000
   [Socket.IO] Conectado exitosamente
   [Socket.IO] Unido a idea:[id]
   ```

## Migration Notes

### For Developers

If you were previously importing from `lib/socket.js`:

**Before:**
```typescript
import { emitIdeaUpdate } from '@/lib/socket.js';
```

**After:**
```typescript
import { emitIdeaUpdate } from '@/lib/socket';
```

### For Deployment

No database migrations required. Environment variable configuration remains the same.

## Known Limitations

1. **Network Interruptions**: Maximum 5 reconnection attempts before giving up (configurable)
2. **Browser Compatibility**: Requires modern browsers with WebSocket support
3. **Scaling**: Current implementation uses in-memory storage; for multi-server deployments, consider Redis adapter

## Future Enhancements

Potential improvements for future iterations:

1. **Redis Adapter**: For horizontal scaling across multiple server instances
2. **Presence Tracking**: Show which users are currently viewing an idea
3. **Typing Indicators**: Show when collaborators are typing
4. **Message Queuing**: Buffer messages during disconnection
5. **Compression**: Enable compression for large payloads
6. **Rate Limiting**: Prevent abuse of socket events

## References

- [Socket.IO v4 Documentation](https://socket.io/docs/v4/)
- [Next.js Custom Server](https://nextjs.org/docs/pages/building-your-application/configuring/custom-server)
- [WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)

## Support

For issues or questions:
1. Check `SOCKET_IO_TESTING.md` for troubleshooting
2. Review browser console logs
3. Check server logs for error messages
4. Verify environment variables are set correctly
