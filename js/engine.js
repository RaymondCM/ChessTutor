function Init_Stockfish() {
    queue = [];


    engine = STOCKFISH();


    AskEngine('opp', 'white');
}

//Query the engine from the tutor or opponent
function AskEngine(source, side) {
    var query = {
<<<<<<< Updated upstream
        source: source,
        side: side,
        move: 'undefined'
    };
    requestQueue.push(query);
}

//Message recieved
engine.onmessage = function (event) {
=======
                source: source,
                side: side,
                move: 'undefined'
            };
    queue.push(query);  
    if (queue.length === 1)
        {
            console.log('queuelength = 0');
            engine.postMessage("position startpos");
            engine.postMessage("go depth 15");
        }
}

//Message recieved
engine.onmessage = function(event) {
>>>>>>> Stashed changes
    console.log(event.data);
    //When the engine outputs 'bestmove' the search has finished
    if (String(event.data).substring(0, 8) == 'bestmove') {
        //Format the results
        console.log(event.data);
    }
}