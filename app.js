var fs = require('fs');
var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.disable("x-powered-by");

//app.use(express.static(path.join(__dirname, 'client', { maxAge: '1d' })));
app.use(express.static(__dirname + '/public', {
	maxAge: '1d'
}));

app.get('/', function (req, res) {
	res.setHeader('Cache-Control', 'client, max-age=31557600');
	res.sendfile('client/index.html');
});

io.on('connection', function (socket) {

	socket.on('disconnect', function () {
		console.log(socket.id + ' disconnected');

		if (socket.roomID !== undefined)
			io.in(socket.roomID).emit('disconnected', "Left");
	});

	socket.on('chess move', function (msg) {
		console.log("Sending moved to " + msg[2] + "\nfrom:" + msg[0] + " to:" + msg[1]);
		io.sockets.connected[msg[2]].emit('chess moved', msg);
	});

	socket.on('join', function (roomID) {
		//Only allow one room at a time
		if (socket.roomID !== undefined)
			socket.leave(socket.roomID);

		var room = io.sockets.adapter.rooms[roomID];

		if (typeof room === 'undefined') {
			socket.join(roomID);
			socket.roomID = roomID;
			io.sockets.connected[socket.id].emit("join-status", [1, 'w']);
			io.sockets.connected[socket.id].emit('client-id', [socket.id, roomID]);

			console.log("1" + " in " + roomID);
		} else if (room.length < 2) {
			socket.join(roomID);
			socket.roomID = roomID;
			io.sockets.connected[socket.id].emit("join-status", [room.length, 'b']);
			io.sockets.connected[socket.id].emit('client-id', [socket.id, roomID]);

			console.log(room.length + " in " + roomID);
		} else {
			io.sockets.connected[socket.id].emit("join-status", null);
			io.sockets.connected[socket.id].emit('client-id', [socket.id, "ERR:Max-Clients"]);
		}
	});

	socket.on('leave', function (roomID) {
		socket.leave(roomID);
		io.in(roomID).emit('disconnected', "Left");
	});

	socket.on('ready', function (roomID) {
		io.in(roomID).emit('game-ready', getSocketsinRoom(roomID));
	});

	socket.on('reset-game', function (roomID) {
		io.in(roomID).emit('reset-boards');
	});

	socket.on('undomove-game', function (roomID) {
		io.in(roomID).emit('undo-move');
	});


	socket.emit('client-id', [socket.id, "No Room"]);
	console.log(socket.id + " connected");
	//Join a room with your ID
	//socket.join(socket.id);
});

function getSocketsinRoom(roomID) {
	return io.sockets.adapter.rooms[roomID].sockets;
}

http.listen(process.env.PORT || 3000, function () {
	console.log('listening on *:' + http.address().port);
});