const WebSocket = require('ws');

class RemoteControlClient {
  constructor(serverUrl, deviceType) {
    this.serverUrl = serverUrl;
    this.deviceType = deviceType;
    this.ws = null;
    this.clientId = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.serverUrl);

      this.ws.onopen = () => {
        this.ws.send(JSON.stringify({
          type: 'register',
          deviceType: this.deviceType
        }));
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'registered') {
          this.clientId = data.clientId;
          console.log(`✓ Connected as ${this.deviceType} (ID: ${this.clientId})`);
          resolve(this.clientId);
        } else if (data.type === 'remote-command') {
          console.log(`📱 Received command: ${data.command}`, data.payload);
        } else if (data.type === 'device-connected') {
          console.log(`✓ Device connected: ${data.deviceType}`);
        } else if (data.type === 'device-disconnected') {
          console.log(`✗ Device disconnected: ${data.deviceType}`);
        } else if (data.type === 'status') {
          console.log('Status:', data);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Connection error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('Connection closed');
      };
    });
  }

  sendCommand(command, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'command',
        command,
        payload
      }));
      console.log(`📤 Sent command: ${command}`);
    } else {
      console.error('WebSocket not connected');
    }
  }

  getStatus() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'status-request' }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Example usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const deviceType = args[0] || 'phone';
  const serverUrl = 'ws://localhost:8080';

  const client = new RemoteControlClient(serverUrl, deviceType);

  client.connect().then(() => {
    if (deviceType === 'phone') {
      setTimeout(() => {
        client.sendCommand('mouse-move', { x: 100, y: 100 });
      }, 1000);

      setTimeout(() => {
        client.sendCommand('click', { button: 'left' });
      }, 2000);

      setTimeout(() => {
        client.sendCommand('key-press', { key: 'Escape' });
      }, 3000);

      setTimeout(() => {
        client.getStatus();
      }, 4000);

      setTimeout(() => {
        client.disconnect();
      }, 5000);
    } else {
      console.log('Desktop ready to receive commands...');
      client.getStatus();
    }
  }).catch(error => {
    console.error('Failed to connect:', error);
  });
}

module.exports = RemoteControlClient;
