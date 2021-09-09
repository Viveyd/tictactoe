const Game = (function(){
    const gameBoard = {
        con: document.querySelector('#game-board'),
        row: {},
        column: {},
        diagonal: {},
        cell: {},
        marker: ['X', 'O'],
        player: {},
        matchLimit: 3,
        currentMatch: 1,
    }
    
    const matchState = {
        unmarkedCells: [],
        marker: ['X', 'O'], 
        markerCount: 0,
        currentMarker :gameBoard.marker[0],
        firstCellMarked: 0,

        

    }
    // Cache DOM
    const cells = [... gameBoard.con.querySelectorAll('.cells')];
    const player1Marker = document.getElementById('player-1-marker');
    const player2Marker = document.getElementById('player-2-marker');
    const playBtn = document.querySelector('#play-btn');
    const indexPage = document.querySelector('#index');
    const matchPage = document.querySelector('#match-display');
    const player1Type = document.getElementById('player-1-type');
    const player2Type = document.getElementById('player-2-type');
    const player1NameInput = document.getElementById('player-1-input');
    const player2NameInput = document.getElementById('player-2-input');
    const player1Score = document.getElementById('player-1-score');
    const player2Score = document.getElementById('player-2-score');
    const player1NameOutput = document.getElementById('player-1-name-scoreboard');
    const player2NameOutput = document.getElementById('player-2-name-scoreboard');
    const currentMatchNum = document.getElementById('current-match');
    const quitBtn = document.getElementById('quit-btn');


    //Event Listeners
    playBtn.addEventListener('click', startMatch);
    player2Type.addEventListener('click', toggleAI);
    playBtn.addEventListener('mouseover', ()=>{
        playBtn.textContent = 'VERSUS';
    })
    playBtn.addEventListener('mouseout', ()=>{
        playBtn.textContent = 'CLICK TO PLAY';
    })
    player1Marker.addEventListener('click', switchMarks);
    player2Marker.addEventListener('click', switchMarks);
    quitBtn.addEventListener('click', quitMatch);

    const Player = {
        init: function(name, type, mark){
            this.name = name;
            this.type = type
            this.mark = mark;
            this.score = 0;
            return this;
        },
        create: function(){
            let newPlayer = Object.create(this);
            return newPlayer;
        },
    };

    mapBoard();
    computeBoard();

    function startMatch(){
        switchDisplay(2);
        initPlayers();

        player1NameOutput.textContent = gameBoard.player.player1.name;
        player2NameOutput.textContent = gameBoard.player.player2.name;
        currentMatchNum.textContent = gameBoard.currentMatch;
        player1Score.textContent = 0;
        player2Score.textContent = 0;

        // Add click listeners and handlers to each board cell
        for(let cell in gameBoard.cell){
            gameBoard.cell[cell].addEventListener('click', markCell);
        };

        checkAiTurn();
    }

    function checkAiTurn(){
        if( gameBoard.player.player2.type == 'AI' && matchState.currentMarker == gameBoard.player.player2.mark) AImoves();
    }

    function initPlayers(){
        let p1 = player1NameInput.value.trim();
        if(p1 == '') p1 = 'Player 1';
        let m1 = player1Marker.textContent.trim();
        let t1 = player1Type.getAttribute('data-player-type');
        gameBoard.player.player1 = Player.create().init(p1, t1, m1);

        let p2 = player2NameInput.value.trim();
        if(p2 == '') p2 = 'Player 2';
        let m2 = player2Marker.textContent.trim();
        let t2 = player2Type.getAttribute('data-player-type');
        gameBoard.player.player2 = Player.create().init(p2, t2, m2);
    }

    function switchDisplay(displayNum){
        if(displayNum == 2){
            indexPage.style.display ='none';
            matchPage.style.display = 'grid';
        }
        else if(displayNum == 1){
            indexPage.style.display ='grid';
            matchPage.style.display = 'none';
        }
    }

    //Initialize key values related to gameboard for caching and easy access.
    function mapBoard(){
        for(let i = 1; i <= cells.length; i++){
            gameBoard.cell[i] = cells[i-1];
            matchState.unmarkedCells[i-1] = cells[i-1];
        }
        let rows = [... gameBoard.con.querySelectorAll('.board-rows')];
        for(let i = 1; i <= rows.length; i++){
            gameBoard.row[i] = rows[i-1];
        }
        let columns = [[... gameBoard.con.querySelectorAll('.column-1')], [... gameBoard.con.querySelectorAll('.column-2')], [... gameBoard.con.querySelectorAll('.column-3')]];
        for(let i = 1; i <= columns.length; i++){
            gameBoard.column[i] = columns[i-1];
        }
        let diagonals = [[... gameBoard.con.querySelectorAll('.diagonal-1')], [... gameBoard.con.querySelectorAll('.diagonal-2')]];
        for(let i = 1; i <= diagonals.length; i++){
            gameBoard.diagonal[i] = diagonals[i-1];
        }
    }

    //Occurs when a gameboard cell is clicked.
    function markCell(e, aiMove){
        let cell = (aiMove)? aiMove: e.target; 
        if(getMark(cell) == 'none' ){
            cell.textContent = matchState.currentMarker;
            cell.setAttribute('data-mark', `${matchState.currentMarker}`); 
            matchState.markerCount++;
            if(matchState.markerCount == 1) matchState.firstCellMarked = cell;
            matchState.unmarkedCells.splice(matchState.unmarkedCells.indexOf(cell), 1);
            changeMarker();
            let eval = evalAdjacents(cell);
            if(eval) matchOver();
            else if(matchState.markerCount == 9) matchOver('draw');
            else{
                if(gameBoard.player.player2.type == 'AI' && matchState.currentMarker == gameBoard.player.player2.mark) AImoves();
            }
        }
        else console.log('Already marked!');
    }

    function changeMarker(){
        matchState.currentMarker = (matchState.currentMarker == matchState.marker[0]) ? matchState.marker[1]: matchState.marker[0];
    }
    // AI move processing
    function AImoves(){
        // strat for ai. 
        let cell = ownStrat2();
        markCell(0, cell);
    }
    // Strat-1: Random
    function randomMove(){
        return matchState.unmarkedCells[Math.floor(Math.random() * matchState.unmarkedCells.length)];
    }
    // Strat-2: Minimax

    // Strat-3: Own(Basic)
    function ownStrat1(){
        let computedBoardObj = computeBoard();
        let hvc = getHVC(computedBoardObj);
        return hvc;
    }

    function computeBoard(){
        let computedBoard = {};
        for(let i = 0; i< cells.length; i++){
            // computedValues[`cell${i+1}`] = computeCell(matchState.unmarkedCells[i]); \
            computedBoard[`cell${i+1}`] = [cells[i], computeCell(cells[i])];
        }
        return computedBoard;
    }

    function computeCell(cell){
        if(matchState.markerCount == 0){
            if([cells[0], cells[2], cells[5], cells[6], cells[8]].indexOf(cell) != -1) return 3;
            else return 1;
        }
        else if(matchState.unmarkedCells.indexOf(cell) == -1)return 0;
        else{
                let aiMark = gameBoard.player.player2.mark;
                let humanMark = gameBoard.player.player1.mark;
                if(isAiFinisher(cell, aiMark)) return 5;
                if(isHumanFinisher(cell, humanMark)) return 4;
                else return 1;
        }
    }
    function getHVC(board){
        let highestVal = 0;
        let highestCell = [];
        for(let cell in board){
            if(board[cell][1] > highestVal){
                highestVal = board[cell][1];
                highestCell = [];
                highestCell.push(board[cell][0]);
            }
            else if(board[cell][1] == highestVal){
                highestCell.push(board[cell][0]);
            }
        }
        return highestCell[Math.floor(Math.random() * highestCell.length)];
    }
    function isAiFinisher(cell, mark){
        return (isRowFinisher(cell, mark) || isColumnFinisher(cell, mark) || isDiagonalFinisher(cell, mark)) ? true: false;
    }
    function isHumanFinisher(cell, mark){
        return (isRowFinisher(cell, mark) || isColumnFinisher(cell, mark) || isDiagonalFinisher(cell, mark)) ? true: false;
    }
    function isRowFinisher(cell, mark){
        let row = getRowOf(cell);
        let filtered = [... row.children].filter(lineCell => lineCell != cell && getMark(lineCell) == mark);
        return (filtered.length == 2) ? true: false;
    }
    function isColumnFinisher(cell, mark){
        let column = getColumnOf(cell);
        let filtered = column.filter(lineCell => lineCell != cell && getMark(lineCell) == mark);
        return (filtered.length == 2) ? true: false;
    }
    function isDiagonalFinisher(cell, mark){
        if(cell.classList.contains('diagonal-1') || cell.classList.contains('diagonal-2')){
            let diagonal = getDiagonalOf(cell);
            if(diagonal.length != 2){
                let filtered = diagonal.filter(lineCell => lineCell != cell && getMark(lineCell) == mark);
                return (filtered.length == 2) ? true: false;
            }
            else{
                let filteredA = diagonal[0].filter(lineCell => lineCell != cell && getMark(lineCell) == mark);
                let filteredB = diagonal[1].filter(lineCell => lineCell != cell && getMark(lineCell) == mark);
                return (filteredA.length == 2 || filteredB.length  == 2) ? true: false;
            }
        }
        else{
            return false;
        }
    }
    // Strat-3: Own strat (Advanced)
    function ownStrat2(){
        let computedBoardObj = computeBoard2();
        let hvc = getHVC(computedBoardObj);

        return hvc;
    }
    function computeBoard2(){
        let computedBoard = {};
        for(let i = 0; i< cells.length; i++){
            // computedValues[`cell${i+1}`] = computeCell(matchState.unmarkedCells[i]); \
            computedBoard[`cell${i+1}`] = [cells[i], computeCell2(cells[i])];
        }
        return computedBoard;
    }

    function computeCell2(cell){
        let firstCellMarked = matchState.firstCellMarked;
        if(matchState.markerCount == 0){
            if([cells[0], cells[2], cells[6], cells[8]].indexOf(cell) != -1) return 3;
            else return 1;
        }
        else if(matchState.unmarkedCells.indexOf(cell) == -1)return 0;
        else if(matchState.markerCount == 1  && cell == cells[4] && humanDiagonalStart(firstCellMarked)) return 4;
        else{
                let aiMark = gameBoard.player.player2.mark;
                let humanMark = gameBoard.player.player1.mark;
                if(matchState.markerCount > 2    && isAiFinisher(cell, aiMark)) return 6;
                else if(matchState.markerCount > 2 && isHumanFinisher(cell, humanMark)) return 5;
                else if(matchState.markerCount == 3  && [cells[0], cells[2], cells[4], cells[6], cells[8]].indexOf(cell) == -1 && humanDiagonalStart(firstCellMarked)) return generateReturnVal(cell, firstCellMarked);
                else if(isValidFork(cell, humanMark, firstCellMarked)) return 3;
                else return 1;
        }
    }

    function generateReturnVal(cell, firstCell){
        console.log('reached here');
        if(firstCell == cells[0] && (cell == cells[1])) return 4;
        else if(firstCell == cells[2] && (cell == cells[5])) return 4;
        else if(firstCell == cells[6] && (cell == cells[3])) return 4;
        else if (firstCell == cells[0] && (cell == cells[7])) return 4;
        else return 1;
    }

    function humanDiagonalStart(firstCell){
        if(getMark(firstCell) == gameBoard.player.player1.mark && [cells[0], cells[2], cells[6], cells[8]].indexOf(firstCell) != -1){
            return true;
        }
        else return false
    }

    function isValidFork(cell, humanMark, firstCell){
        if([cells[0], cells[2], cells[6], cells[8]].indexOf(cell) != -1){
            if(matchState.markerCount == 2 && getMark(firstCell) == gameBoard.player.player2.mark){
                if(firstCell == cells[0] && (cell == cells[8])) return true;
                else if(firstCell == cells[2] && (cell == cells[6])) return true;
                else if(firstCell == cells[6] && (cell == cells[2])) return true;
                else if (firstCell == cells[8] && (cell == cells[0])) return true;
                else return false;
            }
            else if(cell == gameBoard.cell[1] || cell == gameBoard.cell[9]){
                if(getMark(gameBoard.cell[3]) != humanMark && getMark(gameBoard.cell[7])!= humanMark) return true;
                else if(cell == gameBoard.cell[1] && getMark(gameBoard.cell[9]) != humanMark) return true;
                else if(cell == gameBoard.cell[9] && getMark(gameBoard.cell[1]) != humanMark) return true;
                else return false; 
            }
            else if(cell == gameBoard.cell[3] || cell == gameBoard.cell[7]){
                if(getMark(gameBoard.cell[1]) != humanMark && getMark(gameBoard.cell[9])!= humanMark) return true;
                else if(cell == gameBoard.cell[3] && getMark(gameBoard.cell[7]) != humanMark) return true;
                else if(cell == gameBoard.cell[7] && getMark(gameBoard.cell[3]) != humanMark) return true;
                else return false; 
            }
            else return false;
        }
        else return false;
    }

    // Match end events
    function matchOver(draw){
        if(draw){
            alert(`Match Over! It was a tie!`);
            let randomMark = ['X','O'][Math.floor(Math.random() * 2)];
            initNextMatch(randomMark, );
        }
        else{
        let loser = getPlayerByMark(matchState.currentMarker);
        let winner = getOtherPlayer(loser);
        alert(`Match Over! ${winner.name} won`);
        winner.score++;
        initNextMatch(loser.mark);
        }
    }
    
    

    function initNextMatch(loserMark){
        resetUnmarkedCellsCounter();
        matchState.currentMarker = loserMark;
        matchState.markerCount = 0;
        gameBoard.currentMatch++;
        player1NameOutput.textContent = gameBoard.player.player1.name;
        player2NameOutput.textContent = gameBoard.player.player2.name;
        currentMatchNum.textContent = gameBoard.currentMatch;
        player1Score.textContent = gameBoard.player.player1.score;
        player2Score.textContent = gameBoard.player.player2.score;
        resetBoard();
        if(gameBoard.currentMatch> gameBoard.matchLimit) gameOver();
        else if( gameBoard.player.player2.type == 'AI' && loserMark == gameBoard.player.player2.mark) AImoves();
    }

    function resetBoard(){
        for(let i = 1; i <= 9; i++){
            let cell = gameBoard.cell[i];
            cell.textContent = '';
            setMark(cell, 'none');
        }
    }

    function gameOver(){
        let winner = (gameBoard.player.player1.score > gameBoard.player.player2.score) ? gameBoard.player.player1: gameBoard.player.player2;
        let loser =  (gameBoard.player.player1.score < gameBoard.player.player2.score) ? gameBoard.player.player1: gameBoard.player.player2;
        if(gameBoard.player.player1.score != gameBoard.player.player2.score){
            if(gameBoard.player.player2.type == 'AI'){
                if(winner == gameBoard.player.player2) alert(`At ${winner.score}-${loser.score}, you were dominated by Mimir's superior intellect.`);
                else alert(`${winner.score}-${loser.score}. You won. Mimir found his successor.`);
            }
            else{
                alert(`${winner.name} won with a score of ${winner.score}-${loser.score} against ${loser.name}!`);
            }   
        }
        else{
            if(gameBoard.player.player2.type == 'AI') alert(`You went toe-to-toe with Mimir and held your ground. Mimir is impressed.`);
            else alert(`${winner.name} tied with ${winner.name} at ${winner.score}-${loser.score} in an equal display of skill.`);
        }
        quitMatch();
    }

    function resetUnmarkedCellsCounter(){
        matchState.unmarkedCells = [];
        for(let i = 0; i < cells.length; i++){
            matchState.unmarkedCells.push(cells[i]);
        }
    }

    function getOtherPlayer(player){
        return (player == gameBoard.player.player1) ? gameBoard.player.player2: gameBoard.player.player1;
    }

    function getPlayerByMark(mark){
        return (gameBoard.player.player1.mark == mark) ? gameBoard.player.player1: gameBoard.player.player2;
    }

    // Check if a row/column/diagonal has been completed after a move
    function evalAdjacents(cell){
        return (evalRow(cell) || evalColumn(cell) || evalDiagonal(cell)) ? true: false;  
    }

    function evalRow(cell){
        let row = getRowOf(cell);
        let filtered = [... row.children].filter(cell => getMark(cell) != 'none');
        return (isLineComplete(filtered)) ? true: false;  
    }   
    function evalColumn(cell){
        // let column = gameBoard.column[cell.classList[1].slice(7)];
        let column = getColumnOf(cell);
        let filtered = column.filter(cell => getMark(cell) != 'none');
        return (isLineComplete(filtered)) ? true: false;
    }
    function evalDiagonal(cell){
        if(cell.classList.contains('diagonal-1') || cell.classList.contains('diagonal-2')){
            // let diagonal = (cell == gameBoard.cell[5]) ? [gameBoard.diagonal[1], gameBoard.diagonal[2]]: gameBoard.diagonal[cell.classList[2].slice(9)];
            let diagonal = getDiagonalOf(cell);
            if(diagonal.length != 2){
                let filtered = diagonal.filter(cell => getMark(cell) != 'none');
                return (isLineComplete(filtered)) ? true: false;
            }
            else{
                let filteredA = diagonal[0].filter(cell => getMark(cell) != 'none');
                let filteredB = diagonal[1].filter(cell => getMark(cell) != 'none'); 
                return (isLineComplete(filteredA)||isLineComplete(filteredB)) ? true : false; 
            }
        }
        else return false;
    }
    function getRowOf(cell){
        let id = cell.getAttribute('id').slice(5);
        return (id < 4) ? gameBoard.row[1]: (id < 7) ? gameBoard.row[2]: gameBoard.row[3];
    }

    function getColumnOf(cell){
        return gameBoard.column[cell.classList[1].slice(7)];
    }

    function getDiagonalOf(cell){
        return (cell == gameBoard.cell[5]) ? [gameBoard.diagonal[1], gameBoard.diagonal[2]]: gameBoard.diagonal[cell.classList[2].slice(9)];
    }
    function isLineComplete(filtered){
        return (filtered.length == 3 && sameMark(filtered[0], filtered[1], filtered[2]))
    }

    function sameMark(cell1, cell2, cell3){
        return (getMark(cell1) == getMark(cell2) && getMark(cell2) == getMark(cell3) && getMark(cell1) == getMark(cell3));
    }

    function getMark(cell){
       
        return cell.getAttribute('data-mark');
    }
    function setMark(cell, mark){
        cell.setAttribute('data-mark', mark);
    }
    function removeMark(cell){
        cell.removeAttribute('data-mark');
    }

    // For index page, mark selection
    function switchMarks(e){
        let targetMark = e.target;
        let oldMarkText = targetMark.textContent;
        let affectedMark = (targetMark.textContent == player1Marker.textContent) ? player2Marker : player1Marker;
        targetMark.textContent = affectedMark.textContent;
        affectedMark.textContent = oldMarkText;
    }
    // Event handler for choosing to play with ai
    function toggleAI(){
        if(player2Type.textContent == ' AI '){
            player2NameInput.value = '';   
            player2Type.textContent = ' Player ';
            player2NameInput.disabled = false;
            player2Type.setAttribute('data-player-type', 'Human');
        }
        else{
            player2NameInput.value = 'Mimir';   
            player2Type.textContent = ' AI ';
            player2NameInput.disabled = true;
            player2Type.setAttribute('data-player-type', 'AI');
        }
    }

    function quitMatch(){
        switchDisplay(1)
        resetBoard();
        resetLogic();
    }

    function resetLogic(){
        resetUnmarkedCellsCounter();
        gameBoard.currentMatch = 1;
        gameBoard.player = {};
        matchState.currentMarker = gameBoard.marker[0];
        matchState.markerCount = 0;
    }

    return{
        gameBoard, matchState
    }
})();