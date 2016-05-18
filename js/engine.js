engine = new Worker('js/stockfish.js');
queue = [];

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
    queue.push(query);
    //If first item, send the query straight away
    if (queue.length === 1)
        QueryEngine(query["fen"], sf_searchDepth);
    console.log("Queue length: " + queue.length);
}
 
//Message recieved
engine.onmessage = function (event) {
    //When the engine outputs 'bestmove' the search has finished
    if (String(event.data).substring(0, 8) == 'bestmove') {
        //Get specific move characters
        queue[0]["move"] = String(event.data).substring(9, 13);
        //Remove the head of the queue
        ReturnQuery(queue.shift());
        //If the queue still has queries, go to next query
        if (queue.length > 0)
                QueryEngine(queue[0]["fen"], sf_searchDepth);
        console.log("Queue length: " + queue.length);
    }
}

//Format string for engine message
function QueryEngine(fen, depth) {
    engine.postMessage("position fen " + fen);
    engine.postMessage("go depth " + depth);
}

function ReturnQuery(query){
    console.log("Turn: " + query['turnCount'] + " Side: " + query['side'] + " Move: " + query['move']);
}