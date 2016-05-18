engine = new Worker('js/stockfish.js');

function Init_Stockfish() {
    queue = [];
    AskEngine('opp', 'white');
}

//Query the engine from the tutor or opponent
function AskEngine(source, side) {
    var query = {
        source: source,
        side: side,
        move: 'undefined'
    }
    queue.push(query);
    if (queue.length === 1) {
        console.log('queuelength = 1');
        engine.postMessage("position startpos");
        engine.postMessage("go depth 15");
    }
}

//Message recieved
engine.onmessage = function (event) {
    //When the engine outputs 'bestmove' the search has finished
    if (String(event.data).substring(0, 8) == 'bestmove') {
        //Format the results
        console.log(String(event.data));
    }
}