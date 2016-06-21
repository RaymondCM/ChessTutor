//CHANGES - changed pieceName to be more flexible
//          Added piece take information into moveData object (see array moves)
//          Gives reccomendations for both sides

moveNumber = 0;
playerTurn = true;
engine = new Worker('stockfish.js');
playerSide = 'b';
var engineMessages = [""];
var depthResults = [""];

var moves = [new moveData("", "", "", "")];

$(document).ready(function () {
    
    
    //start('w');
});

var init = function () {
    var board
        , game = new Chess()
        , statusEl = $('#status')
        , fenEl = $('#fen')
        , pgnEl = $('#pgn');

    // do not pick up pieces if the game is over
    // only pick up pieces for the side to move
    var onDragStart = function (source, piece, position, orientation) {
        if (game.game_over() === true ||
            (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false;
        }
    };
	
	//Function for performing the opponent's moves
	formatOpponentResults = function () {
        
    if (engineMessages[0] != null) {
        depthResults.push(engineMessages[0].split("\u0020")[0]); //engineMessages[i]; i can be changed to skill level variable
        
    }

    var wholeMove = engineMessages[0].substring(1, 5);
    moves = [];
    var moveFrom = engineMessages[0].substring(1, 3); //Get move from
    var moveTo = engineMessages[0].substring(3, 5); //Get position to move to

        
        
    game.move({
        from: moveFrom
        , to: moveTo
    }); //Make move
        engineMessages = [];
        depthResults = [];
    board1.position(game.fen());
    updateStatus(); //Update board
};
	
    var removeGreySquares = function () {
        $('#board .square-55d63').css('background', '');
    };
    var greySquare = function (square) {
        var squareEl = $('#board .square-' + square);

        var background = 'rgba(99, 59, 163, 0.53)';
        if (squareEl.hasClass('black-3c85d') === true) {
            background = 'rgba(99, 59, 163, 0.53)';
        }

        squareEl.css('background', background);
    };

    var onDrop = function (source, target) {
        if (!playerTurn)
            {
                return 'snapback';
            }
        removeGreySquares();

        // see if the move is legal
        var move = game.move({
            from: source
            , to: target
            , promotion: 'q' // NOTE: always promote to a queen for example simplicity
		});

        // illegal move
        if (move === null)
            return 'snapback';
        else {
            board1.position(game.fen());
        };
		updateStatus();

		if(!playerTurn)	//If it's the opponent's move
		{
			bestOpponentMove();	//Calculate a move for the opponent
		}		
    };

    var onMouseoverSquare = function (square, piece) {
        // get list of possible moves for this square
        var moves = game.moves({
            square: square
            , verbose: true
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

    // update the board position after the piece snap 
    // for castling, en passant, pawn promotion
    var onSnapEnd = function () {
        board1.position(game.fen());
    };

    var updateStatus = function () {
        var status = '';

        var moveColor = 'White';
        if (game.turn() === 'b') {
            moveColor = 'Black';
        } else {
            //Increment tutor's move count
            movePlus();
        }

        // checkmate?
        if (game.in_checkmate() === true) {
            status = 'Game over, ' + moveColor + ' is in checkmate.';
            
			document.getElementById("ReplayButton").style="text-transform:uppercase";
            var boardStyling = document.getElementById("board");
            var uiStyling = document.getElementById("boardUI");
            boardStyling.style.opacity = "0.6"; 
            uiStyling.style.opacity = "0.6";
			response_endgameCM();
		
        }

        // draw?
        else if (game.in_draw() === true) {
            status = 'Game over, drawn position';
			document.getElementById("ReplayButton").style="text-transform:uppercase";
            var boardStyling = document.getElementById("board");
            var uiStyling = document.getElementById("boardUI");
            boardStyling.style.opacity = "0.6"; 
            uiStyling.style.opacity = "0.6";			
			response_endgameD();
        }

        // game still on
        else {
            status = moveColor + ' to move';
            if (game.turn() === playerSide) {
                // check?
                if (game.in_check() === true) {
                    status += ', ' + moveColor + ' is in check';
                    console.log('User is in check');
                    toggleCheck(true);
                    console.log('Check value: ' + inCheck ? 'true' : 'false');
                }
                console.log('Calling bestMove');
                bestMove();
            }

        }

        statusEl.html(status);
        fenEl.html(game.fen());
        pgnEl.html(game.pgn());
        playerTurn = (game.turn() == playerSide) ? true : false;
    };

    var cfg = {
        draggable: true
        , position: 'start'
        , onDragStart: onDragStart
        , onDrop: onDrop
        , onMouseoutSquare: onMouseoutSquare
        , onMouseoverSquare: onMouseoverSquare
        , onSnapEnd: onSnapEnd
    };
    board1 = ChessBoard('board', cfg);

    
    
    updateStatus();
    if((playerTurn == false))
	{
		bestOpponentMove();	//Calculate a move for the opponent
	}
    //if (playerTurn == false )
            //window.setTimeout(makeRandomMove, 250);    //Computer makes random move for the opponent

}; // end init()

function start(side){
    
    document.getElementById("sideSelect").style.visibility = "hidden";
    document.getElementById("board").style.visibility = "visible";
    document.getElementById("boardUI").style.visibility = "visible";
    
    playerSide = side;
    playerTurn = (playerSide == 'w') ? true : false;
    
    var tutorNames = ['Grigor Cruz', 'Jakeson Bramberly', 'Wang Yi', 'Sergey Deshun', 'Magners Carlsberg', 'Sebastian Crowler', 'Lucy Thompson', 'Pat Smith'];
    var imageNo = Math.floor(Math.random() * (8 - 0 + 1)) + 0;

    if (imageNo == 0)
    {
        imageNo = 1;
        //this is to fix the random number error (from getting a 0)
        //Cosmic bit flip
    }

    document.getElementById("name").innerHTML = tutorNames[imageNo - 1];
    var image = document.getElementById('userImage');
                                                    
        switch (imageNo) {
            case 1:
                image.src = "img/profilepic1.jpg";
                break;
            case 2:
                image.src = "img/profilepic2.jpg";
                break;
            case 3:
                image.src = "img/profilepic3.jpg";
                break;
            case 4:
                image.src = "img/profilepic4.png";
                break;
            case 5:
                image.src = "img/profilepic5.jpg";
                break;
            case 6:
                image.src = "img/profilepic6.jpg";
                break;
            case 7:
                image.src = "img/profilepic7.png";
                break;
            case 8:
                image.src = "img/profilepic8.jpg";
                break;
            default: 
                image.src="img/board-background.png";
                break;

            }
        init();
        if (side == 'b')
            board1.orientation('black');
};

//Move data object template
function moveData(squareFrom, squareTo, movingPiece, takenPiece) {
    this.from = squareFrom;
    this.to = squareTo;
    this.piece = movingPiece;
    this.taken = takenPiece;
}
 

//Query the engine
function bestMove() {
    depthResults = [];
    engineMessages = [];
    engine.postMessage('position fen ' + board1.fen() + " " + playerSide);
    engine.postMessage('go depth 10');

};

function bestOpponentMove() {
    depthResults = [];
    engineMessages = [];
	if(playerSide == 'w')
	{
		engine.postMessage('position fen ' + board1.fen() + " b");
	}
	else
	{
		engine.postMessage('position fen ' + board1.fen() + " w");
	}
	
	//Wait for 3 seconds before beginning to make opponent's move
	setTimeout(function() {
		engine.postMessage('go movetime 3');	//Search for a number of miliseconds
	}, 3000);
};

//Message from the engine
engine.onmessage = function (event) {
    //Only advise on player's turn
    
    //Check if first irrelevant message
    if (String(event.data).substring(0, 4) != 'Stoc') {
        //When the engine outputs 'bestmove' the search has finished
        if (String(event.data).substring(0, 8) == 'bestmove') {
            if (playerTurn) {
                formatResults();
                onReady(moves); //Initialise the tutor
            } else {
                formatOpponentResults();
            }
        } else {
            engineMessages.push(String(event.data).split(' pv')[1]);
        }
    }
};
//When the engine has finished outputting
function formatResults() {

    //Get the results from each depth
    for (i = 0; i < 10; i++) {
        if (engineMessages[i] != null) {
            depthResults.push(engineMessages[i].split("\u0020")[1]);
        }
    }

    moves = [];
    engineMessages = [];
    var positions = board1.position();
    for (i = 0; i < depthResults.length; i++) {
        console.log("Depth " + i + ": " + depthResults[i]);

        //If taking a piece in this move
        if (positions.hasOwnProperty(depthResults[i].substring(2, 4))) {
            moves.push(new moveData(depthResults[i].substring(0, 2), depthResults[i].substring(2, 4), pieceName(positions[depthResults[i].substring(0, 2)]), pieceName(positions[depthResults[i].substring(2, 4)])))

            // No pieces being taken
        } else {
            moves.push(new moveData(depthResults[i].substring(0, 2), depthResults[i].substring(2, 4), pieceName(positions[depthResults[i].substring(0, 2)]), "NONE"))
        }
    }

};

//Translation
function pieceName(text) {
    var piece = text.substring(1, 2);
    switch (piece) {
    case 'P':
        return 'Pawn';
        break;
    case 'K':
        return 'King';
        break;
    case 'Q':
        return 'Queen';
        break;
    case 'R':
        return 'Rook';
        break;
    case 'N':
        return 'Knight';
        break;
    case 'B':
        return 'Bishop';
        break;
    }
};

function printMoves() {
    for (i = 0; i < moves.length; i++) {
        console.log(moves[i]);
    }
};

function getMoves() {
    return moves;
};

