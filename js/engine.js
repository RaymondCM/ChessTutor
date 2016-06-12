/* Stockfish Globals */
var stockfishEngine = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker('js/opensource/stockfish.js');
var lastPonder = "";

stockfishEngine.onmessage = function (event) {

	if (event.data.toString().substr(0, 8) !== 'bestmove') {
		if (event.data.toString().substr(0, 10) == 'info depth')
			lastPonder = event.data;
		return;
	}

	console.log(getScore(lastPonder));

	var side = game.turn(),
		move = event.data.substring(9, 13);

	$("#suggestedMove").html("SUGGESTED MOVE FOR " + side + ": " + move);
	//console.log(" * Turn: " + (turnCount === 0 ? "1" : Math.floor(turnCount / 2)) + " Side: " + side + " Move: " + move);

	//Make opponent moves
	if (!game.game_over() && cb_autoPlay || (game_pve && (game_playerSide != side))) {
		cb_autoPlayMove = setTimeout(MovePiece, cb_autoPlayDelay, move.substr(0, 2), move.substr(2, 4));
	}
}

//Format string for stockfishEngine message
function AskEngine(fen, depth) {
	stockfishEngine.postMessage("position fen " + fen);
	stockfishEngine.postMessage((sf_timeOverDepth ? "go movetime " : "go depth ") + depth);
}

function getScore(a) {
	infoToObj = function (a) {
		var b = a.split(" "),
			c = {};
		for (var e = 0, d = ""; e < b.length; e++) {
			if (b[e].match(/[-0-9]+/)) {
				c[d] = b[e];
				d = "";
			} else
				d = (d == "" ? b[e] : d + '_' + b[e]);
		}

		return c;
	};

	var msgObj = infoToObj(a);

	console.log(msgObj);

	sf_score = (msgObj.score_cp ? msgObj.score_cp : msgObj.score_mate);
	return (msgObj.score_cp ? "Centipawn Score: " : "Mate Score: ") + sf_score;
}