const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

const connectedClients = new Map();
let desktopClient = null;

wss.on('connection', (ws) => {
  const clientId = Math.random().toString(36).substr(2, 9);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'register') {
        if (data.deviceType === 'desktop') {
          desktopClient = { ws, clientId, deviceType: 'desktop' };
          connectedClients.set(clientId, desktopClient);
          ws.send(JSON.stringify({ type: 'registered', clientId, deviceType: 'desktop' }));
          console.log('[Desktop] Connected:', clientId);
        } else if (data.deviceType === 'phone') {
          connectedClients.set(clientId, { ws, clientId, deviceType: 'phone' });
          ws.send(JSON.stringify({ type: 'registered', clientId, deviceType: 'phone' }));
          console.log('[Phone] Connected:', clientId);

          if (desktopClient) {
            desktopClient.ws.send(JSON.stringify({
              type: 'device-connected',
              deviceType: 'phone',
              phoneId: clientId
            }));
          }
        }
      } else if (data.type === 'command') {
        if (desktopClient && desktopClient.ws.readyState === WebSocket.OPEN) {
          desktopClient.ws.send(JSON.stringify({
            type: 'remote-command',
            command: data.command,
            payload: data.payload,
            fromPhone: clientId
          }));
          console.log('[Command]', data.command, 'from', clientId);
        }
      } else if (data.type === 'status-request') {
        ws.send(JSON.stringify({
          type: 'status',
          desktopConnected: !!desktopClient,
          connectedDevices: Array.from(connectedClients.values()).map(c => ({
            id: c.clientId,
            type: c.deviceType
          }))
        }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    connectedClients.delete(clientId);
    if (desktopClient && desktopClient.clientId === clientId) {
      desktopClient = null;
      console.log('[Desktop] Disconnected:', clientId);

      connectedClients.forEach((client) => {
        if (client.deviceType === 'phone' && client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify({ type: 'device-disconnected', deviceType: 'desktop' }));
        }
      });
    } else {
      console.log('[Phone] Disconnected:', clientId);
      if (desktopClient && desktopClient.ws.readyState === WebSocket.OPEN) {
        desktopClient.ws.send(JSON.stringify({
          type: 'device-disconnected',
          deviceType: 'phone',
          phoneId: clientId
        }));
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    server: 'running',
    desktopConnected: !!desktopClient,
    connectedDevices: Array.from(connectedClients.values()).map(c => ({
      id: c.clientId,
      type: c.deviceType
    })),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         Phone-to-Desktop Remote Control Server             ║
╚════════════════════════════════════════════════════════════╝

✓ Server running on port ${PORT}
✓ WebSocket endpoint: ws://localhost:${PORT}
✓ Status API: http://localhost:${PORT}/api/status
✓ Health Check: http://localhost:${PORT}/api/health

Waiting for connections...
  `);
});
