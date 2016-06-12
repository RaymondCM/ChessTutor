/* Stockfish Globals */
var stockfishEngine = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker('js/opensource/stockfish.js');

//Format string for stockfishEngine message
function AskEngine(fen, depth) {
	stockfishEngine.postMessage("position fen " + fen);
	stockfishEngine.postMessage("go depth " + depth);
}

stockfishEngine.onmessage = function (event) {
	if (event.data.toString().substr(0, 8) !== 'bestmove')
		return;

	var side = game.turn(),
		move = event.data.substring(9, 13);

	$("#suggestedMove").html("SUGGESTED MOVE FOR " + side + ": " + move);
	console.log(" * Turn: " + (turnCount === 0 ? "1" : Math.floor(turnCount / 2)) + " Side: " + side + " Move: " + move);

	//Make opponent moves
	if (!game.game_over() && cb_autoPlay || (game_pve && (game_playerSide != side))) {
		cb_autoPlayMove = setTimeout(MovePiece, cb_autoPlayDelay, move.substr(0, 2), move.substr(2, 4));
	}
}