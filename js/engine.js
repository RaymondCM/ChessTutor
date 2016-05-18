engine = new Worker('js/stockfish.js');
queue = [];

function Init_Stockfish() {
    
    //AskEngine('opp', 'white', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    
    
}

//Query the engine from the tutor or opponent
function AskEngine(source, side, fen) {
    var query = {
        source: source,
        side: side,
        fen: fen,
        move: 'undefined'
    }
    
    //If first item, send the query straight away
    if (queue.length === 0) {
        queue.push(query);
        console.log("None in the query queue");;
        engine.postMessage("position fen " + queue[0]["fen"]);
        engine.postMessage("go depth " + sf_searchDepth);
    } else {
        //Otherwise, add to the queue
        console.log("More than 1 in the query queue");
        queue.push(query);
    }
}

//Message recieved
engine.onmessage = function (event) {
    //When the engine outputs 'bestmove' the search has finished
    if (String(event.data).substring(0, 8) == 'bestmove') {
        //Format the results
        queue[0]["move"] = String(event.data).substring(9, 13);
        //Remove the head of the queue
        ReturnQuery(queue.shift());
        if (queue.length > 0)
            {
                //If the queue still has queries, go to next query
                engine.postMessage("position fen " + queue[0]["fen"]);
                engine.postMessage("go depth " + sf_searchDepth);
            }
    }
}

function ReturnQuery(query){
    console.log("LAST RESULT---- Side: " + query['side'] + " Move: " + query['move']);
}