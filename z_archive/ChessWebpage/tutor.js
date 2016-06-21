var moveCount = 0;
var inCheck = false;
var names = ['Pawn', 'Rook', 'Knight', 'Bishop', 'Queen', 'King'];


//Engine has finished calculating
var onReady = function (moves) {

    //If it is the first move
    if (moveCount == 1) {
        beginOutput(response_startMove());
        return;
    }

    //if you can take a piece
    var possibleTakes = getCandidates('taken', moves);
    if (possibleTakes.length > 0) {
        beginOutput(response_canTake(moves, possibleTakes));
        return;
    }

    //If the move is to develop a piece, and it is in the early game
    var element = getPart(moves[moves.length - 1], 'from', 'rank');
    if (((element == '1') && playerSide == 'w') || ((element == '8') && playerSide == 'b')) {
        if (moves[moves.length - 1]['piece'] == 'King')
            {
                beginOutput('Your King is vulnerable');
                return;
            }
        beginOutput(buildSentence(['Move a &p1 off the back row.', 'Develop a &p1 off of the back rank', 'You should get a &p1 into the battle', 'Don\'t let your &p1 sit at the back', 'Think about moving your &p1', 'Your &p1 is not helping anything sitting at the back', 'Make use of your &p1, don\'t let it sit at the back'], moves[moves.length - 1]['piece']));
        return;
    }

    //If in check
    if (inCheck) {
        beginOutput(response_check(moves));
        toggleCheck(false);
        return;
    };

    //If moving towards the center and not taking
    var file = getPart(moves[moves.length - 1], 'to', 'file');
    if ((3 <= (getPart(moves[moves.length - 1], 'to', 'rank')) <= 6) && ( (file == 'c') || (file == 'd') || (file == 'e') || (file == 'f'))) {
        
        var starters = ['Move your ', 'Advance your ', 'Push forward your '];
        var enders = [' towards the center', ' onto the center squares ', ' to gain control over the center', ' to the middle', ' to the middle squares'];
        var response = starters[Math.floor((Math.random() * 2) + 0)] + moves[moves.length - 1]['piece'] + enders[Math.floor((Math.random() * 4) + 0)];
        beginOutput(response);
        return;
    }
    
    beginOutput('Seat a piece in ' + moves[moves.length - 1]['to'] + ', maybe your ' + moves[moves.length - 1]['piece']);
};

var movePlus = function () {
    moveCount++;
    console.log(moveCount);
};

function buildSentence(sentenceArray, targetPiece) {
    //Select a random sentence structure
    var suggestion = sentenceArray[Math.floor((Math.random() * (sentenceArray.length - 1)) + 0)];
    //Add contextual information to the string
    suggestion = suggestion.replace('&p1', targetPiece);
    return suggestion;
};

function beginOutput(response) {
    
    //Wait before typing
    setTimeout(function(){
         //40ms per letter
    var typeTime = response.length * 50;
    if (typeTime < 1500) {
        typeTime = 1500;
    }
    document.getElementById("typing").innerHTML = "Typing...";
    //Time for typing
    setTimeout(pushResponse, typeTime, response);
    }, 2000)
   
};

function toggleCheck(value) {
    inCheck = value;
};

function pushResponse(message) {
    //document.getElementById("response").innerHTML = message;
    
    var chatBox = document.getElementById("response");
    var chatBubble = document.createElement('div');
    chatBubble.className = 'chatBubble';
    chatBubble.textContent = message;
    
    chatBox.appendChild(chatBubble);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    
    var d = new Date();
    document.getElementById("typing").innerHTML = "Last message recieved at " + d.toLocaleTimeString();
};

function modePiece(moves) {
    //PRNBQK
    var pieceCount = [0, 0, 0, 0, 0, 0];
    for (i = 0; i < moves.length; i++) {
        switch (moves[i]['from']) {
        case 'Pawn':
            pieceCount[0]++;
            break;
        case 'Rook':
            pieceCount[1]++;
            break;
        case 'Knight':
            pieceCount[2]++;
            break;
        case 'Bishop':
            pieceCount[3]++;
            break;
        case 'Queen':
            pieceCount[4]++;
            break;
        case 'King':
            pieceCount[5]++;
            break;
        }

    }

    var best = 0;
    for (i = 0; i < 6; i++) {
        if (pieceCount[i] > best) {
            best = i;
        }
    }

    switch (best) {
    case 0:
        return 'Pawn';
        break;
    case 1:
        return 'Rook';
        break;
    case 2:
        return 'Knight';
        break;
    case 3:
        return 'Bishop';
        break;
    case 4:
        return 'Queen';
        break;
    case 5:
        return 'King';
        break;
    };
};

function response_startMove() {

	//make sure to include space after sentence
	var helloSentences = [
	"Hi there! Follow my advice and you\'ll be fine. "
	
	
	, "Good day, I'll be your chess tutor for this game. "
	
	
	, "I'll be your tutor for this game, try to do what I say. "
	
	
	, "Hey, hope you're having a good day. Follow my advice and it'll only get better! "
	
	
	, "Hi. If you want help, feel free to listen to what i've got to say. "
	
	
	, "Hello! I'll try to help you win. "
	
	
	, "Hi there. Take my advice and you'll be fine. "
	
	
	, "Hey. Listen to me if you want to learn chess! "];

    var sentences = [
        "In the opening, you want to try and maximise your influence on the center of the board."


        , "You should try and get pieces off the back row to try and control the center of the board."


        , "You may want to start by moving either a pawn or a knight towards the middle of the board."


        , "There are only two pieces you can move in the beginning, the knight or the pawn."


        , "Controlling the center of the board is critical in the opening moves to give you a more secure mid-game."


        , "Try to attack middle squares with your pieces, this will secure you with a better middle game."


        , "The more influence you have on the center of the board, the more you restrict your opponent's moves."


        , "Each piece has its highest possible range of candidate moves in the center of the board. You should aim to have them there."


        , "It is easier to secure check if you have your pieces securely rooted in the center of the board."


        , "You should aim to hold control of the King's and Queen's files 'D' and 'E' during the opening."];

		//return introduction string + starting advice
    return (helloSentences[Math.floor((Math.random() * helloSentences.length) + 0)] + sentences[Math.floor((Math.random() * 9) + 0)]);
};

function response_check(moves) {
    var candidatePieces = getCandidates('piece', moves);
    var responseString = '';

    //Deal with multiple piece selections
    for (i = 0; i < candidatePieces.length; i++) {
        if (i == candidatePieces.length - 1) {
            responseString = responseString + ((candidatePieces.length > 1) ? ' or ' + candidatePieces[i] : candidatePieces[i]);
        } else {
            responseString = ((i < candidatePieces.length - 1) ? candidatePieces[i] : responseString + ', ' + candidatePieces[i]);
        }

    }

    toggleCheck(false);

    var suggestions = ['Moving &p1 will prevent check'


        , 'You can stop check by moving your &p1'


        , 'The best move to get out of check involves your &p1 '


        , 'You may move your &p1'


        , 'Your best bet is to move the &p1'


        , 'Try moving your &p1 to remove check'


        , 'To get out of check move your &p1'


        , 'Think about moving &p1 to stop check'


        , 'You need to move your &p1 to protect your King'


        , 'You\'re going to lose if you don\'t move your &p1 to stop check'


        , 'You\'re in a bad spot, prevent check with your &p1'


        , 'You\'re going to lose if you don\' get out of check using your &p1'


        , 'I\'d move your &p1 to get out of check'


        , 'I\'m thinking you should move your &p1 to protect the King'


        , 'This isn\'t good, you need to get out of check with your &p1'];

    return buildSentence(suggestions, responseString);

};

function response_canTake(moves, possibleTakes) {
    var suggestions = ['You can take their &p1'


            , 'Consider taking their &p1'


            , 'I\'d probably take their &p1'


            , 'Probably go for their &p1'


            , 'I\'m thinking you should take their &p1'


            , 'Take their &p1, I think'


            , 'Maybe go for their &p1'


            , 'The best thing you can do here is take their &p1'


            , 'Go for their &p1'


            , 'Your best bet is to take their &p1'


            , 'Their &p1 needs to go'
			
			
			, 'Since you can, get rid of their &p1'];

    //When you can take only 1 piece, suggest what to take with
    if (possibleTakes.length == 1) {
        var pieceToTake = 'UNDEFINED';
        var pieceTakeWith = 'UNDEFINED';

        var starters = ['Take their ', 'You can take a ', 'You may take their ', 'Capture the ', 'Consider taking their ', 'I\'m thinking you should take their ', 'My advice is to take their ', 'Perhaps capture their '];
        var enders = [' with a ', ' using a ', ' by moving a ', ' by changing the position of a ', 'by moving your', 'with your'];

        for (i = 0; i < moves.length; i++)
            {

                if (moves[i]['taken'] != 'NONE'){
                    return starters[Math.floor((Math.random() * 3) + 0)] + moves[i]['taken'] + enders[Math.floor((Math.random() * 3) + 0)] + moves[i]['piece'];
                }
            }



    //Deal with multiple piece selections
    } else if (possibleTakes.length >= 2) {
        var endofSuggestion = possibleTakes[0] + " or " + possibleTakes[1] + ".";
        if (possibleTakes.length > 2) {
            for (i = 2; i < possibleTakes.length; i++) {
                endofSuggestion = possibleTakes[i] + ", " + endofSuggestion;
            }
        }
        console.log(endofSuggestion);
        return buildSentence(suggestions, endofSuggestion);
    }
};

function getCandidates(attribute, moves) {

    //Get the names of all the pieces mentioned in a specific attribute
    var candidatePieces = [];
    var pieces = [false, false, false, false, false, false];
    for (i = 0; i < moves.length; i++) {
        switch (moves[i][attribute]) {
        case 'Pawn':
            pieces[0] = true;
            break;
        case 'Rook':
            pieces[1] = true;
            break;
        case 'Knight':
            pieces[2] = true;
            break;
        case 'Bishop':
            pieces[3] = true;
            break;
        case 'Queen':
            pieces[4] = true;
            console.log("FOUND THE QUEEN");
            break;
        case 'King':
            pieces[5] = true;
            break;
        };

    }
    for (i = 0; i < pieces.length; i++) {
        if (pieces[i] == true)
            candidatePieces.push(names[i]);
    }
    return candidatePieces;
};

//Get the value of a cell e.g G5 File = G, Rank = 5
function getPart(move, toFrom, axis) {
    if (axis == 'rank')
        return move[toFrom].substr(1, 2);
    if (axis == 'file')
        return move[toFrom].substr(0, 1);
}


// Function to output an end-game response for checkmates (both for and against player)
function response_endgameCM()
{
	if (playerTurn === true)
			{
				var responseCMVic = ['Congratulations, you are victorious! You\'ve heeded my advice well!'
				
				,'Well done there friend! Think I may have to watch out for my job at this rate!'
				
				,'Wow, superb job buddy. Colour me proud!'];
				
				
				var responseCMVicQuick = ['Wow! Now that was one hell of a good fast game! Good job bud.'
				
				,'Crikey, were you in a hurry or something? Nah, I kid, great job!'
				
				,'That was one of the fastest games I\'ve ever seen. I\'m starting to think you may be even better than me!'];
				
				
				var responseCMVicLong = ['Phew. That was a long battle. I\'m so glad we won in the end though!'
				
				,'What a lengthy back and forth that game was! Hopefully we\'ll win in a more timely manner next time.'
				
				,'Well. It wasn\'t a quick game, but a win is still a win I suppose.'];
				
				
				if(moveCount < 15)
				{
					beginOutput(responseCMVicQuick[Math.floor((Math.random() * 3) + 0)]);
				}
				else if (moveCount >= 15 && moveCount < 30)
				{
					beginOutput(responseCMVic[Math.floor((Math.random() * 3) + 0)]);
				}
				else
				{
					beginOutput(responseCMVicLong[Math.floor((Math.random() * 3) + 0)]);
				}
				
			}
			else
			{
				var responseCMLoss = ['Commiserations, you have lost unfortunately. Hope my advice didn\'t lead you astray.'
				
				,'Damn. Apologies, looks like you\'ve lost. I\'ll try to give better advice next time'
				
				,'Don\'t let it get you down. We\'ll win next time, mark my words!'];
				
				
				var responseCMLossQuick = ['That was an awfully quick loss! You really should have followed my plans.'
				
				,'Jeez, that was a fast game. We\'ll both have to try a lot harder next time!'
				
				,'Well I\'ll be. That. Was. Quick. Maybe next time we\'ll go for longer, yeah?'];
				
				
				var responseCMLossLong = ['That sure was a battle of attrition. Can\'t say I blame you for losing, I was getting tired too!'
				
				,'Man, that was one hell of a long game! Good thing it\'s over now, I bet we\'ve both got other things to get on with! Haha'
				
				,'How long was that match, eh? I\'ve seen tournament matches over quicker than that.'];
				
				
				if(moveCount < 15)
				{
					beginOutput(responseCMLossQuick[Math.floor((Math.random() * 2) + 0)]);
				}
				else if(moveCount >= 15 && moveCount < 30)
				{
					beginOutput(responseCMLoss[Math.floor((Math.random() * 2) + 0)]);
				}
				else
				{
					beginOutput(responseCMLossLong[Math.floor((Math.random() * 2) + 0)]);
				}

			}
}


// Function to output an end-game response in a draw scenario
function response_endgameD()
{
	var responseDraw = ['Looks like a draw. Try to be careful of stalemates next time.'
	
	,'Damn. It\'s ended in a stalemate. They can\'t move but aren\'t in check. My bad, I should\'ve seen that coming.'
	
	,'Oh good, a draw. If only we\'d got them in check. Well, there\'s always next time!'];
	
	beginOutput(responseDraw[Math.floor((Math.random() * 2) + 0)]);
}

