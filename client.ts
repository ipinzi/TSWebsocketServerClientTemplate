import * as WS from 'ws';
import config from './config.json';
import * as readline from 'readline';

//Setup input read line
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

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

    DoInput();
});

function DoInput(){
    rl.question(`Type your message: `, (message: string) => {
        sendMessage('BROADCAST_IN_ROOM','myRoom',message);
        //rl.close();
    });
}

ws.on('message', function incoming(data) {
    console.log('Received message:', data.toString());
    DoInput();
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