$(document).foundation();

$(document).ready(function () {
	/*
	    GLOBAL VARIABLES
	*/
	ct_debug = false;

	/* GAME CONFIG */
	game_playerSide = 'w';
	game_aiMode = 0; //0: PVE, 1: AUTO, 2: PVP
	game_gotOponent = false;

	/* CHESS BOARD */
	cb_autoPlayMove = setTimeout(function () {}, 0);
	cb_autoPlayDelay = 0;
	cb_fenHistoryMaxLength = 10;
	cb_permHighlighted = [];
	cb_displayMarkers = false;
	cb_counterScaleMarkings = 2;
	cb_pieceTheme = metro_piece_theme;
	cb_boardTheme = metro_board_theme;

	/* STOCKFISH */
	sf_timeOverDepth = false;
	sf_searchTime = '3000';
	sf_searchDepth = '10';
	sf_scoreWhite = 1;
	sf_scoreBlack = -1;
	//Force evaluation at every depth (much better centipawn results) slower results
	sf_accurateCentipawns = false;

	/* HTML */
	gui_capturedPieceSize = "50px";


	Init_Stockfish();
	Init_Chessboard();

	/* BIND FUNCTIONS */
	$("#undoBtn").click(function () {
		clearTimeout(cb_autoPlayMove);
		game.undo();
		game.undo();

		board.position(game.fen(), false);
		updateStatus();

		if (turnCount > 1)
			turnCount -= 2;

		checkForTaken(board.position());
	});

	socket_sessionID = null;
	socket_oponentID = null;

	$("#resetBtn").click(function () {
		resetGame(game_aiMode);
	});

	$("#pveBtn").click(function () {
		resetGame(0);
		$("#gameMode>a.success").removeClass("success");
		$(this).addClass("success");
	});

	$("#eveBtn").click(function () {
		resetGame(1);
		$("#gameMode>a.success").removeClass("success");
		$(this).addClass("success");
	});

	$("#pvpBtn").click(function () {
		resetGame(2);
		$("#gameMode>a.success").removeClass("success");
		$(this).addClass("success");
	});

	socket = io();
	socket.on('game-id', function (message) {
		socket_sessionID = message;
		document.getElementById("sessionID").innerHTML = socket_sessionID;
	});

	socket.on('error', function (error) {
		console.log("Error: " + error);
	});

	socket.on('join-status', function (message) {
		game_playerSide = message[1];
		board.orientation(((game_playerSide == 'w') ? "white" : "black"));
		if (message[0] === 2) {
			socket.emit("game-ready", $("#joinText").val());
		}
		console.log("Join Status: " + message.join("=>"));
	});

	socket.on('game-ready', function (roomSockets) {
		console.log("Ready.");

		for (var name in roomSockets) {
			if (socket_sessionID != name)
				socket_oponentID = name;
		}

		game_gotOponent = true;
	});

	socket.on("chess moved", function (msg) {
		console.log("Recieving From->To:" + msg[0] + msg[1]);

		MovePiece(msg[0], msg[1]);
	});

	$("#joinBtn").click(function () {
		socket.emit("join", $("#joinText").val());
	});
});

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
//---------------------------B    O    A    R    D-----------------------------
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------


function Init_Chessboard() {

	turnCount = 0;
	fenHistory = [];

	if (cb_displayMarkers) drawScale(cb_counterScaleMarkings);

	if (!ct_debug)
		$('#Debug').css('display', 'none');

	board = "";
	game = new Chess();

	// do not pick up pieces if the game is over
	// only pick up pieces for the side to move
	var onDragStart = function (source, piece, position, orientation) {
		if (game.game_over() === true ||
			(game.turn() === 'w' && piece.search(/^b/) !== -1) ||
			(game.turn() === 'b' && piece.search(/^w/) !== -1) || game_aiMode === 1 || game.turn() !== game_playerSide ||
			(game_aiMode === 2 && !game_gotOponent)) {
			return false;
		}
	};

	var removeHighlighting = function () {
		$('#Chessboard .square-55d63').css('background-color', '');

		var wcol = cfg.boardTheme[0];
		var bcol = cfg.boardTheme[1];

		$(".white-1e1d7").css("background-color", wcol)
		$(".white-1e1d7").css("color", bcol)

		$(".black-3c85d").css("background-color", bcol)
		$(".black-3c85d").css("color", wcol)

		if (cb_permHighlighted.length !== 0)
			board.highlightSquare(cb_permHighlighted, true);
	};

	var onMouseoverSquare = function (square, piece) {
		if (game_aiMode === 2 && !game_gotOponent)
			return false;
		// get list of possible moves for this square
		var moves = game.moves({
			square: square,
			verbose: true
		});

		if (game.turn() !== game_playerSide || game_aiMode === 1 || moves.length === 0) return;

		// highlight the square they moused over
		highlightSquare(square, false);
		// highlight the possible squares for this piece
		for (var i = 0; i < moves.length; i++) {
			highlightSquare(moves[i].to, false);
		}
	};

	var onMouseoutSquare = function (square, piece) {
		removeHighlighting();
	};

	var onSnapEnd = function () {
		board.position(game.fen(), false);
	};

	var cfg = {
		draggable: true,
		position: 'start',
		onDragStart: onDragStart,
		onDrop: MovePiece,
		onMouseoutSquare: onMouseoutSquare,
		onMouseoverSquare: onMouseoverSquare,
		onSnapEnd: onSnapEnd,
		pieceTheme: cb_pieceTheme,
		boardTheme: cb_boardTheme
	};

	$
	board = ChessBoard('Chessboard', cfg);
	board.orientation((game_playerSide === 'w') ? 'white' : 'black');

	turnCount++;
	updateStatus();

	board.highlightSquare = function (s, b) {
		for (x in s) {
			highlightSquare(s[x], b);
		}
	};

	//Method to highlight squares
	//board.highlightSquare(cb_permHighlighted, true);

	//Resize with window
	$(window).resize(board.resize);
}

function highlightSquare(square, aiHighlight) {
	var squareEl = $('#Chessboard .square-' + square);
	squareEl.css('background', squareEl.hasClass('black-3c85d') === true ? cb_boardTheme[2] : cb_boardTheme[3]);
}

function resetGame(mode) {
	game.reset();
	board.position(game.fen(), false);
	updateStatus();
	turnCount = 0;
	checkForTaken(board.position());
	game_aiMode = mode;

	if (game_aiMode === 2)
		$("#joinRooms :input").attr("disabled", false);
	else
		$("#joinRooms :input").attr("disabled", true);
}

function MovePiece(from, to) {

	//	if (game_aiMode === 2)
	//		game_playerSide = (game_playerSide === 'w' ? 'b' : 'w');

	var move = game.move({
		from: from,
		to: to,
		promotion: 'q'
	});

	if (move === null) return 'snapback';

	//If playing online and not your turn send move to update oponent
	//Game !== player side because game side changed on game.move != null
	if (game_aiMode === 2 && game_gotOponent && game.turn() !== game_playerSide) {
		console.log("Sending From->To:" + from + to);
		socket.emit("chess move", [from, to, socket_oponentID]);
	}

	board.position(game.fen(), false);
	turnCount++;
	updateStatus();
}

function updateStatus() {

	checkForTaken(board.position());
	if (ct_debug) updateDebugLog();

	if (fenHistory.lengh <= cb_fenHistoryMaxLength)
		fenHistory.push(game.fen());
	else {
		fenHistory.shift();
		fenHistory.push(game.fen());
	}

	if (game_aiMode !== 2)
		AskEngine(game.fen(), sf_timeOverDepth ? sf_searchTime : sf_searchDepth);
}

function updateScale(depth) {
	var doc = document,
		wScore = sf_scoreWhite,
		bScore = sf_scoreBlack,
		rawRange = [bScore, wScore],
		//Get Min and Max Values From Array (Use 0 instead of Math because 3 bytes cheaper)
		min = Math.min.apply(0, rawRange),
		max = Math.max.apply(0, rawRange);

	//Calculate Min and Max boundrys (for -80 and 720 would give -100 800)
	if (min != 0) {
		var magnitude = Math.pow(10, Math.floor(Math.log(Math.abs(min)) / Math.LN10));
		min = Math.floor(min / magnitude) * magnitude;
	}

	if (max != 0) {
		var magnitude = Math.pow(10, Math.floor(Math.log(Math.abs(max)) / Math.LN10));
		max = Math.ceil(max / magnitude) * magnitude;
	}

	doc.getElementById("advLeft").innerHTML = min;
	doc.getElementById("advMid").innerHTML = min + ((max - min) / 2);
	doc.getElementById("advRight").innerHTML = max;

	//Calculate Percantage of range scores fall
	var percOfRangeWhite = ((wScore - min) / (max - min)) * 100;
	var percOfRangeBlack = ((bScore - min) / (max - min)) * 100;
	//var zeroPosition = ((0.00000000001 - min) / (max - min)) * 100;

	//Set width equal to percantage of range the scores occupy
	doc.getElementById("advMarkerWhite").style.width = percOfRangeWhite + "%";
	doc.getElementById("advMarkerBlack").style.width = percOfRangeBlack + "%";
	doc.getElementById("advMarkerWhiteText").innerHTML = wScore;
	doc.getElementById("advMarkerBlackText").innerHTML = bScore;
}

function drawScale(depth) {
	var doc = document,
		divMarkers = ["advLower", "advLowerMid", "advUpperMid", "advUpper"],
		frag = doc.createDocumentFragment();

	for (var i = 0; i < divMarkers.length; i++) {
		var div = doc.createElement('div');
		div.className = "advMarkers " + divMarkers[i] + " adv80";
		frag.appendChild(div);
	}

	var childNodes = frag.childNodes,
		depthElements = [];

	for (var x = 0; x < depth; x++) {
		depthElements = [];
		for (var i = 0; i < childNodes.length; i++) {
			for (var j = 0; j < divMarkers.length; j++) {
				var div = doc.createElement('div');
				div.className = "advMarkers " + divMarkers[j] + " adv55";
				childNodes[i].appendChild(div);
				depthElements.push(div);
			}
		}
		childNodes = depthElements;
	}

	doc.getElementById("advScale").appendChild(frag);
	doc.getElementById("advCounter").style.display = "inline-block";
}


function checkForTaken(boardPosition) {
	var doc = document;
	// p = Piece Count variable
	var p = {
		wQ: 0,
		wR: 0,
		wB: 0,
		wN: 0,
		wP: 0,
		wK: 0,
		bQ: 0,
		bR: 0,
		bB: 0,
		bN: 0,
		bP: 0,
		bK: 0
	};

	//Tally each piece
	for (var property in boardPosition)
		if (boardPosition.hasOwnProperty(property))
			p[boardPosition[property]]++;

		//Count differences to expected counts
	p.bP = 8 - p.bP;
	p.bR = 2 - p.bR;
	p.bN = 2 - p.bN;
	p.bB = 2 - p.bB;
	p.bQ = 1 - p.bQ;
	p.bK = 1 - p.bK;

	p.wP = 8 - p.wP;
	p.wR = 2 - p.wR;
	p.wN = 2 - p.wN;
	p.wB = 2 - p.wB;
	p.wQ = 1 - p.wQ;
	p.wK = 1 - p.wK;

	var blackScore = p.wP + (p.wB * 3) + (p.wN * 3) + (p.wR * 4) + (p.wQ * 9);
	var whiteScore = p.bP + (p.bB * 3) + (p.bN * 3) + (p.bR * 4) + (p.bQ * 9);
	relativeScore = (game_playerSide == 'w') ? (whiteScore - blackScore) : (blackScore - whiteScore);

	if (cb_displayMarkers) updateScale();

	//Remove old pieces and score  
	var capturedBlack = doc.getElementById("blackCaptured");
	var capturedWhite = doc.getElementById("whiteCaptured");

	doc.getElementById("blackScore").innerHTML = "BLACK SCORE: " + blackScore;
	doc.getElementById("whiteScore").innerHTML = "WHITE SCORE: " + whiteScore;
	doc.getElementById("relativeScore").innerHTML = ((game_playerSide == 'w') ? "WHITE'S" : "BLACK'S") + " RELATIVE SCORE: " + relativeScore;

	//Display each taken piece from piece count variable p
	capturedBlack.innerHTML = 'CAPTURED BLACK PIECES: ';
	capturedWhite.innerHTML = 'CAPTURED WHITE PIECES: ';

	for (var property in p)
		drawImg(cb_pieceTheme(property), (property.charAt(0) == 'w') ? capturedWhite : capturedBlack,
			p[property]);

}

function drawImg(src, container, count) {
	var img = document.createElement("img");
	img.src = src;
	img.style.height = gui_capturedPieceSize;
	img.style.width = gui_capturedPieceSize;

	for (var i = 0; i < count; i++) {
		container.appendChild(img);
	}
}

function updateDebugLog() {
	var status = '',
		check = '',
		checkmate = '';

	var moveColor = (game.turn() === 'b' ? "Black" : "White");

	// checkmate?
	if (game.in_checkmate() === true) {
		checkmate = moveColor;
	} else if (game.in_draw() === true) {
		status = 'DRAW';
	} else {
		status = moveColor;
		if (game.in_check() === true) {
			check = moveColor;
		}
	}

	$('#status').html("FEN: " + game.fen() + "<br><br>");
	$('#fen').html("TURN: " + status);
	$('#check').html("COLOUR IN CHECK: " + check);
	$('#checkmate').html("COLOUR IN CHECKMATE: " + checkmate);
}

function SetTheme(theme) {
	var alterCSS = (function (className, css1, css2) {
		var classCSS = (typeof css2 === 'undefined' || css2 === "") ? css1 : "background-color: " + css1 + "; color:" + css2 + ";";

		//Remove Inline Style/Attr
		if ($(className).removeProp) {
			$(className).removeProp('background-color');
		} else {
			$(className).removeAttr('background-color');
		}

		//Create a hidden div for storing CSS information (add to eof)
		var tempCSSContainer = $('#temp-css-store-c34jw2-f32r12');
		if (tempCSSContainer.length == 0) {
			var tempCSSContainer = $('<div id="temp-css-store-c34jw2-f32r12"></div>');
			tempCSSContainer.hide();
			tempCSSContainer.appendTo($('body'));
		}

		//Create a Div for each class element found with className and append to HTML
		classContainer = tempCSSContainer.find('div[data-class="' + className + '"]');
		if (classContainer.length == 0) {
			classContainer = $('<div data-class="' + className + '"></div>');
			classContainer.appendTo(tempCSSContainer);
		}

		//Add the additional style to the parent Div and Style it with overridden CSS
		classContainer.html('<style>' + className + ' {' + classCSS + '}</style>');
	});

	alterCSS(".square-55d63", cb_currentTheme.boardShape);
	alterCSS('.white-1e1d7', theme.whiteSquare, theme.whiteSquareText);
	alterCSS('.black-3c85d', theme.blackSquare, theme.blackSquareText);
}


//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
//-------------------------E    N    G    I    N    E--------------------------
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
/* Stockfish Globals */
var stockfishEngine = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker('/js/vendor/stockfish.js');
var lastPonder = "";

function Init_Stockfish() {
	if (sf_accurateCentipawns)
		stockfishEngine.postMessage("setoption name MultiPV value 50");

	stockfishEngine.onmessage = function (event) {
		//console.log(event.data);
		if (event.data.toString().substr(0, 8) !== 'bestmove') {
			if (event.data.toString().substr(0, 10) == 'info depth')
				lastPonder = event.data;
			return;
		}

		getScore(lastPonder);

		var side = game.turn(),
			move = event.data.substring(9, 13);

		$("#suggestedMove").html("SUGGESTED MOVE FOR " + side + ": " + move);
		//console.log(" * Turn: " + (turnCount === 0 ? "1" : Math.floor(turnCount / 2)) + " Side: " + side + " Move: " + move);

		//Make opponent moves
		if (!game.game_over() && (game_aiMode === 1) || !game.game_over() && (game_aiMode === 0) && (game_playerSide != side)) {
			cb_autoPlayMove = setTimeout(MovePiece, cb_autoPlayDelay, move.substr(0, 2), move.substr(2, 4));
		}
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

	//console.log(msgObj);

	if (game.turn() === 'w' && msgObj.hasOwnProperty("score_cp"))
		sf_scoreWhite = msgObj.score_cp;
	else if (msgObj.hasOwnProperty("score_cp"))
		sf_scoreBlack = msgObj.score_cp;

	updateScale();
	return (msgObj.score_cp ? "Centipawn Score: " : "Mate Score: ") + game.turn() + (game.turn() === 'w' ? sf_scoreWhite : sf_scoreBlack);
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
//--------------------U    T    I    L    I    T    Y--------------------------
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

function speedTestFunction(method, iterations, args, context) {

	var time = 0;
	var timer = function (action) {
		var d = Date.now();
		if (time < 1 || action === 'start') {
			time = d;
			return 0;
		} else if (action === 'stop') {
			var t = d - time;
			time = 0;
			return t;
		} else {
			return d - time;
		}
	};

	var result = [];
	var i = 0;
	timer('start');
	while (i < iterations) {
		result.push(method.apply(context, args));
		i++;
	}

	var execTime = timer('stop');

	if (typeof console === "object") {
		console.log("Mean execution time was: ", execTime / iterations);
		console.log("Sum execution time was: ", execTime);
		console.log("Result of the method call was:", result[0]);
	}

	return execTime;
};