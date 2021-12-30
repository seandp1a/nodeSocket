const express = require('express');
const ws = require('ws');
const http = require('http');
const { disconnect } = require('process');

const app = express();


app.get('/', function (req, res) {
    res.type('text/plain');
    res.status(200).send('Hello, World.');
})


// const createEchoServer = (server) => {
//     const wsServer = new ws.Server({ server });
//     wsServer.on('connection', (ws, req) => {
//         console.log('連線數', wsServer.clients.size);
//         console.log('ip:', req.connection.remoteAddress);
//         console.log('port:', req.connection.remotePort);
//         ws.on('message', msg => {
//             console.log( typeof(msg), JSON.stringify(msg), JSON.parse(JSON.stringify(msg)));
//             ws.send(msg.toString());
//         });
//         ws.send('connect!!!');
//     });
// };

const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {  // 處理跨域問題
        origin: ["http://localhost:4000", "http://localhost:4200"], // angular項目的啟動端口，默認4200，本人項目的啟動端口為4300，大傢根據自己情況修改
        methods: ["GET", "POST"],
        credentials: true
    }
});
const rooms = {
    room1: 'public',
    room2: 'public',
    room3: 'public'
}
const nicknames={};
io.on('connection', (socket) => {
    console.log('new connection');
    socket.on('setnickname', function (m) {
        console.log('setnickname activated',m)
        if (typeof nicknames[m] === 'undefined') {
            nicknames[m] = { count: 0 };
            socket.emit('nicknamesuccess', m);
            socket['nickname'] = m;
        } else {
            nicknames[m].count++;
            var t = m + '' + nicknames[m].count;
            socket.emit('nicknamefail', t);
            socket['nickname'] = t;
        }
    });
    socket.on('join', function (m) {
        console.log('join activated',m)

        if (checkroom(rooms, m)) {
            socket.join(m);
            socket['room'] = m;
            socket.broadcast.in(socket['room']).emit('system', socket['nickname'] + ' has joined this room.');// 6
            socket.emit('joinroomsuccess', { room: m });// 4
        }
    });
});




// createEchoServer(server);

server.listen(8001, () => {
    console.log('Express started. Listening port 8001...');
});

function checkroom(rooms, room) {
    var ret = false;
    for (var i in rooms) {
        if (room == i && rooms[i] == 'public') {
            ret = true;
        }
    }
    return ret;
}