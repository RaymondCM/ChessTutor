function Init_Stockfish() {
    queue = [];


    engine = STOCKFISH();


    AskEngine('opp', 'white');
}

//Query the engine from the tutor or opponent
function AskEngine(source, side) {
    var query = {
        source: source,
        side: side,
        move: 'undefined'
    };
    requestQueue.push(query);
}

//Message recieved
engine.onmessage = function (event) {
    console.log(event.data);
    //When the engine outputs 'bestmove' the search has finished
    if (String(event.data).substring(0, 8) == 'bestmove') {
        //Format the results
        console.log(event.data);
    }
}