var fs = require('fs');
var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, 'client', {
	maxAge: '1d'
})));

app.get('/', function (req, res) {
	res.sendfile('client/index.html');
});

app.get('/getThemes', function (req, res) {

	fs.readFile('./client/themes/themes.json', 'utf8', function (err, data) {
		if (err) throw err;
		res.send(data);
	});

});

var multiplayer = io.of('/multiplayer-chess');
var users = 0;

multiplayer.on('connection', function (client) {

	client.on('disconnect', function () {
		console.log(client.id + ' disconnected');
	});

	client.on('join', function (roomID) {
		client.join(roomID);

		client.broadcast.to(roomID).emit('game-id', client.id);
	});

	console.log(client.id + " connected.");
});

multiplayer.emit('Currently in multiplayer-chess lobby', 'everyone!');

io.on('connection', function (socket) {
	socket.on('disconnect', function () {
		console.log(socket.id + ' disconnected');
	});

	socket.on('chess move', function (msg) {
		io.sockets.connected[msg[2]].emit('chess moved', msg);
	});

	socket.on('join', function (roomID) {
		var room = io.sockets.adapter.rooms[roomID];
		if (typeof room === 'undefined') {
			socket.join(roomID);
			io.sockets.connected[socket.id].emit("join-status", [1, 'w']);

			console.log("1" + " in " + roomID);
		} else if (room.length < 2) {
			socket.join(roomID);
			io.sockets.connected[socket.id].emit("join-status", [room.length, 'b']);

			console.log(room.length + " in " + roomID);
		} else {
			io.sockets.connected[socket.id].emit('error', "Max Clients Reached");
		}

		io.sockets.connected[socket.id].emit('game-id', socket.id);
	});

	socket.on('game-ready', function (roomID) {
		io.in(roomID).emit('game-ready', io.sockets.adapter.rooms[roomID].sockets);
	});

	socket.emit(socket.id);
	console.log(socket.id + " connected");
	socket.join(socket.id);
});

http.listen(process.env.PORT || 3000, function () {
	console.log('listening on *:3000');
});