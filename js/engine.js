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
    queryQueue.push(query);
    //If first item, send the query straight away
    if (queryQueue.length === 1)
        QueryEngine(query["fen"], sf_searchDepth);
    console.log("Queue length: " + queryQueue.length);
}

//Message recieved
Engine.onmessage = function (event) {
    //When the engine outputs 'bestmove' the search has finished
    if (String(event.data).substring(0, 8) == 'bestmove') {
        //Get specific move characters
        queryQueue[0]["move"] = String(event.data).substring(9, 13);
        //Remove the head of the queue
        ReturnQuery(queryQueue.shift());
        //If the queue still has queries, go to next query
        if (queryQueue.length > 0){
            //Engine.postMessage("stop");
            QueryEngine(queryQueue[0]["fen"], sf_searchDepth);
        }
        console.log("Queue length: " + queryQueue.length);
    }
}

//Format string for engine message
function QueryEngine(fen, depth) {
    Engine.postMessage("position fen " + fen);
    Engine.postMessage("go depth " + depth);
}

function ReturnQuery(query) {
    $("#suggestedMove").html("SUGGESTED MOVE FOR " + (query['side'] == "w" ? "WHITE" : "BLACK") + ": " + query['move']);
    console.log("Turn: " + query['turnCount'] + " Side: " + query['side'] + " Move: " + query['move']);
}