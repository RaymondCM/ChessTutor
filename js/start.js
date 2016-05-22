window.onload = function () {
    /*
        GLOBAL VARIABLES
    */
    ct_debug = true;

    //Eventually enable this obj to be loaded from a file on the server (and/or user account)
    themes = [{
        name: "default",
        whiteSquare: "#ffeccc",
        whiteSquareText: "#8d5b36",
        blackSquare: "#8d5b36",
        blackSquareText: "#ffeccc",
        whitePossiblePlaces: "rgba(210, 211, 210, 0.05)",
        blackPossiblePlaces: "rgba(210, 211, 210, 0.15)"
    }, {
        name: "whacky",
        whiteSquare: "#ffccf5",
        whiteSquareText: "##00f7f7",
        blackSquare: "#00f7f7",
        blackSquareText: "#ffccf5",
        whitePossiblePlaces: "rgba(245, 255, 0, 0.55)",
        blackPossiblePlaces: "rgba(245, 255, 0, 0.55)"
    }];

    cb_currentTheme = themes[0];
    cb_playerSide = 'w';

    sf_searchDepth = '13';

    Init_Chessboard();
    Init_Stockfish();

}