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

    // update the board position after the piece snap 
    // for castling, en passant, pawn promotion
    var onSnapEnd = function () {
        board.position(game.fen());
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

    var cfg = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
    };
    board = ChessBoard('Chessboard', cfg);

    updateStatus();
}