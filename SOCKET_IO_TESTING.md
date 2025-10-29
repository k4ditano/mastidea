# Socket.IO Connection Testing Guide

This document provides testing recommendations for the Socket.IO real-time connection functionality in Mastidea.

## Overview

The Socket.IO implementation enables real-time updates for collaborative idea exploration. It allows multiple users to see expansions and updates in real-time when working on the same idea.

## Components

### Server-Side
- **Location**: `lib/socket.ts`
- **Initialization**: `server.js`
- **Usage**: API routes (`app/api/ideas/[id]/expand/route.ts`, `app/api/ideas/[id]/chat/route.ts`)

### Client-Side
- **Location**: `lib/useRealtimeUpdates.ts`
- **Usage**: `app/idea/[id]/page.tsx`

## Testing Procedure

### 1. Basic Connection Test

**Prerequisites:**
- Running server: `npm run dev`
- Browser with developer console open

**Steps:**
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open browser and navigate to an idea page: `http://localhost:3000/idea/[id]`

3. Open browser developer console (F12)

4. Look for connection logs:
   ```
   [Socket.IO] Conectando a http://localhost:3000
   [Socket.IO] Conectado exitosamente
   [Socket.IO] Unido a idea:[id]
   ```

5. Check server logs for:
   ```
   [Socket.IO] Servidor Socket.IO inicializado correctamente
   [Socket.IO] Cliente conectado: [socket-id]
   [Socket.IO] Usuario [user-id] se unió a idea:[idea-id]
   ```

**Expected Result:**
- ✅ Green indicator appears in top-right showing "En vivo" (Live Sync Active)
- ✅ Console shows successful connection
- ✅ No error messages

### 2. Reconnection Test

**Steps:**
1. Connect to an idea page as in Test 1
2. Stop the server (Ctrl+C)
3. Observe console logs for reconnection attempts:
   ```
   [Socket.IO] Desconectado: transport close
   [Socket.IO] Intento de reconexión #1
   [Socket.IO] Intento de reconexión #2
   ```
4. Restart the server
5. Observe automatic reconnection:
   ```
   [Socket.IO] Reconectado después de N intentos
   [Socket.IO] Conectado exitosamente
   ```

**Expected Result:**
- ✅ Client automatically reconnects when server is back
- ✅ Green indicator reappears
- ✅ User is re-joined to the idea room

### 3. Real-Time Updates Test

**Prerequisites:**
- Two browser windows/tabs or two different browsers
- Same user or different users with access to the same idea

**Steps:**
1. Open the same idea in two browser windows
2. In Window 1, click any expansion button (e.g., "Sugerencias")
3. Observe Window 2 for real-time updates

**Expected Result:**
- ✅ Window 2 receives the new expansion without manual refresh
- ✅ Console in Window 2 shows:
   ```
   [Socket.IO] Recibidas 1 nuevas expansiones
   ```

### 4. Multi-User Collaboration Test

**Prerequisites:**
- Two different user accounts
- Shared idea (with collaborator access)
- Two browsers (or incognito mode)

**Steps:**
1. User A opens idea page
2. User B opens the same idea page
3. User A creates an expansion
4. User B should see the update in real-time

**Expected Result:**
- ✅ Both users see updates without refresh
- ✅ Green "Live Sync" indicator shows on both screens

### 5. Error Handling Test

**Test Connection Errors:**
1. Disconnect network (airplane mode or disable network)
2. Observe error handling:
   ```
   [Socket.IO] Error de conexión: [error message]
   [Socket.IO] Intento de reconexión #1
   ```
3. Reconnect network
4. Verify automatic recovery

**Expected Result:**
- ✅ Graceful error handling (no crashes)
- ✅ Automatic reconnection when network is restored
- ✅ Clear error messages in console

### 6. CORS Test

**Test with different origins (if applicable):**
1. If using a separate frontend and backend, verify CORS is properly configured
2. Check for CORS errors in browser console
3. Verify `NEXT_PUBLIC_APP_URL` environment variable is set correctly

**Expected Result:**
- ✅ No CORS errors
- ✅ Connection succeeds from configured origins

## Common Issues and Solutions

### Issue: Connection Failed
**Symptoms:** 
- No green indicator
- Console error: `[Socket.IO] Error de conexión`

**Solutions:**
1. Verify server is running
2. Check `NEXT_PUBLIC_APP_URL` environment variable
3. Verify Socket.IO server is initialized (check server logs)
4. Check browser network tab for Socket.IO requests

### Issue: Reconnection Loops
**Symptoms:**
- Constant disconnect/reconnect cycles
- Multiple reconnection attempts

**Solutions:**
1. Check server logs for errors
2. Verify database connection is stable
3. Check CORS configuration
4. Ensure proper network connectivity

### Issue: Updates Not Received
**Symptoms:**
- Connection successful but no real-time updates
- Must manually refresh to see changes

**Solutions:**
1. Verify user has access to the idea (owner or collaborator)
2. Check server logs for `emitIdeaUpdate` calls
3. Verify correct room joining (`join-idea` event)
4. Check browser console for event listeners

### Issue: Multiple Connections
**Symptoms:**
- Multiple socket connections from same client
- Memory leaks

**Solutions:**
1. Verify proper cleanup in `useRealtimeUpdates` hook
2. Check for proper `useEffect` dependencies
3. Ensure `removeAllListeners()` and `disconnect()` are called

## Browser Console Inspection

### Useful Console Commands

Check current socket status:
```javascript
// In browser console
console.log(socket.connected)
console.log(socket.id)
```

### Expected Log Sequence

**Successful Connection:**
```
[Socket.IO] Conectando a http://localhost:3000
[Socket.IO] Conectado exitosamente
[Socket.IO] Unido a idea:abc123
```

**Receiving Updates:**
```
[Socket.IO] Recibidas 1 nuevas expansiones
```

**Disconnect:**
```
[Socket.IO] Desconectado: transport close
```

**Reconnection:**
```
[Socket.IO] Intento de reconexión #1
[Socket.IO] Reconectado después de 1 intentos
```

## Performance Monitoring

Monitor Socket.IO performance:

1. **Connection Time**: Time from page load to connection established
2. **Latency**: Time from server emit to client receive
3. **Reconnection Time**: Time to reconnect after disconnect
4. **Memory Usage**: Check for memory leaks over time

## Integration Testing

For automated testing, consider:

1. **Unit Tests**: Test Socket.IO event handlers
2. **Integration Tests**: Test full connection flow
3. **E2E Tests**: Test real-time updates in browser environment

Example test scenarios:
- User joins idea room
- User receives expansion update
- User disconnects and reconnects
- Multiple users collaborate on same idea

## Environment Variables

Required environment variables:

```env
# Backend URL (optional, defaults to localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# For production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Security Considerations

✅ **Implemented Security Features:**
- Room-based authorization (users must have access to idea)
- User verification before joining rooms
- CORS configuration for allowed origins
- Credentials support for authentication

⚠️ **Security Checklist:**
- [ ] Verify user authentication before allowing socket connection
- [ ] Validate user access to idea rooms
- [ ] Configure proper CORS origins (not "*" in production)
- [ ] Monitor for suspicious connection patterns
- [ ] Rate limit socket events if needed

## Troubleshooting Tips

1. **Clear browser cache** if experiencing stale connection issues
2. **Check network tab** in dev tools for WebSocket frames
3. **Enable verbose logging** by modifying console.log statements
4. **Test with different browsers** to isolate browser-specific issues
5. **Check firewall rules** if connection fails in production

## Success Criteria

A successful Socket.IO implementation should demonstrate:

✅ Stable connection establishment within 2-3 seconds  
✅ Automatic reconnection within 5-10 seconds after disconnect  
✅ Real-time updates delivered within 1 second  
✅ No memory leaks during extended use  
✅ Graceful error handling without crashes  
✅ Support for multiple concurrent users  
✅ Clear visual feedback (green indicator) for connection status  

## Additional Resources

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Socket.IO Client API](https://socket.io/docs/v4/client-api/)
- [Socket.IO Server API](https://socket.io/docs/v4/server-api/)
- [Debugging Socket.IO](https://socket.io/docs/v4/troubleshooting-connection-issues/)
