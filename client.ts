import * as WS from 'ws';
import config from './config.json';

const port = config.port;
const ip = config.hostname;
const ws = new WS.WebSocket('ws://'+ip+':'+port);
const debug: boolean = process.argv.includes('--debug');

ws.on('open', function open() {
    console.log('Connected to the server');
    const joinRoomMessage = JSON.stringify({
        type: 'JOIN_ROOM',
        roomId: 'myRoom',
        data: '',
    });
    ws.send(joinRoomMessage);
    if(debug) console.log('Sent join room message');
});

ws.on('message', function incoming(data) {
    console.log('Received message:', data);
});

ws.on('close', function close() {
    console.log('Disconnected from the server');
});

ws.on('error', function error(err) {
    console.log('An error occurred:', err);
});

function sendMessage(type: string, roomId: string, data: string) {
    const message = JSON.stringify({ type, roomId, data });
    ws.send(message);
    if(debug) console.log(`Sent message: ${message}`);
}