window.onload = function () {
    /*
        GLOBAL VARIABLES
    */
    ct_debug = true;

    cb_shapes = {
        Square: "border-radius: 0px;",
        RoundedSquare: "border-radius: 10px;",
        Circle: "border-radius: 50px;",
        Skew: "-webkit-transform: rotate(-45deg); - moz - transform: rotate(-45 deg); - ms - transform: rotate(-45 deg); - o - transform: rotate(-45 deg);transform: rotate(-45 deg); - webkit - transform - origin: 0 100 % ; - moz - transform - origin: 0 100 % ; - ms - transform - origin: 0 100 % ; - o - transform - origin: 0 100 % ;transform - origin: 0 100 % ;",
        Diamond: "-webkit-transform: rotate(-45deg); - moz - transform: rotate(-45 deg); - ms - transform: rotate(-45 deg); - o - transform: rotate(-45 deg);transform: rotate(-45 deg); - webkit - transform - origin: 0 100 % ; - moz - transform - origin: 0 100 % ; - ms - transform - origin: 0 100 % ; - o - transform - origin: 0 100 % ;transform - origin: 0 100 % ;",
        DiamondIMGFix: "-webkit-transform: rotate(45deg); - moz - transform: rotate(45 deg); - ms - transform: rotate(45 deg); - o - transform: rotate(45 deg);transform: rotate(45 deg); - webkit - transform - origin: 0 100 % ; - moz - transform - origin: 0 100 % ; - ms - transform - origin: 0 100 % ; - o - transform - origin: 0 100 % ;transform - origin: 0 100 % ;"
    };

    //Eventually enable this obj to be loaded from a file on the server (and/or user account)
    var cb_themes = [{
        name: "default",
        whiteSquare: "#ffeccc",
        whiteSquareText: "#8d5b36",
        blackSquare: "#8d5b36",
        blackSquareText: "#ffeccc",
        whitePossiblePlaces: "rgba(210, 211, 210, 0.05)",
        blackPossiblePlaces: "rgba(210, 211, 210, 0.15)",
        boardShape: "Square"
    }, {
        name: "whacky",
        whiteSquare: "#ffccf5",
        whiteSquareText: "##00f7f7",
        blackSquare: "#00f7f7",
        blackSquareText: "#ffccf5",
        whitePossiblePlaces: "rgba(245, 255, 0, 0.55)",
        blackPossiblePlaces: "rgba(245, 255, 0, 0.55)",
        boardShape: "Skew"
    }];

    cb_currentTheme = cb_themes[1];
    cb_playerSide = 'w';
    cb_autoPlay = true;
    cb_autoPlayDelay = 0;

    sf_searchDepth = '0';

    Init_Chessboard();
    Init_Stockfish();
}