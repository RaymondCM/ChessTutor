/*
The engine queries are organised in a queue so that the engine is asked sequentially, rather than in parallel.
*/


/* Stockfish Globals */
Engine = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker('js/opensource/stockfish.js');

queryQueue = [];
/*                   */

function Init_Stockfish() {

}

//Query the engine from the tutor or opponent
function AskEngine(source, side, fen, turnCount) {
    var query = {
        turnCount: turnCount,
        source: source,
        side: side,
        fen: fen,
        move: 'QUERY UNRESOLVED'
    }
    console.log('pushing');
    console.log(query);
    queryQueue.push(query);
    //If first item, send the query straight away
    if (queryQueue.length === 1)
        QueryEngine(query["fen"], sf_searchDepth);
    else //Stop the engine search
    {
        Engine.postMessage("stop");
        queryQueue[0]['move'] = 'STOP';
    }
    console.log("Queue length: " + queryQueue.length);
}

//Message recieved
Engine.onmessage = function (event) {
        //When the engine outputs 'bestmove' the search has finished
        if ((String(event.data).substring(0, 8) == 'bestmove') && queryQueue[0]) {
            console.log('BEST MOVE');
            //If no interruption, assign the move info
            if (queryQueue[0].move !== 'STOP')
                queryQueue[0].move = String(event.data).substring(9, 13);
            //Remove the head of the queue
            ReturnQuery(queryQueue.shift());
            //If the queue still has queries, go to next query
            if (queryQueue.length > 0) {
                QueryEngine(queryQueue[0]["fen"], sf_searchDepth);
            }
        }
    }
    //Format string for engine message
function QueryEngine(fen, depth) {
    Engine.postMessage("position fen " + fen);
    Engine.postMessage("go depth " + depth);
}

function MovePiece(from, to) {
    var boardPosition = board.position();
    
    //console.log('MOVING PIECE FROM AI');
    game.move({
        from: from,
        to: to,
        promotion: 'q'
    });
    
    checkForTaken(boardPosition, to);

    board.position(game.fen());
    updateDebugLog();
}

function ReturnQuery(query) {
    $("#suggestedMove").html("SUGGESTED MOVE FOR " + (query['side'] == "w" ? "WHITE" : "BLACK") + ": " + query['move']);
    
    console.log("Turn: " + query['turnCount'] + " Side: " + query['side'] + " Move: " + query['move']);

    if (game.game_over()) return;
    
    //Make opponent moves
    if (cb_autoPlay || (game_pve && (game_playerSide != query.side)))
        {
            console.log('MOVING PIECE FROM AI');
            //var makeMove = function () MovePiece(query.move.substr(0, 2), query.move.substr(2, 4));
            setTimeout(MovePiece, cb_autoPlayDelay, query.move.substr(0, 2), query.move.substr(2, 4));
            updateStatus();
            //AskEngine('INSERT SOURCE', game.turn(), game.fen(), Math.floor(turnCount / 2));
        }
    

}