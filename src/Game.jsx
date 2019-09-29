import React, { Component, Fragment } from 'react';
import './Game.css';

const GameState = {
	PLAYING: 1,
	STALEMATE: 2, // ie no winner is possible but spaces remain on board
	WON: 3,
	FINISHED: 4,
}

const X_MARK = 'X';
const O_MARK = 'O';

// taking cells left to right then top to bottom, these are the indices
// of the winning moves ie the straight lines
const WinningMoves = [
	[ '0','1','2', ],
	[ '3','4','5', ],
	[ '6','7','8', ],
	[ '0','3','6', ],
	[ '1','4','7', ],
	[ '2','5','8', ],
	[ '0','4','8', ],
	[ '6','4','2', ],
]

class GameCell extends Component {
	render() {
		const { mark, onClick } = this.props;

		return <td className="GameCell" onClick={onClick}>
			{mark}
			</td>;

	}
}

class GameBoard extends Component {
	render() {
		const { marks, moveHandler, gameState } = this.props;

		// map mark array into table rows
		const rows = [0,1,2].map((row) => 
			<tr key={row}>
				{[0,1,2].map((col) => 
					<GameCell 
						key={col + row}
						mark={marks[row * 3 + col]}
						onClick={marks[row * 3 + col] !== '' || gameState > GameState.STALEMATE
							? null 
							: (e) => moveHandler(col,row)}
						/>)}
			</tr> );

		return	<table>
				<tbody>
					{rows}
				</tbody>
			</table>	;


	}
}


export class Game extends Component {

	constructor(props) {
	    super(props);

	    // the convention followed here is that the first player in the first game is X,
		// and the first player in succeeding games is the winner of the previous game, who
		// continues with their previous mark.  

		// init the state which isn't common to a game reset
	    this.state = {
	    	whoseTurnIsIt: 0,
	    	gameWinners: [],
	    };
	    
		this.handleMove = this.handleMove.bind(this);
	}

	componentDidMount() {
		this.resetGame();
	}

	resetGame() {
		const { gameWinners } = this.state;
		
    	this.setState(state => ({
	    	gameState: GameState.PLAYING,
      		moves: [],
	    	undoneMoves: [],

      		// most recent winner goes first
      		whoseTurnIsIt: gameWinners.length > 0 ? gameWinners[gameWinners.length-1] : 0,
	    }));	
	}

	makeMarks() {
		const { moves } = this.state;

		// we make this array during assessment and rendering to avoid putting it in state,
		// which complicates matters during undo/redo
		let marks = ['' , '', '', '', '', '', '', '', '',];
		for (let move of moves) {
			marks[move.row * 3 + move.col] = move.mark;
		}
		return marks;
	}

	assessGame(moves, undoneMoves) {
		const { whoseTurnIsIt, gameState, gameWinners } = this.state;

		let marks = this.makeMarks();

		// the only way to be here with this state is if we undid after a win
		if (gameState === GameState.WON)
			gameWinners.pop();

		// we can now assess the state of the game; reset to Playing each time
		// in case we're undoing a move; all other states are set below if applicable
		let newState = GameState.PLAYING;	

		// if we undo back to the start, there's nothing to do re game state
		if ( moves.length > 0) {

			// has the current player won? We know the indexes of each winning move,
			// so check each one for a sequence of 3 marks
			let playerWin = moves[moves.length-1].mark.repeat(3);
			let achievableWins = 0;
			for (let win of WinningMoves) {
				let winMarks = win.map(e => marks[e]).join('');
				if (winMarks === playerWin) {
					gameWinners.push(whoseTurnIsIt);
					newState = GameState.WON;
					break;
				}
				else {

					// stalemate checking; if winMarks only contains a single
					// type of mark (or none), it can potentially still be achieved, so we
					// don't have a stalemate.
					if (! (winMarks.includes(X_MARK) && winMarks.includes(O_MARK))) {

						// we need to check if the player(s) have time to achieve this win,
						// which depends on how many spaces are left in the row.
						if (winMarks.length === 0) {

							// empty row; the next player can start it but the other player
							// must play twice outside it, so 5 turns needed
							if (moves.length < 5)
								achievableWins += 1;
						}
						else {

							// one player has started this win so they must finish it; it depends
							// whether they act next or not.

							// note that whoseTurnIsIt is out of date at this point, so the test is reversed
							let playerMovesNext = winMarks.includes(X_MARK) 
								? whoseTurnIsIt === 1
								: whoseTurnIsIt === 0;

							// for each move in the winning row made by the player, the opponent
							// must move somewhere else, unless the player is next to move which
							// subtracts 1 move
							let movesRequired = (3 - winMarks.length) * 2;
							if (playerMovesNext)
								movesRequired -= 1;

							if (moves.length + movesRequired <= 9)
								achievableWins += 1;
						}
					}
				}
			}
		
			if (newState !== GameState.WON) {

				if (moves.length === 9)
					newState = GameState.FINISHED;
				else {

					// stalemate, ie winning is no longer possible for either player.
					if (achievableWins === 0)
						newState = GameState.STALEMATE;
				}
			}
		}

    	this.setState(state => ({
      		moves: moves,
      		undoneMoves: undoneMoves,
      		whoseTurnIsIt: whoseTurnIsIt === 0 ? 1 : 0,
      		gameState: newState,
      		gameWinners: gameWinners,
	    }));
  	}

	handleMove(col, row) {
		const { whoseTurnIsIt, moves, } = this.state;

		moves.push({
			col: col,
			row: row,
			mark: whoseTurnIsIt === 0 ? X_MARK : O_MARK,
		});

		// real moves empty the redo queue
		this.assessGame(moves, []);
	}

	render() {
		const { moves, undoneMoves, whoseTurnIsIt, gameState, gameWinners } = this.state;

		// don't render until mounted so game init/reset can share code
		if (moves === undefined)
			return null;

		let marks = this.makeMarks();

		return <Fragment>
			{gameState === GameState.PLAYING || gameState === GameState.STALEMATE
				? <h2>Player {whoseTurnIsIt+1} to play</h2>
				: <h2>Game Over</h2>}
			{gameState === GameState.WON
				? <span>The game has been won by player {gameWinners[gameWinners.length-1]+1}</span>
				: gameState === GameState.STALEMATE
					? <span>The game cannot be won by either player</span>
					: <span>&nbsp;</span>}

			<GameBoard 
				marks={marks}
				gameState={gameState}
				moveHandler={this.handleMove}
				/>			

			<span>
				<button
					className="GameButton"
					disabled={moves.length === 0}
					onClick={(e) => {
						undoneMoves.push(moves.pop());
						this.assessGame(moves, undoneMoves);
					}}
					>Undo Move</button>

				<button 
					className="GameButton" 
					disabled={undoneMoves.length === 0}
					onClick={(e) => {
						moves.push(undoneMoves.pop());
						this.assessGame(moves, undoneMoves);
					}}
					>Redo Move</button>

			</span>

			<button className="GameButton" onClick={(e) => this.resetGame()}>Start a new game</button>		
			
				
		</Fragment>;

	}
}