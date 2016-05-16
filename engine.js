function Init_Stockfish() {
    requestQueue = [];
    stockfish = new Worker('stockfish.js');
}

//Query the engine from the tutor or opponent
function AskEngine(var source, side){
    var query = {source: source,
                 side: side};
    requestQueue.push(query);
};

//Message recieved
engine.onmessage = function(event) {
  console.log(event.data);
};
