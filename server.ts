import * as WS from 'ws';
import * as os from 'os';
import config from './config.json';

declare module 'ws' {
    interface WebSocket {
        isAlive?: boolean;
        roomId?: string;
    }
}

const port = config.port;
const server = new WS.Server({ port });
const debug: boolean = process.argv.includes('--debug');

let rooms: { [key: string]: WS.WebSocket[] } = {};

console.log('WebSocket Server Initializing...');

server.on('listening', () => {
    const networkInterfaces = os.networkInterfaces();
    const ip = networkInterfaces['eth0'] && networkInterfaces['eth0'][0] ? networkInterfaces['eth0'][0].address : 'localhost';
    console.log(`Server Active at IP: ${ip}:${port}`);
    if(debug) console.log(`Server is in DEBUG MODE. Logs will be more verbose.`);
});

server.on('connection', (ws:  WS.WebSocket) => {
    console.log('New connection established');
    ws.isAlive = true;

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.on('message', (message: string) => {
        const { cmd, roomId, data } = JSON.parse(message);

        console.log(cmd)

        switch (cmd) {
            case 'JOIN_ROOM':
                ws.roomId = roomId;
                rooms[roomId] = [...(rooms[roomId] || []), ws];
                console.log(`Connection joined room: ${roomId}`);
                break;
            case 'LEAVE_ROOM':
                rooms[roomId] = (rooms[roomId] || []).filter(socket => socket !== ws);
                console.log(`Connection left room: ${roomId}`);
                break;
            case 'BROADCAST':
                server.clients.forEach(client => {
                    if (client.readyState === WS.OPEN) {
                        client.send(data);
                    }
                });
                if(debug) console.log('Broadcast message to all connections');
                break;
            case 'BROADCAST_IN_ROOM':
                (rooms[roomId] || []).forEach(socket => {
                    if (socket.readyState === WS.OPEN) {
                        socket.send(data);
                    }
                });
                if(debug)console.log(`Broadcast message in room: ${roomId} message ${message}`);
                console.log(data.toString());
                break;
            case 'SEND_TO_CONNECTION':
                if (ws.readyState === WS.OPEN) {
                    ws.send(data);
                }
                if(debug) console.log('Sent message to a specific connection');
                break;
        }
    });

    ws.on('close', () => {
        if (ws.roomId) {
            rooms[ws.roomId] = rooms[ws.roomId].filter(socket => socket !== ws);
            console.log(`Connection closed and removed from room: ${ws.roomId}`);
        }
    });
});

setInterval(() => {
    server.clients.forEach((ws:  WS.WebSocket) => {
        if (!ws.isAlive) return ws.terminate();

        ws.isAlive = false;
        ws.ping(null, undefined);
    });
}, 10000);
