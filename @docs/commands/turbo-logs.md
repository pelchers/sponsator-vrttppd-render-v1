# Turbo Logging Guide

## Overview
Turbo automatically captures and displays logs from all workspaces (client and server) in a unified terminal output. We've enhanced this with custom client-to-server logging to make client logs more visible in the terminal.

## Setup Steps

### 1. Basic Turbo Logging (Already Built-in)
- Configured in root `turbo.json`:
```json
{
  "pipeline": {
    "dev": {
      "cache": false,
      "dependsOn": ["^dev"]
    }
  }
}
```
- This captures all stdout/stderr from both client and server processes

### 2. Enhanced Client Logging
We added a custom logging system to make client logs appear in the terminal:

1. **Server Endpoint** (`server/src/index.ts`):
```typescript
app.post("/log", (req, res) => {
  const { message, type = 'info' } = req.body;
  console.log(`[CLIENT] ${type.toUpperCase()}: ${message}`);
  res.sendStatus(200);
});
```

2. **Client Logger** (`client/src/utils/logger.ts`):
```typescript
const log = async (message: string, type: 'info' | 'error' | 'debug' = 'info') => {
  console.log(message); // Keep browser console logging
  
  // Also send to server
  try {
    await fetch('http://localhost:4000/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, type }),
    });
  } catch (error) {
    console.error('Failed to send log to server:', error);
  }
};
```

## Usage

### View All Logs
```bash
npm run dev
```
- Shows logs from all workspaces in real-time

### Filter Logs by Workspace
```bash
turbo run dev --filter=client
# or
turbo run dev --filter=server
```

### Debug Logging
```bash
turbo run dev --debug
# or
turbo run dev --verbose
```

## Log Types and Prefixes

### Client Logs
- Format: `[CLIENT] TYPE: message`
- Types: 'info', 'error', 'debug'
- Example: `[CLIENT] INFO: Count incremented to 1`

### Server Logs
- HTTP Request logs: `METHOD /path`
- Custom server logs: Direct console.log output
- Example: `POST /log` or `Server listening on port 4000`

## How It Works

1. **Server-side Logs**:
   - Direct console.log statements are captured by Turbo
   - Express middleware logs all HTTP requests
   - Custom logging messages appear as configured

2. **Client-side Logs**:
   - Browser console.log remains for development
   - Custom logger sends logs to server via POST /log
   - Server formats and outputs client logs with [CLIENT] prefix
   - All appears in unified Turbo terminal output

## Benefits

1. **Unified View**: All logs appear in one terminal
2. **Clear Source**: [CLIENT] prefix identifies log source
3. **Type Support**: Different log levels (info/error/debug)
4. **Real-time**: Logs appear immediately
5. **Filterable**: Can focus on client or server logs

## Debugging Tips

1. Client logs not appearing?
   - Check server is running on port 4000
   - Verify /log endpoint is accessible
   - Check network tab for POST requests to /log

2. Server logs not appearing?
   - Verify Turbo is running both workspaces
   - Check server process is running
   - Try running with --verbose flag 