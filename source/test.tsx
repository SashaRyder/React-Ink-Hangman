import React from "react";
import chalk from "chalk";
import test from "ava";
import { render } from "ink-testing-library";
import { App } from "./cli";

test("runs", (t) => {
	const { frames } = render(<App />);

	t.is(frames[0], chalk`Welcome to Hangman, built with React Ink!`);
});
