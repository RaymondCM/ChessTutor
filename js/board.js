function Init_Chessboard() {

    turnCount = 1;

    SetTheme(cb_currentTheme);

    if (!ct_debug)
        $('#Debug').css('display', 'none');

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

        if (move === null) {
            return 'snapback';
        } else {
            //Ask the engine about current config

        };

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



        turnCount++;
        //Query the engine with turnCount DIV 2
        AskEngine('INSERT SOURCE', game.turn(), game.fen(), Math.floor(turnCount / 2));

        //Query the engine
        AskEngine('INSERT SOURCE', game.turn(), game.fen());
    };

    var removeHighlighting = function () {
        $('#Chessboard .square-55d63').css('background', '');
    };

    var highlightSquare = function (square) {
        var squareEl = $('#Chessboard .square-' + square);

        var background = cb_currentTheme.whitePossiblePlaces;
        if (squareEl.hasClass('black-3c85d') === true) {
            background = cb_currentTheme.blackPossiblePlaces;
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
        highlightSquare(square);

        // highlight the possible squares for this piece
        for (var i = 0; i < moves.length; i++) {
            highlightSquare(moves[i].to);
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
        onDrop: onDrop,
        onMouseoutSquare: onMouseoutSquare,
        onMouseoverSquare: onMouseoverSquare,
        onSnapEnd: onSnapEnd
    };

    board = ChessBoard('Chessboard', cfg);

    updateStatus();

}

function SetTheme(theme) {
    addCSS(".square-55d63", cb_shapes[cb_currentTheme.boardShape]);
    alterCSS('.white-1e1d7', theme.whiteSquare, theme.whiteSquareText);
    alterCSS('.black-3c85d', theme.blackSquare, theme.blackSquareText);
}

function alterCSS(className, backgroundColour, textColour) {

    //Create CSS var
    var classCSS = "background-color: " + backgroundColour + ";" + " color:" + textColour + ";"

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

function addCSS(className, classCSS) {

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