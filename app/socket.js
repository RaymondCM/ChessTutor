module.exports = function (io) {

	io.on('connection', function (socket) {

		socket.emit('client-id', [socket.id, "No Room"]);
		console.log(socket.id + " connected");

		//Join a room with your ID
		//socket.join(socket.id);
	});

};