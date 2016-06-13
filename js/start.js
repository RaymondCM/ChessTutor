$(document).ready(function () {
	/*
	    GLOBAL VARIABLES
	*/
	ct_debug = true;

	cb_shapes = {
		Square: "border-radius: 0px;",
		RoundedSquare: "border-radius: 10px;",
		Circle: "border-radius: 50px;",
		Skew: "-webkit-transform: rotate(-45deg); - moz - transform: rotate(-45 deg); - ms - transform: rotate(-45 deg); - o - transform: rotate(-45 deg);transform: rotate(-45 deg); - webkit - transform - origin: 0 100 % ; - moz - transform - origin: 0 100 % ; - ms - transform - origin: 0 100 % ; - o - transform - origin: 0 100 % ;transform - origin: 0 100 % ;",
		Diamond: "-webkit-transform: rotate(-45deg); - moz - transform: rotate(-45 deg); - ms - transform: rotate(-45 deg); - o - transform: rotate(-45 deg);transform: rotate(-45 deg); - webkit - transform - origin: 0 100 % ; - moz - transform - origin: 0 100 % ; - ms - transform - origin: 0 100 % ; - o - transform - origin: 0 100 % ;transform - origin: 0 100 % ;",
		DiamondIMGFix: "-webkit-transform: rotate(45deg); - moz - transform: rotate(45 deg); - ms - transform: rotate(45 deg); - o - transform: rotate(45 deg);transform: rotate(45 deg); - webkit - transform - origin: 0 100 % ; - moz - transform - origin: 0 100 % ; - ms - transform - origin: 0 100 % ; - o - transform - origin: 0 100 % ;transform - origin: 0 100 % ;"
	};
	//Eventually enable this obj to be loaded from a file on the server (and/or user account)
	var cb_themes = [{
		name: "default",
		whiteSquare: "#ffeccc",
		whiteSquareText: "#8d5b36",
		blackSquare: "#8d5b36",
		blackSquareText: "#ffeccc",
		whitePossiblePlaces: "rgba(210, 211, 210, 0.05)",
		permWhitePossiblePlaces: "rgba(245, 255, 0, 0.55)",
		blackPossiblePlaces: "rgba(210, 211, 210, 0.15)",
		permBlackPossiblePlaces: "rgba(245, 255, 0, 0.55)",
		boardShape: "Square"
    }, {
		name: "whacky",
		whiteSquare: "#ffccf5",
		whiteSquareText: "##00f7f7",
		blackSquare: "#00f7f7",
		blackSquareText: "#ffccf5",
		whitePossiblePlaces: "rgba(245, 255, 0, 0.55)",
		permWhitePossiblePlaces: "rgba(245, 255, 0, 0.55)",
		blackPossiblePlaces: "rgba(245, 255, 0, 0.55)",
		permBlackPossiblePlaces: "rgba(245, 255, 0, 0.55)",
		boardShape: "Skew"
    }];

	/* GAME CONFIG */
	game_pve = true;
	game_playerSide = 'w';

	/* CHESS BOARD */
	cb_autoPlayMove = setTimeout(function () {}, 0);
	cb_currentTheme = cb_themes[0];
	cb_autoPlay = false;
	cb_autoPlayDelay = 400;
	cb_fenHistoryMaxLength = 10;
	cb_permHighlighted = ["a6"];
	cb_counterScaleMarkings = 2;

	/* STOCKFISH */
	sf_timeOverDepth = false;
	sf_searchTime = '3000';
	sf_searchDepth = '1';
	sf_scoreWhite = 1;
	sf_scoreBlack = -1;
	//Force evaluation at every depth (much better centipawn results) slower results
	sf_accurateCentipawns = true;

	/* HTML */
	gui_blackCapturedId = "blackCaptured";
	gui_whiteCapturedId = "whiteCaptured";
	gui_scoreBlackId = "blackScore";
	gui_scoreWhiteId = "whiteScore";

	gui_capturedPieceSize = "50px";

	dir_pieceImages = "img/chesspieces/drawn/";
	dir_pieceImagesExtension = ".png";

	average = [];
	$("#testBtn").click(function () {
		var total = 0;
		for (i = 0; i < average.length; i++)
			total += average[i];
		console.log(total / average.length);
	});

	gui_scorePlayerId = "relativeScore";

	gui_capturedPieceSize = "50px";

	dir_pieceImages = "img/chesspieces/wikipedia/";
	dir_pieceImagesExtension = ".png";

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

});