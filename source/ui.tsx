
import React, {useState} from 'react';
import {Box, Text, useInput} from 'ink';

type Player = 'o' | 'x';
type Cell = Player | null;
type Board = Cell[];

const App = () => {
	const [board, setBoard] = useState<Board>(Array(9).fill(null));
	const [turn, setTurn] = useState<Player>('o');
	const [winner, setWinner] = useState<Player | null>(null);
	const [isDraw, setIsDraw] = useState(false);
	const [cursor, setCursor] = useState(0);

	const checkWinner = (currentBoard: Board): Player | null => {
		const lines = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8],
			[0, 4, 8],
			[2, 4, 6],
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
		} else if (newBoard.every(cell => cell !== null)) {
			setIsDraw(true);
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
	};

	useInput((input, key) => {
		if (winner || isDraw) {
			if (input === 'r') {
				resetGame();
			}
			return;
		}

		if (key.leftArrow) {
			setCursor(prev => (prev > 0 ? prev - 1 : 8));
		}
		if (key.rightArrow) {
			setCursor(prev => (prev < 8 ? prev + 1 : 0));
		}
		if (key.upArrow) {
			setCursor(prev => (prev > 2 ? prev - 3 : prev + 6));
		}
		if (key.downArrow) {
			setCursor(prev => (prev < 6 ? prev + 3 : prev - 6));
		}
		if (key.return) {
				handleMove(cursor);
			}

			if (input === 'q') {
				process.exit(0);
			}
	});

	const renderCell = (cell: Cell, index: number) => {
		const isSelected = index === cursor;
		let content = cell || ' ';
		let color = 'white';
		if (cell === 'o') color = 'cyan';
		if (cell === 'x') color = 'yellow';

		if (isSelected) {
			color = 'green';
			content = cell || '·';
		}

		return (
			<Box
				key={index}
				borderStyle="single"
				borderColor={isSelected ? 'green' : 'white'}
				width={5}
				height={3}
				alignItems="center"
				justifyContent="center"
			>
				<Text color={color} bold={!!cell}>{content.toUpperCase()}</Text>
			</Box>
		);
	};

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
				{!winner && !isDraw && <Text>Turn: {turn.toUpperCase()}</Text>}
			</Box>
			<Box marginTop={1} flexDirection="column" alignItems="center">
				<Text>Use arrow keys to move, Enter to place your mark.</Text>
				{(winner || isDraw) && <Text>Press 'r' to play again.</Text>}
				<Text>Press 'q' to quit.</Text>
			</Box>
		</Box>
	);
};

export default App;
