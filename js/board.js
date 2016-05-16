function Init_Chessboard() {

    var board
        , game = new Chess()
        , statusEl = $('#status')
        , fenEl = $('#fen')
        , pgnEl = $('#pgn')
        , checkEl = $('#check')
        , checkmateEl = $('#checkmate');

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
            from: source
            , to: target
            , promotion: 'q' // NOTE: always promote to a queen for example simplicity
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
        var status = '';
        var check = '';

        var moveColor = (game.turn() === 'b' ? "Black" : "White");

        // checkmate?
        if (game.in_checkmate() === true) {
            status = 'Game over, ' + moveColor + ' is in checkmate.';
        }

        // draw?
        else if (game.in_draw() === true) {
            status = 'Game over, drawn position';
        }

        // game still on
        else {
            status = moveColor;

            // check?
            if (game.in_check() === true) {
                status += ', ' + moveColor + ' is in check';
            }
        }

        statusEl.html("TURN: " + status);
        fenEl.html("FEN: " + game.fen());
        pgnEl.html("PGN: " + game.pgn());
        checkEl.html("CHECK: " + check);

    };

    var cfg = {
        draggable: true
        , position: 'start'
        , onDragStart: onDragStart
        , onDrop: onDrop
        , onSnapEnd: onSnapEnd
    };
    board = ChessBoard('Chessboard', cfg);

    updateStatus();
}