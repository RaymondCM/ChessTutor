function Init_Chessboard() {

    var board, game = new Chess(),
        statusEl = $('#status'),
        fenEl = $('#fen'),
        pgnEl = $('#pgn'),
        checkEl = $('#check'),
        checkmateEl = $('#checkmate');

    // do not pick up pieces if the game is over
    // only pick up pieces for the side to move
    var onDragStart = function (source, piece, position, orientation) {
        if (game.game_over() === true ||
            (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false;
        }
    };

    var onDrop = function (source, target) {
        // see if the move is legal
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        });

        // illegal move
        if (move === null) return 'snapback';

        updateStatus();
    };

    var updateStatus = function () {
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

        fenEl.html("FEN: " + game.fen() + "<br><br>");
        //pgnEl.html("PGN: " + game.pgn());
        statusEl.html("TURN: " + status);
        checkEl.html("COLOUR IN CHECK: " + check);
        checkmateEl.html("COLOUR IN CHECKMATE: " + checkmate);
    };

    var removeGreySquares = function () {
        $('#board .square-55d63').css('background', '');
    };

    var greySquare = function (square) {
        var squareEl = $('#board .square-' + square);

        var background = '#a9a9a9';
        if (squareEl.hasClass('black-3c85d') === true) {
            background = '#696969';
        }

        squareEl.css('background', background);
    };

    var onMouseoverSquare = function (square, piece) {
        // get list of possible moves for this square
        var moves = game.moves({
            square: square,
            verbose: true
        });

        // exit if there are no moves available for this square
        if (moves.length === 0) return;

        // highlight the square they moused over
        greySquare(square);

        // highlight the possible squares for this piece
        for (var i = 0; i < moves.length; i++) {
            greySquare(moves[i].to);
        }
    };

    var onMouseoutSquare = function (square, piece) {
        removeGreySquares();
    };

    var onSnapEnd = function () {
        board.position(game.fen());
    };

    var cfg = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onMouseoutSquare: onMouseoutSquare,
        onMouseoverSquare: onMouseoverSquare,
        onSnapEnd: onSnapEnd
    };

    board = ChessBoard('Chessboard', cfg);

    updateStatus();
}