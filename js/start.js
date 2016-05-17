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

    Init_Chessboard();
    Init_Stockfish();
}