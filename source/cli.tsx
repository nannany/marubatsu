import React from 'react';
import {render} from 'ink';
import App from './ui.js';

const Main = () => {
	return <App />;
};

if (process.stdin.isTTY) {
	const app = render(<Main />);
	app.waitUntilExit().then(() => console.log('Game finished.'));
} else {
	console.log('This game requires an interactive terminal.');
	process.exit(1);
}
