
import React, {useState, useEffect} from 'react';
import {Box, Text, useInput} from 'ink';

type Player = 'o' | 'x';
type Cell = Player | null;
type Board = Cell[];
type GameState = 'select_mode' | 'select_symbol' | 'playing' | 'game_over';

const App = () => {
	const [gameState, setGameState] = useState<GameState>('select_mode');
	const [gameMode, setGameMode] = useState<'pvc' | 'pvp'>('pvc');
	const [playerSymbol, setPlayerSymbol] = useState<Player>('o');
	const [board, setBoard] = useState<Board>(Array(9).fill(null));
	const [turn, setTurn] = useState<Player>('o');
	const [winner, setWinner] = useState<Player | null>(null);
	const [isDraw, setIsDraw] = useState(false);
	const [cursor, setCursor] = useState(0);
	const [selectionCursor, setSelectionCursor] = useState(0);

	const checkWinner = (currentBoard: Board): Player | null => {
		const lines = [
			[0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
			[0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
			[0, 4, 8], [2, 4, 6], // diagonals
		];
		for (const line of lines) {
			const [a, b, c] = line;
			if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
				return currentBoard[a];
			}
		}
		return null;
	};

	const handleMove = (index: number) => {
		if (winner || board[index]) {
			return;
		}
		const newBoard = [...board];
		newBoard[index] = turn;
		setBoard(newBoard);

		const newWinner = checkWinner(newBoard);
		if (newWinner) {
			setWinner(newWinner);
			setGameState('game_over');
		} else if (newBoard.every(cell => cell !== null)) {
			setIsDraw(true);
			setGameState('game_over');
		} else {
			setTurn(turn === 'o' ? 'x' : 'o');
		}
	};

	const resetGame = () => {
		setBoard(Array(9).fill(null));
		setTurn('o');
		setWinner(null);
		setIsDraw(false);
		setCursor(0);
		setSelectionCursor(0);
		setGameState('select_mode');
	};

	// CPU Move Logic
	useEffect(() => {
		const isCpuTurn = gameMode === 'pvc' && turn !== playerSymbol && !winner && !isDraw;
		if (isCpuTurn) {
			setTimeout(() => {
				const availableMoves = board
					.map((cell, index) => (cell === null ? index : null))
					.filter((val): val is number => val !== null);
				if (availableMoves.length > 0) {
					const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
					handleMove(randomMove);
				}
			}, 500);
		}
	}, [turn, gameMode, playerSymbol, winner, isDraw, board]);


	useInput((input, key) => {
		if (input === 'q') {
			process.exit(0);
		}

		if (gameState === 'game_over') {
			if (input === 'r') {
				resetGame();
			}
			return;
		}

		if (gameState === 'select_mode') {
			if (key.upArrow || key.downArrow) {
				setSelectionCursor(prev => 1 - prev);
			}
			if (key.return) {
				setGameMode(selectionCursor === 0 ? 'pvc' : 'pvp');
				if (selectionCursor === 0) { // PVC
					setGameState('select_symbol');
				} else { // PVP
					setPlayerSymbol('o'); // In PVP, 'o' always starts
					setGameState('playing');
				}
				setSelectionCursor(0);
			}
			return;
		}

		if (gameState === 'select_symbol') {
			if (key.upArrow || key.downArrow) {
				setSelectionCursor(prev => 1 - prev);
			}
			if (key.return) {
				const selectedSymbol = selectionCursor === 0 ? 'o' : 'x';
				setPlayerSymbol(selectedSymbol);
				setGameState('playing');
				// If player chooses 'x', CPU ('o') should make the first move.
				if (selectedSymbol === 'x') {
					setTurn('o');
				}
			}
			return;
		}

		if (gameState === 'playing') {
			// Prevent player from moving on CPU's turn
			if (gameMode === 'pvc' && turn !== playerSymbol) {
				return;
			}

			if (key.leftArrow) setCursor(prev => (prev > 0 ? prev - 1 : 8));
			if (key.rightArrow) setCursor(prev => (prev < 8 ? prev + 1 : 0));
			if (key.upArrow) setCursor(prev => (prev > 2 ? prev - 3 : prev + 6));
			if (key.downArrow) setCursor(prev => (prev < 6 ? prev + 3 : prev - 6));
			if (key.return) handleMove(cursor);
		}
	});

	const renderCell = (cell: Cell, index: number) => {
		const isSelected = index === cursor;
		const isPlayerTurn = !winner && !isDraw && (gameMode === 'pvp' || turn === playerSymbol);
		let content = cell || ' ';
		let color = 'white';
		if (cell === 'o') color = 'cyan';
		if (cell === 'x') color = 'yellow';

		if (isSelected && isPlayerTurn) {
			color = 'green';
			content = cell || '·';
		}

		return (
			<Box key={index} borderStyle="single" borderColor={isSelected && isPlayerTurn ? 'green' : 'white'} width={5} height={3} alignItems="center" justifyContent="center">
				<Text color={color} bold={!!cell}>{content.toUpperCase()}</Text>
			</Box>
		);
	};

	if (gameState === 'select_mode') {
		return (
			<Box flexDirection="column" alignItems="center">
				<Text>Select Game Mode</Text>
				<Box flexDirection="column" marginTop={1}>
					<Text color={selectionCursor === 0 ? 'green' : 'white'}>{selectionCursor === 0 ? '> ' : '  '}Player vs CPU</Text>
					<Text color={selectionCursor === 1 ? 'green' : 'white'}>{selectionCursor === 1 ? '> ' : '  '}Player vs Player</Text>
				</Box>
				<Text>Use arrow keys to select, Enter to confirm.</Text>
			</Box>
		);
	}

	if (gameState === 'select_symbol') {
		return (
			<Box flexDirection="column" alignItems="center">
				<Text>Select Your Mark</Text>
				<Box flexDirection="column" marginTop={1}>
					<Text color={selectionCursor === 0 ? 'green' : 'white'}>{selectionCursor === 0 ? '> ' : '  '}O (First Mover)</Text>
					<Text color={selectionCursor === 1 ? 'green' : 'white'}>{selectionCursor === 1 ? '> ' : '  '}X (Second Mover)</Text>
				</Box>
				<Text>Use arrow keys to select, Enter to confirm.</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" alignItems="center">
			<Text>Tic-Tac-Toe</Text>
			<Box flexDirection="column" marginTop={1}>
				<Box key="row1">{board.slice(0, 3).map((cell, i) => renderCell(cell, i))}</Box>
				<Box key="row2">{board.slice(3, 6).map((cell, i) => renderCell(cell, i + 3))}</Box>
				<Box key="row3">{board.slice(6, 9).map((cell, i) => renderCell(cell, i + 6))}</Box>
			</Box>
			<Box marginTop={1}>
				{winner && <Text color="green">Winner: {winner.toUpperCase()}</Text>}
				{isDraw && <Text color="yellow">It's a draw!</Text>}
				{!winner && !isDraw && (
					<Text>
						{gameMode === 'pvc'
							? turn === playerSymbol ? "Your Turn" : "CPU's Turn"
							: `Turn: ${turn.toUpperCase()}`
						}
					</Text>
				)}
			</Box>
			<Box marginTop={1} flexDirection="column" alignItems="center">
				{gameState !== 'game_over' && <Text key="help-move">Use arrow keys to move, Enter to place your mark.</Text>}
				{gameState === 'game_over' && <Text key="help-reset">Press 'r' to play again.</Text>}
				<Text key="help-quit">Press 'q' to quit.</Text>
			</Box>
		</Box>
	);
};

export default App;
