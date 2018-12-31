var positions = []; //Array to represent all possible positions on minefield
var nMines;
var adjacentBombs = [];
var markedAsBomb = [];
var adjMarkedAsBomb = []; //Count the number of adjacent spaces marked as bombs
var countRows = 0;
var countCols = 0;
var firstClick = 0;
var markedMines = 0;
var totalSeconds = 0;
var timer;
var cleared = []; //Array to represent whether an empty mine has been cleared
var recursing = 0;
var firstScore = -1;
var alreadyDrawn = 0;

function shuffle(origArray) { //Shuffle the positions of the mines to create random minefield
    var ro = document.getElementById('nRows').valueAsNumber; //Number of rows entered by user
    var co = document.getElementById('nCols').valueAsNumber; //Number of columns entered by user
    var copyArray = [];
    var tempI = ro-1;
    var tempJ = co-1;
   
    for (var i = 0; i < ro; i++) { //Make a copy of the array
        copyArray[i] = [];
        for (var j = 0; j < co; j++) {
            copyArray[i][j] = -5;
        }
    }
    for (var i = 0; i < ro; i++) {
        for (var j = 0; j < co; j++) {
            var randI = Math.floor(Math.random()*(tempI-0+1)+0);
            var randJ = Math.floor(Math.random()*(tempJ-0+1)+0);

            while (origArray[randI][randJ]===-1) { //Find a new element that we have not already taken
                var randI = Math.floor(Math.random()*(tempI-0+1)+0);
                var randJ = Math.floor(Math.random()*(tempJ-0+1)+0);
            }
            if (origArray[randI][randJ]!==-1) {
                copyArray[i][j] = origArray[randI][randJ];
                origArray[randI][randJ] = -1; //We will know in the future that we already took this element
            }
        }
    }
    return copyArray;
}

function restartGame() { //Triggered when user presses "Restart Game" button
    $('.bombButton').removeClass('disabled'); //Re-enable button
    $('.emptyButton').prop("disabled", false);
    document.getElementById('buttonTable').classList.remove('disabled');
    alreadyDrawn = 0;
    var nMines = document.getElementById('numMines').valueAsNumber; //Number of mines entered by user
    var table = document.getElementById('buttonTable');
    table.parentNode.removeChild(table); //Remove minefield
    $('.attachTable').append('<table id="buttonTable"></table>'); //Create new minefield
    drawMinefield(); //Create new minefield, cont.
    markedMines = 0; //Reset count
    firstClick = 0; //Reset timer 
    totalSeconds = 0; //Reset timer
    document.getElementById('numBombsMarked').innerHTML = markedMines; //Reset mines count
    document.getElementById('remBombs').innerHTML = nMines - markedMines; //Reset mines count
    clearInterval(timer); //Restart timer
} 

function countTimer() { //Time every game
   ++totalSeconds;
   var hour = Math.floor(totalSeconds /3600);
   var minute = Math.floor((totalSeconds - hour*3600)/60);
   var seconds = totalSeconds - (hour*3600 + minute*60);
   document.getElementById("timer").innerHTML = hour + ":" + minute + ":" + seconds;
}

function drawMinefield() { //Draw the minefield once user presses "Submit"
if (alreadyDrawn===1) {
    alert("If you would like to start your game over, press the Restart Game button.");
    return;
}
var nMines = document.getElementById('numMines').valueAsNumber; //Number of mines entered by user
var numRows = document.getElementById('nRows').valueAsNumber; //Number of rows entered by user
var numCols = document.getElementById('nCols').valueAsNumber; //Number of columns entered by user
let maxMines = (numRows * numCols) - 1;
if (nMines > maxMines) {
    alert("You requested too many bombs! Try again.");
    return;
}  if (nMines < 1) {
    alert("You did not request enough bombs! You must request at least one bomb. Try again.");
    return;
} if (numRows > 30) {
    alert("You requested too many rows! You can request a maximum of 30 rows. Try again.");
    return;
} if (numRows < 8) {
    alert("You did not request enough rows! You must request at least 8 rows. Try again.");
    return;
} if (numCols < 8) {
    alert("You did not request enough columns! You must request at least 8 columns. Try again.");
    return;
} if (numCols > 40) {
    alert("You requested too many columns! You can request a maximum of 40 columns. Try again.");
    return;
}
alreadyDrawn = 1;
document.getElementById('scoreBox').style.display = "block"
document.getElementById('mRem').style.display = 'block'; //Display bombs remaining
document.getElementById('restart').style.display = 'block'; //Display 'Restart Game' button
document.getElementById('timerTitle').style.display = 'block'; //Display timer
document.getElementById('timerBox').style.display = 'block';
var remainingBombs = nMines - markedMines; //Remaining bombs based on # mines marked as bombs
document.getElementById('numBombsRequested').innerHTML = nMines; //Update remaining bombs count
document.getElementById('numBombsMarked').innerHTML = markedMines;
document.getElementById('remBombs').innerHTML = remainingBombs;

countRows = numRows;
countCols = numCols;
var u = 0; //Number of bombs added to minefield

for (var i = 0; i < numRows; i++) { //Fill in adjacent bomb array, marked as bomb array, and adjacent marked as bomb array
    adjacentBombs[i] = []; //2-D array
    markedAsBomb[i] = []; //2-D array
    adjMarkedAsBomb[i] = []; //2-D array
    cleared[i] = []; //2-D array
        for (var j = 0; j <numCols; j++) {
            adjacentBombs[i][j] = 0; //Assume 0 to start
            markedAsBomb[i][j] = 0; //Assume 0 to start
            adjMarkedAsBomb[i][j] = 0; //Assume 0 to start
            cleared[i][j] = 0; //Assume 0 to start
     }
 }

for (var i = 0; i < numRows; i++) { //Fill in array to represent positions on minefield
    positions[i] = []; //2-D array
        for (var j = 0; j <numCols; j++) {
         if (u < nMines) {
             positions[i][j] = 1; //Space has bomb
             u++;
         } else {
             positions[i][j] = 0; //Space is empty: no bomb
         }
     }
 }
positions = shuffle(positions);

var tab = document.getElementById('buttonTable'); //Create button table
var row = $(tab).append('<tr>');

for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
        if (positions[i][j] === 1) {//If there should be a bomb in this space
            var argA = i;
            var argB = j;
            var temp = $(row).append('<td><button type="button" id="bomb" onmousedown="clickedBomb(this, event, ' +argA+ ',' +argB+ ')" class="bombButton" value="Bomb"></button></td>');//Add bomb button
            let tempEle = document.getElementById('bomb');
            $(tempEle).attr('id', argA+','+argB);

        } if (positions[i][j] === 0) {//If there should not be a bomb in this space
            var argA = i;
            var argB = j; 
            var temp = $(row).append('<td><button type="button" id="empty" onmousedown="clickedEmptyMine(this, event,' +argA+ ',' +argB+ ')" class="emptyButton" value="Empty"></button></td>');//Add empty mine button
            let tempEle = document.getElementById('empty'); 
            $(tempEle).attr('id', argA+','+argB);
            if (j != numCols-1 && positions[i][j+1] == 1) { //Calculate # of adjacent bombs
                adjacentBombs[i][j]++;
            } if (j != 0 && positions[i][j-1] == 1) {
                adjacentBombs[i][j]++;
            } if (i != numRows-1 && positions[i+1][j] == 1) {
                adjacentBombs[i][j]++;
            } if (i != 0 && positions[i-1][j] == 1) {
                adjacentBombs[i][j]++;
            } if (i != numRows-1 && j != numCols-1 && positions[i+1][j+1] == 1) {
                adjacentBombs[i][j]++;
            } if (i != 0 && j != 0 && positions[i-1][j-1] == 1) {
                adjacentBombs[i][j]++;
            } if (i != 0 && j != numCols-1 && positions[i-1][j+1] == 1) {
                adjacentBombs[i][j]++;
            } if (i != numRows-1 && j != 0 && positions[i+1][j-1] == 1) {
                adjacentBombs[i][j]++;
            } 
        } if (j == numCols-1) { //If we've reached the end of the row
          $(temp).append('</div></tr> <tr>'); //End the table's current row and begin new row
        }  
    }
}
}

function incrAdjMarkedAsBomb(i, j) { //Triggered when space is marked as bomb
    if (i!=countRows-1) {
        adjMarkedAsBomb[i+1][j]++;
    } if (i!=countRows-1 && j!=countCols-1) {
        adjMarkedAsBomb[i+1][j+1]++;
    } if (i!=countRows-1 && j!=0) {
        adjMarkedAsBomb[i+1][j-1]++;
    } if (i!=0) {
        adjMarkedAsBomb[i-1][j]++;
    } if (i!=0 && j!=countCols-1) {
        adjMarkedAsBomb[i-1][j+1]++;
    } if (i!=0 && j!=0) {
        adjMarkedAsBomb[i-1][j-1]++;
    } if (j!=countCols-1) {
        adjMarkedAsBomb[i][j+1]++;
    } if (j!=0) {
        adjMarkedAsBomb[i][j-1]++;
    }
}

function decrAdjMarkedAsBomb(i, j) { //Triggered when space is unmarked as bomb
    if (i!=countRows-1) {
        adjMarkedAsBomb[i+1][j]--;
    } if (i!=countRows-1 && j!=countCols-1) {
        adjMarkedAsBomb[i+1][j+1]--;
    } if (i!=countRows-1 && j!=0) {
        adjMarkedAsBomb[i+1][j-1]--;
    } if (i!=0) {
        adjMarkedAsBomb[i-1][j]--;
    } if (i!=0 && j!=countCols-1) {
        adjMarkedAsBomb[i-1][j+1]--;
    } if (i!=0 && j!=0) {
        adjMarkedAsBomb[i-1][j-1]--;
    } if (j!=countCols-1) {
        adjMarkedAsBomb[i][j+1]--;
    } if (j!=0) {
        adjMarkedAsBomb[i][j-1]--;
    }
}


function clickedBomb(buttObj, event, i, j) { //Triggered when bomb clicked
    var nMines = document.getElementById('numMines').valueAsNumber; //Number of mines entered by user
    if (firstClick === 0) { //If user has not made first move
        firstClick = 1; //This is the first move
        timer = setInterval(countTimer, 1000); //Start timer
    } if (event.shiftKey && event.button == 0) { //Shift left-click: mark as bomb
        if (cleared[i][j]===1) { //Already cleared this square
            return;
        }
        else if (markedAsBomb[i][j] === 1) { //Mine is currently marked as a bomb
            buttObj.classList.remove("togg"); //Unmark mine
            decrAdjMarkedAsBomb(i, j); //Keep track of # of mines marked as bomb
            markedAsBomb[i][j] = 0;
            markedMines--;
            console.log(markedMines);
            document.getElementById('numBombsMarked').innerHTML = markedMines; //Update remaining bombs count
            document.getElementById('remBombs').innerHTML = nMines - markedMines; //Update remaining bombs count
        } else if (markedAsBomb[i][j] === 0) { //Mine is not currently marked as a bomb
            buttObj.classList.add("togg"); //Mark mine
            incrAdjMarkedAsBomb(i, j); //Keep track of # of mines marked as bomb
            markedAsBomb[i][j] = 1;
            markedMines++;
            console.log(markedMines);
            document.getElementById('numBombsMarked').innerHTML = markedMines; //Update remaining bombs count
            document.getElementById('remBombs').innerHTML = nMines - markedMines; //Update remaining bombs count
        }
    } if (event.button == 0 && event.shiftKey === false && positions[i][j]===1 && markedAsBomb[i][j]===0) { //Left-clicked an unmarked bomb
        clearInterval(timer); //Restart timer
        buttObj.classList.add('revealedBomb');
        alert("GAME OVER: You clicked a bomb. You lose. Sorry, loser."); //Game over; user lost game
        $('.bombButton').prop("disabled", true); //Disable clicking of bombs/empty mines
        $('.emptyButton').prop("disabled", true);
    }
    if (win()) {
        $('.bombButton').prop("disabled", true); //Disable clicking of bombs/empty mines
        $('.emptyButton').prop("disabled", true);
    }
}


function clickedEmptyMine(buttObj, event, i, j) { //Triggered when empty mine clicked 
    var numRows = document.getElementById('nRows').valueAsNumber; //Number of rows entered by user
    var numCols = document.getElementById('nCols').valueAsNumber; //Number of columns entered by user
    var nMines = document.getElementById('numMines').valueAsNumber; //Number of mines entered by user
    let numberRows = numRows;
    let numberCols = numCols;

    if (firstClick === 0) { //If user has not made first move
        firstClick = 1; //This is the first move
        timer = setInterval(countTimer, 1000); //Start timer
    } if (cleared[i][j]===1) { //Already cleared this square
        return;
    } if (event.button === 0 && event.shiftKey === false && cleared[i][j]===0) { //Left-clicked on empty mine
        if (adjacentBombs[i][j] === 0) { //No adjacent bombs
            buttObj.classList.add('noAdjacentBombs'); //Turn green to indicate no adjacent bombs
            cleared[i][j] = 1; //This space has been cleared
            let thisButton = document.getElementById(i+","+j);
            $(thisButton).prop('disabled', true);
            //Adjacent buttons that have not already been clicked are automatically pressed (it is safe to do so)
            shiftKey = false; //Simulate left-clicking adjacent mines
            event.button = 0;
            if (i!==numberRows-1 && cleared[i+1][j]===0) {
                let arA = i+1;
                let adjMineA = document.getElementById(arA+","+j);
                recursing = 1;
                clickedEmptyMine(adjMineA, event, i+1, j);
            } if (i!==0 && cleared[i-1][j]===0) {
                let arB = i-1;
                let adjMineB = document.getElementById(arB+","+j);
                recursing = 1;
                clickedEmptyMine(adjMineB, event, i-1, j);
            } if (j!==numberCols-1 && cleared[i][j+1]===0) {
                let arC = j+1;
                let adjMineC = document.getElementById(i+","+arC);
                recursing = 1;
                clickedEmptyMine(adjMineC, event, i, j+1);
            } if (j!==0 && cleared[i][j-1]===0) {
                let arD = j-1;
                let adjMineD = document.getElementById(i+","+arD);
                recursing = 1;
                clickedEmptyMine(adjMineD, event, i, j-1);
            } if (i!==numberRows-1 && j!==numberCols-1 && cleared[i+1][j+1]===0) {
                let arE = i+1;
                let argE = j+1;
                let adjMineE = document.getElementById(arE+","+argE);
                recursing = 1;
                clickedEmptyMine(adjMineE, event, i+1, j+1);
            } if (i!==0 && j!==0 && cleared[i-1][j+1]===0) {
                let arF = i-1;
                let argF = j-1;
                let adjMineF = document.getElementById(arF+","+argF);
                recursing = 1;
                clickedEmptyMine(adjMineF, event, i-1, j-1);
            } if (i!==0 && j!==numberCols-1 && cleared[i-1][j+1]===0) {
                let arG = i-1;
                let argG = j+1;
                let adjMineG = document.getElementById(arG+","+argG);
                recursing = 1;
                clickedEmptyMine(adjMineG, event, i-1, j+1);
            } if (i!==numberRows-1 && j!==0 && cleared[i+1][j-1]===0) {
                let arH = i+1;
                let argH = j-1;
                let adjMineH = document.getElementById(arH+","+argH);
                recursing = 1;
                clickedEmptyMine(adjMineH, event, i+1, j-1);
        } 
    }else if (adjacentBombs[i][j] !== 0) { //There are adjacent bombs
            buttObj.innerHTML= adjacentBombs[i][j]; //Display count of adjacent bombs
            cleared[i][j] = 1; //This space has been cleared
            buttObj.classList.add('adjCountRevealed');
        }

   } if (cleared[i][j]===1 && event.shiftKey === false && event.button === 0 && adjacentBombs[i][j]!==0) { //Left-click on cleared space with bomb count
           if (adjacentBombs[i][j] === adjMarkedAsBomb[i][j]) { //Number of adjacent marked bombs equals the number of adjacent bombs
            //left-click any adjacent spaces that have not been cleared and are also not marked as being bombs
                if (j!==numCols-1 && markedAsBomb[i][j+1]===0 && cleared[i][j+1]===0) { //Adjacent space not marked as bomb and not cleared
                    if (positions[i][j+1] === 1) { //Bomb
                        shiftKey = false;
                        event.button = 0;
                        let arA = j+1;
                        let adjMineA = document.getElementById(i+","+arA);
                        clickedBomb(adjMineA, event, i, j+1);
                    } if (positions[i][j+1] === 0) { //Empty
                        shiftKey = false;
                        event.button = 0;
                        let arA = j+1;
                        let adjMineA = document.getElementById(i+","+arA);
                        clickedEmptyMine(adjMineA, event, i, j+1);
                    }
                } if (j!==0 && markedAsBomb[i][j-1]===0 && cleared[i][j-1]===0) { //Adjacent space not marked as bomb and not cleared
                    if (positions[i][j-1] === 1) { //Bomb
                        shiftKey = false;
                        event.button = 0;
                        let arB = j-1;
                        let adjMineB = document.getElementById(i+","+arB);
                        clickedBomb(adjMineB, event, i, j-1);
                    } if (positions[i][j-1] === 0) { //Empty
                        shiftKey = false;
                        event.button = 0;
                        let arB = j-1;
                        let adjMineB = document.getElementById(i+","+arB);
                        clickedEmptyMine(adjMineB, event, i, j-1);
                    }
                } if (i!==numRows-1 && markedAsBomb[i+1][j]===0 && cleared[i+1][j]===0) { //Adjacent space not marked as bomb and not cleared
                    if (positions[i+1][j] === 1) { //Bomb
                        shiftKey = false;
                        event.button = 0;
                        let arC = i+1;
                        let adjMineC = document.getElementById(arC+","+j);
                        clickedBomb(adjMineC, event, i+1, j);
                    } if (positions[i+1][j] === 0) { //Empty
                        shiftKey = false;
                        event.button = 0;
                        let arC = i+1;
                        let adjMineC = document.getElementById(arC+","+j);
                        clickedEmptyMine(adjMineC, event, i+1, j);
                    }
                } if (i!==0 && markedAsBomb[i-1][j]===0 && cleared[i-1][j]===0) { //Adjacent space not marked as bomb and not cleared
                    if (positions[i-1][j] === 1) { //Bomb
                        shiftKey = false;
                        event.button = 0;
                        let arD = i-1;
                        let adjMineD = document.getElementById(arD+","+j);
                        clickedBomb(adjMineD, event, i-1, j);
                    } if (positions[i-1][j] === 0) { //Empty
                        shiftKey = false;
                        event.button = 0;
                        let arD = i-1;
                        let adjMineD = document.getElementById(arD+","+j);
                        clickedEmptyMine(adjMineD, event, i-1, j);
                    }
                } if (i!==0 && j!==0 && markedAsBomb[i-1][j-1]===0 && cleared[i-1][j-1]===0) { //Adjacent space not marked as bomb and not cleared
                    if (positions[i-1][j-1] === 1) { //Bomb
                        shiftKey = false;
                        event.button = 0;
                        let arE = i-1;
                        let argE = j-1;
                        let adjMineE = document.getElementById(arE+","+argE);
                        clickedBomb(adjMineE, event, i-1, j-1);
                    } if (positions[i-1][j-1] === 0) { //Empty
                        shiftKey = false;
                        event.button = 0;
                        let arE = i-1;
                        let argE = j-1;
                        let adjMineE = document.getElementById(arE+","+argE);
                        clickedEmptyMine(adjMineE, event, i-1, j-1);
                    }
                } if (i!==0 && j!==numCols-1 && markedAsBomb[i-1][j+1]===0 && cleared[i-1][j+1]===0) { //Adjacent space not marked as bomb and not cleared
                    if (positions[i-1][j+1] === 1) { //Bomb
                        shiftKey = false;
                        event.button = 0;
                        let arF = i-1;
                        let argF = j+1;
                        let adjMineF = document.getElementById(arF+","+argF);
                        clickedBomb(adjMineF, event, i-1, j-1);
                    } if (positions[i-1][j+1] === 0) { //Empty
                        shiftKey = false;
                        event.button = 0;
                        let arF = i-1;
                        let argF = j+1;
                        let adjMineF = document.getElementById(arF+","+argF);
                        clickedEmptyMine(adjMineF, event, i-1, j+1);
                    }
                } if (j!==0 && i!==numRows-1 && markedAsBomb[i+1][j-1]===0 && cleared[i+1][j-1]===0) { //Adjacent space not marked as bomb and not cleared
                    if (positions[i+1][j-1] === 1) { //Bomb
                        shiftKey = false;
                        event.button = 0;
                        let arG = i+1;
                        let argG = j-1;
                        let adjMineG = document.getElementById(arG+","+argG);
                        clickedBomb(adjMineG, event, i+1, j-1);
                    } if (positions[i+1][j-1] === 0) { //Empty
                        shiftKey = false;
                        event.button = 0;
                        let arG = i+1;
                        let argG = j-1;
                        let adjMineG = document.getElementById(arG+","+argG);
                        clickedEmptyMine(adjMineG, event, i+1, j-1);
                    }
                } if (j!==0 && i!==numRows-1 && markedAsBomb[i+1][j+1]===0 && cleared[i+1][j+1]===0) {
                    if (positions[i+1][j+1] === 1) { //Bomb
                        shiftKey = false;
                        event.button = 0;
                        let arH = i+1;
                        let argH = j+1;
                        let adjMineH = document.getElementById(arH+","+argH);
                        clickedBomb(adjMineH, event, i+1, j+1);
                    } if (positions[i+1][j+1] === 0) { //Empty
                        shiftKey = false;
                        event.button = 0;
                        let arH = i+1;
                        let argH = j+1;
                        let adjMineH = document.getElementById(arH+","+argH);
                        clickedEmptyMine(adjMineH, event, i+1, j+1);
                    }
                }
        }
    } if (event.shiftKey && event.button === 0 && buttObj.innerHTML !== adjacentBombs[i][j]) { //Shift left-click: mark as bomb
        if (markedAsBomb[i][j] === 1) { //Mine is currently marked as a bomb
            buttObj.classList.remove("togg"); //Unmark
            decrAdjMarkedAsBomb(i, j);
            markedMines--;
            markedAsBomb[i][j] = 0;
            console.log(markedMines);
            document.getElementById('numBombsMarked').innerHTML = markedMines; //Update bomb count
            document.getElementById('remBombs').innerHTML = nMines - markedMines;
        } else { //Mine is not currently marked as a bomb
            buttObj.classList.add("togg"); //Mark as bomb
            incrAdjMarkedAsBomb(i, j);
            markedAsBomb[i][j] = 1;
            markedMines++;
            document.getElementById('numBombsMarked').innerHTML = markedMines; //Update bomb count
            document.getElementById('remBombs').innerHTML = nMines - markedMines;
        }
    } 
    win();
}

function win() {
    let numRows = document.getElementById('nRows').valueAsNumber; //Number of rows entered by user
    let numCols = document.getElementById('nCols').valueAsNumber; //Number of columns entered by user
    let nMines = document.getElementById('numMines').valueAsNumber; //Number of mines entered by user
    let squares = numRows * numCols;
    let needToClear = squares - nMines;
    var clearCount = 0;
    var correctlyMarkedMines = 1;

    for (var i = 0; i < numRows; i++) {
        for (var j = 0; j < numCols; j++) {
            if (positions[i][j]===1 && markedAsBomb[i][j]!==1) {
                correctlyMarkedMines = 0;
            }
            if (cleared[i][j]===1) {
                clearCount++;
            }
        } 
    }
    if (clearCount===needToClear && markedMines===nMines && correctlyMarkedMines===1) {
        document.getElementById('noScores').style.display = 'none';
        alert("GAME OVER: You won!");
        clearInterval(timer); //Restart timer
        var winnerTime = totalSeconds;
        var hour = Math.floor(totalSeconds /3600);
        var minute = Math.floor((totalSeconds - hour*3600)/60);
        var seconds = totalSeconds - (hour*3600 + minute*60);
    if (firstScore===-1) {
        document.getElementById('firstScore').innerHTML = hour + ":" + minute + ":" + seconds;
    } if (firstScore!==-1 && winnerTime<firstScore) {
        document.getElementById('firstScore').innerHTML = hour + ":" + minute + ":" + seconds;
    }
    return true;
    }
}
