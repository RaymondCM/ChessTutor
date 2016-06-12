function Init_Chessboard() {

	turnCount = 0;
	fenHistory = [];

	SetTheme(cb_currentTheme);

	if (!ct_debug)
		$('#Debug').css('display', 'none');

	board = "";
	game = new Chess();

	var pieces = {
		K: "King",
		N: "Knight",
		P: "Pawn",
		B: "Bishop",
		Q: "Queen",
		R: "Rook"
	};

	// do not pick up pieces if the game is over
	// only pick up pieces for the side to move
	var onDragStart = function (source, piece, position, orientation) {
		if (game.game_over() === true ||
			(game.turn() === 'w' && piece.search(/^b/) !== -1) ||
			(game.turn() === 'b' && piece.search(/^w/) !== -1) ||

			(game.turn() !== game_playerSide)) {
			return false;
		}
	};

	var removeHighlighting = function () {
		$('#Chessboard .square-55d63').css('background', '');
		board.highlightSquare(cb_permHighlighted, true);
	};

	highlightSquare = function (square, aiHighlight) {
		var colourWhite, colourBlack;

		if (!aiHighlight) {
			colourWhite = cb_currentTheme.whitePossiblePlaces;
			colourBlack = cb_currentTheme.blackPossiblePlaces;
		} else {
			colourWhite = cb_currentTheme.permWhitePossiblePlaces;
			colourBlack = cb_currentTheme.permBlackPossiblePlaces;
		}

		var squareEl = $('#Chessboard .square-' + square);

		var background = squareEl.hasClass('black-3c85d') === true ? colourBlack : colourWhite;

		squareEl.css('background', background);
	};

	var onMouseoverSquare = function (square, piece) {
		// get list of possible moves for this square
		var moves = game.moves({
			square: square,
			verbose: true
		});

		var regex = new RegExp("/^" + game_playerSide + "/");
		if (game.turn() !== game_playerSide) {
			return;
		}

		// exit if there are no moves available for this square
		if (moves.length === 0) return;

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
		board.position(game.fen());
	};

	var cfg = {
		draggable: true,
		position: 'start',
		onDragStart: onDragStart,
		onDrop: MovePiece,
		onMouseoutSquare: onMouseoutSquare,
		onMouseoverSquare: onMouseoverSquare,
		onSnapEnd: onSnapEnd
	};

	board = ChessBoard('Chessboard', cfg);
	board.orientation((game_playerSide === 'w') ? 'white' : 'black');

	turnCount++;
	updateStatus();

	board.highlightSquare = function (s, b) {
		for (x in s) {
			highlightSquare(s[x], b);
		}
	};

	board.highlightSquare(cb_permHighlighted, true);
}

function MovePiece(from, to) {

	var move = game.move({
		from: from,
		to: to,
		promotion: 'q'
	});

	if (move === null) return 'snapback';

	checkForTaken(board.position());
	board.position(game.fen());
	turnCount++;

	updateStatus();
}

function updateStatus() {
	checkForTaken(board.position());
	updateDebugLog();



	if (fenHistory.lengh <= cb_fenHistoryMaxLength)
		fenHistory.push(game.fen());
	else {
		fenHistory.shift();
		fenHistory.push(game.fen());
	}

	AskEngine(game.fen(), sf_searchDepth);
}

function piece(code) {
	this.colourLetter = code.substr(0, 1);
	this.nameletter = code.substr(1, 2);
	this.colorWord = code.substr(0, 1) == 'w' ? 'White' : 'Black';
	this.nameWord = pieces[code.substr(1, 2)];
}

function checkForTaken(boardPosition) {
	var pieceCount = {
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
			pieceCount[boardPosition[property]]++;

		//Count differences to expected counts
	pieceCount.wP = (-1) * (pieceCount.wP - 8);
	pieceCount.bP = (-1) * (pieceCount.bP - 8);
	pieceCount.bR = (-1) * (pieceCount.bR - 2);
	pieceCount.bN = (-1) * (pieceCount.bN - 2);
	pieceCount.bB = (-1) * (pieceCount.bB - 2);
	pieceCount.bQ = (-1) * (pieceCount.bQ - 1);
	pieceCount.bK = (-1) * (pieceCount.bK - 1);
	pieceCount.wR = (-1) * (pieceCount.wR - 2);
	pieceCount.wN = (-1) * (pieceCount.wN - 2);
	pieceCount.wB = (-1) * (pieceCount.wB - 2);
	pieceCount.wQ = (-1) * (pieceCount.wQ - 1);
	pieceCount.wK = (-1) * (pieceCount.wK - 1);

	//Remove old pieces
	var blackNode = document.getElementById(gui_blackCapturedId);
	while (blackNode.firstChild)
		blackNode.removeChild(blackNode.firstChild);
	var whiteNode = document.getElementById(gui_whiteCapturedId);
	while (whiteNode.firstChild)
		whiteNode.removeChild(whiteNode.firstChild);
	whiteNode.innerHTML = 'CAPTURED WHITE PIECES';
	blackNode.innerHTML = 'CAPTURED BLACK PIECES';

	var p = pieceCount;
	var blackScore = p.wP + (p.wB * 3) + (p.wK * 3) + (p.wR * 4) + (p.wQ) + (p.wK * 0);
	var whiteScore = p.bP + (p.bB * 3) + (p.bK * 3) + (p.bR * 4) + (p.bQ) + (p.bK * 0);
	var divBlackScore = document.getElementById(gui_scoreBlackId);
	var divWhiteScore = document.getElementById(gui_scoreWhiteId);
	console.log(blackScore);
	console.log(whiteScore);
	divBlackScore.InnerHTML = "Black Score: " + toString(blackScore);
	divWhiteScore.InnerHTML = "White Score: " + toString(whiteScore);


	for (var property in pieceCount)
		if (pieceCount.hasOwnProperty(property)) {
			var isWhite = property.substr(0, 1) == 'w';
			var div = isWhite ? document.getElementById(gui_whiteCapturedId) : document.getElementById(gui_blackCapturedId);
			drawImg("img/chesspieces/wikipedia/" + property + ".png", div, pieceCount[property]);
		}
}

function drawImg(src, container, count) {
	for (var i = 0; i < count; i++) {
		img = document.createElement("img");
		img.src = src;
		img.style.height = gui_capturedPieceSize;
		img.style.width = gui_capturedPieceSize;
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
	alterCSS(".square-55d63", cb_shapes[cb_currentTheme.boardShape]);

	if (cb_shapes[cb_currentTheme.boardShape] == cb_shapes["Diamond"])
		alterCSS(".square-55d63 img", cb_shapes["DiamondIMGFix"]);

	alterCSS('.white-1e1d7', theme.whiteSquare, theme.whiteSquareText);
	alterCSS('.black-3c85d', theme.blackSquare, theme.blackSquareText);
}

function alterCSS(className, css1, css2) {
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
}