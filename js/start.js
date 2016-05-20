window.onload = function () {
    /*
        GLOBAL VARIABLES
    */
    ct_debug = true;
    

    themes = [{
        name: "default",
        whiteSquare: "white",
        whiteSquareText: "black",
        blackSquare: "black",
        blackSquareText: "white"
    }];

    cb_possiblePlacesColourWhiteSq = "blue";
    cb_possiblePlacesColourBlackSq = "red";
    cb_playerSide = 'w';
    
    sf_searchDepth = '13';

    Init_Chessboard();
    Init_Stockfish();
    
}