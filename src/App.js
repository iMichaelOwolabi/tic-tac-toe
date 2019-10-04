import React from 'react';
import './App.css';

const findEmptySpaces = (board, humanPlayer, aiPlayer) => {
  return board.filter(x => (x !== humanPlayer && x !== aiPlayer ));
};

const winningBoard = (board, player) => {
  if(
    (board[0] === player && board[1] === player && board[2] === player) ||
    (board[3] === player && board[4] === player && board[5] === player) ||
    (board[6] === player && board[7] === player && board[8] === player) ||
    (board[0] === player && board[3] === player && board[6] === player) ||
    (board[1] === player && board[4] === player && board[7] === player) ||
    (board[2] === player && board[5] === player && board[8] === player) ||
    (board[0] === player && board[4] === player && board[8] === player) ||
    (board[2] === player && board[4] === player && board[6] === player)
  ){ return true; }
  return false;
};

// minimax algorithm implementation
const minimax = (board, player, humanPlayer, aiPlayer) => {
  const availableSpaces = findEmptySpaces(board, humanPlayer, aiPlayer);

  // Check for final states
  if (winningBoard(board, aiPlayer)) return { score: 10 };
  if (winningBoard(board, humanPlayer)) return { score: -10 };
  if (availableSpaces.length === 0) return { score: 0 };
 

  // Create a list of all posible moves according to the current board state
  const moves = availableSpaces.map(position => {

    // Generate a new board with the current position replaced by the current player mark
    const newBoard = board.map(x => {
      if (x === position) return player;
      return x;
    });

    // Switch between ai and human player
    const newPlayer = (player === humanPlayer) ? aiPlayer : humanPlayer;

    return {
      position: position,
      score: minimax(newBoard, newPlayer, humanPlayer, aiPlayer).score
    };
  });

  // Get best move for the current player
  const bestMove = moves.reduce((prev, current) => {
    // The human player will choose the board that will minimize the AI score
    if (player === humanPlayer) {
      if (current.score < prev.score) return current;
      return prev;
    }

    // The AI will choose the board that will maximize the AI score
    if (player === aiPlayer) {
      if (current.score > prev.score) return current;
      return prev;
    }
  });

  return bestMove;
};

class Game extends React.Component {
  constructor(props){
    super(props);
    
    const starterPlayer = (() => {
      const randomNum = Math.floor(Math.random() * 2) + 1;
      if (randomNum === 1) return props.humanPlayer;
      return props.aiPlayer;
    })();

    this.state = {
      board: [0,1,2,3,4,5,6,7,8],
      playerTurn: starterPlayer,
      finalState: false,
      aiWinner: false,
      humanWinner: false,
      fullBoard: false
    };
    
    this.handleItemClick = this.handleItemClick.bind(this);
    this.checkFinalState = this.checkFinalState.bind(this);
    this.makeAiMove = this.makeAiMove.bind(this);
    this.restartGame = this.restartGame.bind(this);
    
    if(starterPlayer === props.aiPlayer) {
      this.makeAiMove(this.state.board); 
    }
  }
  
  checkFinalState(board) {
    const { aiPlayer, humanPlayer } = this.props;

    if(winningBoard(board, aiPlayer)) {
      this.setState({
        finalState: true,
        aiWinner: true
      });
      return true;
    }

    if(winningBoard(board, humanPlayer)) {
      this.setState({
        finalState: true,
        humanPlayer: true
      });
      return true;
    }
    
    if(!findEmptySpaces(board, humanPlayer, aiPlayer).length) {
      this.setState({
        finalState: true,
        fullBoard: true
      });
      return true;
    }
    
    return false;
  }
  
  makeAiMove(board) {
    const { aiPlayer, humanPlayer } = this.props;
    const bestMove = minimax(board, aiPlayer, humanPlayer, aiPlayer).position;
    
    setTimeout(() => {
      this.setState(
        {
          board: board.map((current, index) => {
            return (index === bestMove) ? aiPlayer : current;
          }),
          playerTurn: humanPlayer
        }
      );
      this.checkFinalState(this.state.board);
    }, 2000)
  }
  
  handleItemClick(position) {
    const { aiPlayer, humanPlayer } = this.props;

    // Disable position click when it's the AI turn
    if (this.state.playerTurn === aiPlayer) return;
    
    // Don't let user overwrite already used position
    console.log(this.state.board[position]);
    if ( position === aiPlayer || position === humanPlayer) return;
    
    // Add new player mark to the board state and change turn to AI
    this.setState(
      (prevState, props) => ({
        board: prevState.board.map((current, index) => {
          return (index === position) ? humanPlayer : current;
        }),
        playerTurn: aiPlayer
      }),
      () => {
        if (this.checkFinalState(this.state.board)) return;
        this.makeAiMove(this.state.board);
      }
    );
  }

  restartGame() {
    window.location.reload();
  }

  render() {
    const { playerTurn, finalState, aiWinner, humanWinner, fullBoard } = this.state;
    const { humanPlayer, aiPlayer } = this.props;

    return (
      <div className="game-container">
        { aiWinner && <h4 className="turn-title">You lost the game.</h4>}
        { humanWinner && <h4 className="turn-title">You just won the game.</h4>}
        { fullBoard && <h4 className="turn-title">The game ended in a tie.</h4>}
        
        { playerTurn === humanPlayer && !finalState &&
          <h4 className="turn-title"><span className="bold">Your</span> turn</h4>
        }

        { playerTurn === aiPlayer && !finalState &&
          <h4 className="turn-title">It's the <span className="bold">computer's</span> turn</h4>
        }
        
        <Board
          board={this.state.board}
          handleItemClick={this.handleItemClick}
          finalState={finalState}
          aiWinner={aiWinner}
          humanWinner={humanWinner}
          fullBoard={fullBoard}
        />
        <button className="restart" onClick={this.restartGame}>Restart Game</button>
      </div>
    );
  }
}

Game.defaultProps = {
  humanPlayer: 'O',
  aiPlayer: 'X'
};

const Board = ({ board, handleItemClick, finalState, aiWinner, humanWinner, fullBoard }) =>
  <div className="board">
    { finalState &&
        <span className="final-state-emoji">
          { aiWinner }
          { humanWinner }
          { fullBoard }
        </span>
    }
    <div className={`board-items-container ${finalState && 'hide'}`}>
      {
        board.map((val, index) =>
           <BoardItem
             number={index}
             value={val}
             handleClick={handleItemClick}
             />
           )
      }
    </div>
  </div>;

const BoardItem = ({ number, value, handleClick }) =>
  <div
    className={`board-item board-item-${number}`}
    onClick={() => {handleClick(value)}}
  >
    { value === 'X' && <div className="value-x"/>}
    { value === 'O' && <div className="value-o"/>}
    { (value !== 'X' && value !== 'O') && <div className="value-o only-hover" />}
  </div>;

export default Game;
