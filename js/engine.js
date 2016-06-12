/* Stockfish Globals */
stockfishEngine = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker('js/opensource/stockfish.js');

queryQueue = [];
/*                   */

function Init_Stockfish() {

}

//Query the stockfishEngine from the tutor or opponent
function AskstockfishEngine(source, side, fen) {
	var query = {
		source: source,
		side: side,
		fen: fen,
		move: 'QUERY UNRESOLVED'
	}
	queryQueue.push(query);
	//If first item, send the query straight away
	if (queryQueue.length === 1)
		QuerystockfishEngine(query["fen"], sf_searchDepth);
	else //Stop the stockfishEngine search
	{
		stockfishEngine.postMessage("stop");
		queryQueue[0]['move'] = 'STOP';
	}
}

//Message recieved
stockfishEngine.onmessage = function (event) {
		//When the stockfishEngine outputs 'bestmove' the search has finished
		if ((String(event.data).substring(0, 8) == 'bestmove') && queryQueue[0]) {
			//If no interruption, assign the move info
			if (queryQueue[0].move !== 'STOP')
				queryQueue[0].move = String(event.data).substring(9, 13);
			//Remove the head of the queue
			ReturnQuery(queryQueue.shift());
			//If the queue still has queries, go to next query
			if (queryQueue.length > 0) {
				QuerystockfishEngine(queryQueue[0]["fen"], sf_searchDepth);
			}
		}
	}
	//Format string for stockfishEngine message
function QuerystockfishEngine(fen, depth) {
	stockfishEngine.postMessage("position fen " + fen);
	stockfishEngine.postMessage("go depth " + depth);
}

function ReturnQuery(query) {
	$("#suggestedMove").html("SUGGESTED MOVE FOR " + (query['side'] == "w" ? "White" : "Black") + ": " + query['move']);

	console.log(" * Turn: " + (turnCount === 0 ? "1" : Math.floor(turnCount / 2)) + " Side: " + query['side'] + " Move: " + query['move']);

	if (game.game_over()) return;

	//Make opponent moves
	if (cb_autoPlay || (game_pve && (game_playerSide != query.side))) {
		cb_autoPlayMove = setTimeout(MovePiece, cb_autoPlayDelay, query.move.substr(0, 2), query.move.substr(2, 4));
	}
}