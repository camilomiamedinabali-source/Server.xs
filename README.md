# Server.xs - Phone-to-Desktop Remote Control

A real-time WebSocket-based server for controlling your desktop from your phone.

## Features

- **WebSocket Communication**: Real-time bidirectional communication between phone and desktop
- **Device Registration**: Automatic device registration and discovery
- **Command Execution**: Send remote control commands (mouse, keyboard, etc.)
- **Status Tracking**: Monitor connected devices and server status
- **RESTful API**: Health checks and status endpoints

## Architecture

```
Phone Client ──WebSocket──→ Server ──WebSocket──→ Desktop Client
```

## Getting Started

### Installation

```bash
npm install
```

### Start the Server

```bash
npm start
```

Server runs on `ws://localhost:8080`

### Connect Clients

**Desktop Client:**
```javascript
const RemoteControlClient = require('./client-example.js');
const desktop = new RemoteControlClient('ws://localhost:8080', 'desktop');
await desktop.connect();
```

**Phone Client:**
```javascript
const RemoteControlClient = require('./client-example.js');
const phone = new RemoteControlClient('ws://localhost:8080', 'phone');
await phone.connect();
phone.sendCommand('mouse-move', { x: 100, y: 100 });
```

## API Endpoints

- `GET /api/status` - Get server status and connected devices
- `GET /api/health` - Health check
- `WS /` - WebSocket connection endpoint

## Message Protocol

### Register Device
```json
{
  "type": "register",
  "deviceType": "phone|desktop"
}
```

### Send Command
```json
{
  "type": "command",
  "command": "mouse-move|click|key-press",
  "payload": { ... }
}
```

### Status Request
```json
{
  "type": "status-request"
}
```

## Testing

Run the example with both phone and desktop clients:

```bash
npm start &
node client-example.js desktop &
node client-example.js phone
```

## Supported Commands

- `mouse-move` - Move cursor to position
- `click` - Click mouse button
- `key-press` - Press keyboard key
- `type` - Type text