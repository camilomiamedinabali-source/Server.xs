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

Server runs on:
- WebSocket: `ws://localhost:8080`
- Web UI: `http://localhost:8080/index.html`
- Mobile: `http://localhost:8080/connect.html`

### Quick Connection with QR Code

1. **Desktop**: Open `http://localhost:8080` in your browser
2. A QR code will be displayed
3. **Phone**: Scan the QR code with your device camera
4. Click the notification or tap the connection link
5. Your phone will connect automatically!

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

## QR Code Features

The server automatically generates a scannable QR code that encodes:
- Server address (auto-detects local IP)
- Port number
- Device connection parameters

### API Endpoints for QR Codes

- `GET /api/qrcode` - Returns QR code as PNG data URL and connection URL
- `GET /api/qrcode/svg` - Returns QR code as SVG

**Example Response:**
```json
{
  "qrCode": "data:image/png;base64,...",
  "connectionUrl": "ws://192.168.1.100:8080?device=phone",
  "host": "192.168.1.100",
  "port": 8080
}
```

### Web Interface

**Desktop Control Panel**: `http://localhost:8080/index.html`
- Display QR code for phone scanning
- Show connected devices in real-time
- Monitor server status
- Refresh connection info

**Mobile Client**: `http://localhost:8080/connect.html`
- Auto-connect via QR code parameters
- Manual server address entry
- Touch-based mouse control pad
- Remote control buttons (arrow keys, click, etc.)

## Supported Commands

- `mouse-move` - Move cursor to position (x, y)
- `click` - Click mouse button (left/right)
- `key-press` - Press keyboard key (Escape, Enter, etc.)
- `type` - Type text string