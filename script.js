const X_CLASS = 'x'
const CIRCLE_CLASS = 'circle'

const boardDOM = document.getElementById('board')
const cellElements = document.querySelectorAll('[data-cell]')

const startGameMenu = document.getElementById("startGameMenu")
const playerButton = document.getElementById("playerStartButton")
const aiStartButton = document.getElementById('aiStartButton')

const winningMessageElement = document.getElementById('winningMessage')
const restartButton = document.getElementById('restartButton')
const winningMessageTextElement = document.querySelector('[data-winning-message-text]')

let aiTurn
let userMark
let aiMark
let HUMAN = -1;
let AI = +1;
let boardState = initialBoardState()

startGame()
startMenu()

playerButton.addEventListener('click', playAsX)
aiStartButton.addEventListener('click', playAsO)
restartButton.addEventListener('click', startMenu)

function startMenu() {
	startGameMenu.classList.add('show')
	winningMessageElement.classList.remove('show')
}

function startGame() {
	boardState = initialBoardState()
	cellElements.forEach(cell => {
		cell.classList.remove(X_CLASS)
		cell.classList.remove(CIRCLE_CLASS)
		cell.removeEventListener('click', handleClick)
		cell.addEventListener('click', handleClick, { once: true })
	})
	setBoardHoverClass()
	winningMessageElement.classList.remove('show')
	startGameMenu.classList.remove('show')
}

function playAsX() {
	aiTurn = false
	userMark = X_CLASS
	aiMark = CIRCLE_CLASS
	startGame()
}

function playAsO() {
	aiTurn = true
	userMark = CIRCLE_CLASS
	aiMark = X_CLASS
	startGame()
	aiAction()
}

// set hover when mouse on cell
function setBoardHoverClass() {
	boardDOM.classList.remove(X_CLASS)
	boardDOM.classList.remove(CIRCLE_CLASS)
	if (userMark == X_CLASS) {
		boardDOM.classList.add(X_CLASS)
	} else {
		boardDOM.classList.add(CIRCLE_CLASS)
	}
}

function endGame(draw) {
	if (draw) {
		winningMessageTextElement.innerText = 'Draw!'
	} else {
		winningMessageTextElement.innerText = `${aiTurn ? "Computer's" : "You's"} Wins!`
	}
	winningMessageElement.classList.add('show')
}

function isDraw() {
	return [...cellElements].every(cell => {
		return cell.classList.contains(X_CLASS) || cell.classList.contains(CIRCLE_CLASS)
	})
}

function placeMark(cell, currentClass) {
	cell.classList.add(currentClass)
}

function swapTurns() {
	aiTurn = !aiTurn
	if (aiTurn) {
		aiAction()
	}
}

// initialize board state. 0 = empty
function initialBoardState() {
	return [
		[0, 0, 0],
		[0, 0, 0],
		[0, 0, 0],
	];
}

// take current board state from DOM and convert to data
function convertBoardToState(cellElements) {
	let currentState = [...cellElements]
	let currentBoard = [];
	currentState.forEach((cell, index) => {
		if (cell.classList.contains(userMark)) {
			currentState[index] = -1
		} else if (cell.classList.contains(aiMark)) {
			currentState[index] = 1
		} else {
			currentState[index] = 0;
		}
	}
	)
	//convert back to 2D array
	while (currentState.length) currentBoard.push(currentState.splice(0, 3));
	return currentBoard;
}

function handleClick(e) {
	const cell = e.target
	const x = cell.id.split("")[0];
	const y = cell.id.split("")[1];
	if (cell.classList.contains(aiMark)) {
		return null;
	} else {
		placeMark(cell, userMark)
		boardState[x][y] = HUMAN
		boardState = convertBoardToState(cellElements)
	}
	gameOverAll(boardState)
}

// AI Algorithm
// evaluate board state score
function evaluate(board) {
	let score = 0;

	if (gameOver(board, AI)) {
		score = +1;
	}
	else if (gameOver(board, HUMAN)) {
		score = -1;
	} else {
		score = 0;
	}

	return score;
}

/* This function tests if a specific player wins */
function gameOver(board, player) {
	let win_state = [
		[board[0][0], board[0][1], board[0][2]],
		[board[1][0], board[1][1], board[1][2]],
		[board[2][0], board[2][1], board[2][2]],
		[board[0][0], board[1][0], board[2][0]],
		[board[0][1], board[1][1], board[2][1]],
		[board[0][2], board[1][2], board[2][2]],
		[board[0][0], board[1][1], board[2][2]],
		[board[2][0], board[1][1], board[0][2]],
	];

	for (let i = 0; i < 8; i++) {
		let line = win_state[i];
		let count = 0;
		for (let j = 0; j < 3; j++) {
			if (line[j] == player)
				count++;
		}
		if (count == 3)
			return true;
	}
	return false;
}

// This function test if the human or computer wins
function checkWinner(board) {
	return gameOver(board, HUMAN) || gameOver(board, AI);
}

function gameOverAll(board) {
	if (checkWinner(board)) {
		endGame(false)
	} else if (isDraw()) {
		endGame(true)
	} else {
		swapTurns()
	}
}

// find the empty cell
function possibleMove(board) {
	let cells = [];
	for (let x = 0; x < 3; x++) {
		for (let y = 0; y < 3; y++) {
			if (board[x][y] == 0)
				cells.push([x, y]);

		}
	}
	return cells;
}

// check if move is valid
function validMove(x, y) {
	try {
		if (boardState[x][y] == 0) {
			return true;
		}
		else {
			return false;
		}
	} catch (e) {
		return false;
	}
}

// Set the move on board, if the coordinates are valid
function setMove(x, y, player) {
	if (validMove(x, y)) {
		boardState[x][y] = player;
		return true;
	}
	else {
		return false;
	}
}

// minimax algorithm
function minimax(state, depth, player) {
	let best;

	if (player == AI) {
		best = [-1, -1, -1000];
	}
	else {
		best = [-1, -1, +1000];
	}

	if (depth == 0 || checkWinner(state)) {
		let score = evaluate(state);
		return [-1, -1, score];
	}

	possibleMove(state).forEach(cell => {
		let x = cell[0];
		let y = cell[1];
		state[x][y] = player;
		let score = minimax(state, depth - 1, -player);
		state[x][y] = 0;
		score[0] = x;
		score[1] = y;

		if (player == AI) {
			if (score[2] > best[2])
				best = score;
		}
		else {
			if (score[2] < best[2])
				best = score;
		}
	});
	return best;
}

// Ai action to board
function aiAction() {
	let x, y;
	let move;
	let cell;

	if (possibleMove(boardState).length == 9) {
		x = parseInt(Math.random() * 3);
		y = parseInt(Math.random() * 3);
	}
	else {
		move = minimax(boardState, possibleMove(boardState).length, AI);
		x = move[0];
		y = move[1];
	}

	if (setMove(x, y, AI)) {
		boardState[x][y] = AI;
		cell = document.getElementById(String(x) + String(y));
		cell.classList.add(aiMark);
		gameOverAll(boardState)
	}
}