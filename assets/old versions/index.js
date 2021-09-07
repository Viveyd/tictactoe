const Game = (function(){

    const gameBoard = {
        width: 3,
        height: 3,
        marks: ['X', 'O'],
        container: document.querySelector('#game-board'),
        players: [],
    }
    const matchState = {
        nextMark: gameBoard.marks[Math.floor(Math.random() * 2)],
        markCount: 0,
        players: [],
    }

    const Player = {
        init: function(name, mark){
            this.name = name;
            this.type = 'Human';
            this.score = 0;
            this.mark = mark;
            return this;
        },
        create: function(){
            let newPlayer = Object.create(this);
            return newPlayer;
        }
    }

    const playBtn = document.querySelector('#play-btn');
    const player1Input = document.querySelector('#player-1-txt');
    const player1MarkBtn = document.querySelector('#player-1-mark');
    const player2Input = document.querySelector('#player-2-txt');
    const player2MarkBtn = document.querySelector('#player-2-mark');
    const player1Score = document.querySelector('#player-1-score>h2');
    const player2Score = document.querySelector('#player-2-score>h2');
    const player2AI = document.querySelector('#player-2-ai');
    const main = document.querySelector('main');

    //Event listeners
    playBtn.addEventListener('click', startGame);
    player1MarkBtn.addEventListener('click', switchMark);
    player2MarkBtn.addEventListener('click', switchMark);
    player2AI.addEventListener('click', enableAI);

    function switchMark(e){
        let oldValue = e.target.textContent;
        let otherTarget = (e.target == player1MarkBtn) ? player2MarkBtn:player1MarkBtn; 
        e.target.textContent = otherTarget.textContent;
        otherTarget.textContent = oldValue;
    }

    function enableAI(){
        player2Input.value = 'Tictactinatoer';
        player2Input.disabled = true;
    }

    function startGame(){
        addPlayers();
        disableNavInput();
        // Add click listeners to board to play a match
        let allCells = gameBoard['container'].querySelectorAll('.game-board-cells');
        allCells.forEach(cell => cell.addEventListener('click', placeMark));        
    }

    function disableNavInput(){
        playBtn.disabled = true;
        player1Input.disabled = true;
        player1MarkBtn.disabled = true;
        player2Input.disabled = true;
        player2MarkBtn.disabled = true;
    }

    function addPlayers(){
        let player1 = Player.create().init(player1Input.value, player1MarkBtn.textContent.trim());
        gameBoard.players.push(player1);

        let player2 = Player.create().init(player2Input.value, player2MarkBtn.textContent.trim());
        if(player2.name == 'Tictactinatoer') player2.type = 'AI';
        gameBoard.players.push(player2);
    }

    // Generating the board HTML without eventlisteners.
    function renderBoard(){
        for(let i = gameBoard.width; i > 0; i--){
            let x = ['c','b','a'];
            renderRow(x[i-1]);
        }
    }

    // Sub functions of renderBoard (START)
    function renderRow(params){
        let row = document.createElement('div');
        row.classList.add('game-board-row');
        row.setAttribute('id', `game-board-row-${params}`);
        for(let i = gameBoard.height; i > 0; i--){
            let x = ['c','b','a'];
            renderColumn.call(row,x[i-1]);
        }
        gameBoard['container'].appendChild(row)
    }

    function renderColumn(params) {
        let columnCell = document.createElement('div');
        columnCell.classList.add(`game-board-column`, `game-board-column-${params}`, `game-board-cells`);
        columnCell.setAttribute('data-mark', 'none');
        this.appendChild(columnCell);
    }
    // Sub functions of renderBoard (END)
    function placeMark(e){
        let cell = e.target;
        if(cell.getAttribute('data-mark') == 'none'){
            cell.textContent = matchState.nextMark;
            cell.setAttribute('data-mark', `${matchState.nextMark}`);
            matchState.markCount++;
            
            checkMove(cell);
            // Change marks after move (alternating)
            if(matchState.markCount != 0)matchState.nextMark = (matchState.nextMark == gameBoard.marks[0]) ? gameBoard.marks[1]: gameBoard.marks[0];
            
        }
        else console.log('That cell is already marked!');
    }

    function checkMove(cell) {
        // Check if board full
        if(checkRow(cell) || checkColumn(cell) || checkDiagonal(cell)){
            console.log(`${matchState.nextMark} == ${gameBoard.players[0].mark} : ${matchState.nextMark == gameBoard.players[0].mark}`)
            let winner = (matchState.nextMark == gameBoard.players[0].mark) ? gameBoard.players[0]: gameBoard.players[1];
            matchOver(winner);
        } 
        else if(matchState.markCount >=9) matchOver('none');
        // else if(gameBoard.players[1].type =='AI' && matchState.nextMark == gameBoard.players[1].mark) calculateAIMove(cell);
        else console.log('Game continues');
    }
    // Sub functions of checkMove (START)
    function checkRow(cell) {
        let row = [... cell.parentNode.children].filter(cell => cell.getAttribute('data-mark') != 'none');
        if(row.length == 3){
            return (compareCells(row)) ? true : false;
        }
        return false;
    }
    function checkColumn(cell) {
        let column = [... gameBoard['container'].querySelectorAll(`.${cell.classList[1]}`)].filter(cell => cell.getAttribute('data-mark') != 'none');
        if(column.length == 3){
            return (compareCells(column)) ? true : false;
        }
        else return false;
    }
    function checkDiagonal(cell) {  
        let allCells = gameBoard['container'].querySelectorAll('.game-board-cells');
        let diagonalA = [allCells[0], allCells[4], allCells[8]];
        let diagonalB = [allCells[2], allCells[4], allCells[6]];
        if(cell == allCells[4]){
            return (compareCells(diagonalA) || compareCells(diagonalB)) ? true: false;
        }
        else if(diagonalA.indexOf(cell) != -1){
            return (compareCells(diagonalA)) ? true: false;
        }
        else if(diagonalB.indexOf(cell) != -1){
            return (compareCells(diagonalB)) ? true: false;
        }
        else return false;
    }
    function compareCells(cells) {
        return (cells.every(cell => cell.getAttribute('data-mark') == matchState.nextMark)) ? true: false;
    }
    // Sub functions of checkMove (END)

    // let testObject = {};
    // function aiMoves(){
    //     let cell = calculateAIMove();
    //     placeMark(cell);
    // }

    // function calculateAIMove(){
    //     let allCells = gameBoard['container'].querySelectorAll('.game-board-cells');
    //     let move;
    //     function readBoard(){
    //         if(matchState.markCount == 0 && matchState.nextMark == gameBoard.players[1].mark){
    //             let moves = [allCells[0], allCells[1], allCells[6], allCells[8]];
    //             move = moves[Math.floor(Math.random() *8)];
    //         }
    //         else if(matchState.nextMark == gameBoard.players[1].mark){
    //             for(let i = 0; i < allCells.length; i++){
    //                 testObject[`cell${i}`] = {
    //                     allCells[i].getAttribute('data-mark');
    //                 } 
    //             }  
    //         }
    //         else{
    //             return 0;
    //         }
    //     }
    // }
    // function mapBoard(){
    //     
    //     let allCells = gameBoard['container'].querySelectorAll('.game-board-cells');
    //     return testObject;
    // }
    



    // When a player wins or board is full
    function matchOver(winner){
        //Announce results
        let matchResult = generateResult(winner);
        console.log(matchResult);
        alert(matchResult);
        // Reset match variables
        resetMatchState(winner);
        // Enables play button again for next match
        playBtn.disabled = false;
        // Delete board contents
        while(gameBoard['container'].firstElementChild) gameBoard['container'].removeChild(gameBoard['container'].firstElementChild);
        // Recreates board contents
        renderBoard();
    }

    function generateResult(winner){
        let result;
        if(winner!='none'){
            result = `Match over! ${winner.name} won.`;
            gameBoard.players[gameBoard.players.indexOf(winner)].score++;
            (winner == gameBoard.players[0]) ? player1Score.textContent++: player2Score.textContent++;
        }
        else result = 'Match over! It was a tie.'
        return result;
    }

    function resetMatchState(winner){
        let loser = (gameBoard.players[0] == winner) ? gameBoard.players[1]: gameBoard.players[0];
        matchState.nextMark = loser.mark;
        matchState.markCount = 0;
        // matchState.players = [],
    }

    return{
        renderBoard, gameBoard, matchState,
    }
})();

Game.renderBoard();

