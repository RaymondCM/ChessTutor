//By using module.export this information is accessable directly from the application entry-point (server.js)
//This is the location of the MongoD server, on local you must be running it using the command 'mongod'
//You also must have a database called ChessTutor, it is using port 27017 because that is the default 
//port mongo uses. Database is hosted on a free platform called mlabs (will cost eventually) 
//can use local server but i thought this would be better (alot slower)

module.exports = {
	//'url': 'mongodb://localhost:27017/ChessTutor'
	'url': 'mongodb://raymondkirk:chesstutorj789@ds023064.mlab.com:23064/chesstutor'
};