function Init_Stockfish() {
    queue = [];
    
    stockfish = new Worker('stockfish.js');
    
    
    AskEngine('opp', 'white');
}

//Query the engine from the tutor or opponent
function AskEngine(var source, side){
    var query = {
                source: source,
                side: side,
                move: 'undefined'
            };
    requestQueue.push(query);
};

//Message recieved
engine.onmessage = function(event) {
  console.log(event.data);
    //When the engine outputs 'bestmove' the search has finished
        if (String(event.data).substring(0, 8) == 'bestmove') {
            //Format the results
            console.log(event.data);
};
