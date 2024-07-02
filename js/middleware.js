const net = require('net');
const WebSocket = require('ws');


let bufferAccumulator = Buffer.alloc(0);
let headerRead = false;
let nChannels, nSamplesPerChunk, dataSize;
const client = new net.Socket();
let isConnected = false;
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
});


function connectToOpenVibe() {
    client.connect(4001, '127.0.0.1', () => {
        console.log('Connected to OpenVibe server');
        isConnected = true;
        headerRead = false; 
    });
    client.on('data', (data) => {
        console.log(`Data received: ${data.length} bytes`);
        bufferAccumulator = Buffer.concat([bufferAccumulator, data]);
        console.log(`Buffer size after concat: ${bufferAccumulator.length} bytes`);
        
        if (!headerRead && bufferAccumulator.length >= 32) { 
            const endianness = bufferAccumulator.readUInt32LE(4);
            nChannels = bufferAccumulator.readUInt32LE(12);
            nSamplesPerChunk = bufferAccumulator.readUInt32LE(16);
            dataSize = nChannels * nSamplesPerChunk * 8;
            headerRead = true;
            console.log(`Header read. Endianness: ${endianness}, Channels: ${nChannels}, Samples per chunk: ${nSamplesPerChunk}`);
            bufferAccumulator = bufferAccumulator.slice(32); 
        }
        while (headerRead && bufferAccumulator.length >= dataSize) {
            processMatrix(bufferAccumulator.slice(0, dataSize), nChannels, nSamplesPerChunk);
            bufferAccumulator = bufferAccumulator.slice(dataSize); 
            console.log(`Buffer size after processing: ${bufferAccumulator.length} bytes`);
        }
    });

    client.on('close', () => {
        console.log('Connection closed');
        isConnected = false;
        client.removeAllListeners();
               reconnect();
    });
    client.on('error', (err) => {
        console.error('Connection error:', err);
        isConnected = false;
        client.removeAllListeners();
        reconnect();
    });
}

function processMatrix(data, nChannels, nSamplesPerChunk) {
    let offset = 0;
    let matrix = '';
    for (let i = 0; i < nChannels; i++) {
        for (let j = 0; j < nSamplesPerChunk; j++) {
            let value = data.readDoubleLE(offset); 
            matrix += `${value}${j === nSamplesPerChunk - 1 ? '\n' : ','}`;
            offset += 8;
        }
    }

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(matrix);
            console.log('Matrix written to WebSocket');
        }
    }
    );
    bufferAccumulator = new Buffer.alloc(0); 
}

function reconnect() {
    if (!isConnected) {
        console.log('Attempting to reconnect...');
        setTimeout(connectToOpenVibe, 1000);
    }
}

connectToOpenVibe();
