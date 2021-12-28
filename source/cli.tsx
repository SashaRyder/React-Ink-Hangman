import React, { useEffect, useState } from "react";
import { render, useInput, useApp } from "ink";
import { GreenText } from "./components/GreenText";
import { readdir, readFile } from "fs/promises";
import _ from "underscore";
import { lives, hiddenTextCharacter } from "./config.json";

export const App = () => {
	const [categories, setCategories] = useState<string[]>([]);
	const [word, setWord] = useState("");
	const [category, setCategory] = useState("");
	const [livesLeft, setLivesLeft] = useState(lives);
	const [guessedCharacters, setGuessedCharacters] = useState<string[]>([]);

	const [initialWordLoaded, setInitialWordLoaded] = useState(false);
	const [gameState, setGameState] = useState("intro");

	const { exit } = useApp();

	useInput((input, key) => {
		if (key.escape) {
			exit();
		}
		if (["won", "lost", "intro"].includes(gameState)) {
			if (key.return) {
				setLivesLeft(lives);
				setGuessedCharacters([]);
				loadWord();
			}
			return;
		}

		const character = input.charAt(input.length - 1);
		if (guessedCharacters.includes(character)) {
			return;
		}
		setGuessedCharacters([...guessedCharacters, character]);
		if (!word.includes(character)) {
			setLivesLeft(livesLeft - 1);
		}
	});

	useEffect(() => {
		const loadCategories = async () => {
			const dir = await readdir("./categories/");
			setCategories(dir);
		};
		if (gameState !== "intro") {
			loadCategories();
		}
	}, [gameState]);

	useEffect(() => {
		if (categories.length > 0 && !initialWordLoaded) {
			loadWord();
			setInitialWordLoaded(true);
		}
	}, [categories]);

	useEffect(() => {
		const hiddenWord = renderWordWithGuesses();
		if (hiddenWord.length <= 0) {
			return;
		}
		if (!hiddenWord.includes(hiddenTextCharacter)) {
			setGameState("won");
		}
	}, [guessedCharacters]);

	useEffect(() => {
		if (livesLeft === 0) {
			setGameState("lost");
		}
	}, [livesLeft]);

	const loadWord = async (): Promise<void> => {
		setGameState("loading");
		const randomCategory = _.sample(categories);
		if (randomCategory) {
			const categoryContents = (
				await readFile(`./categories/${randomCategory}`)
			).toString();
			const categoryJson = JSON.parse(categoryContents) as string[];
			setCategory(randomCategory?.replace(".json", ""));
			setWord(_.sample(categoryJson) || "");
			setGameState("playing");
		}
	};

	const renderWordWithGuesses = (): string => {
		const revealedCharacters = [...guessedCharacters, " "];
		const hiddenWord = [...word].reduce((prev, curr) => {
			const character = revealedCharacters.includes(curr)
				? curr
				: hiddenTextCharacter;
			return `${prev}${character}`;
		}, "");
		return hiddenWord;
	};

	const renderGame = (): JSX.Element => {
		return (
			<>
				<GreenText>Lives Left: {livesLeft}</GreenText>
				<GreenText>Category: {category}</GreenText>
				<GreenText>Characters guessed: {guessedCharacters.join(" ")}</GreenText>
				<GreenText>Word: {renderWordWithGuesses()}</GreenText>
				{gameState === "won" && (
					<GreenText>You Won! Press Enter to start a new game.</GreenText>
				)}
				{gameState === "lost" && (
					<GreenText>
						You Lost :( The word was: {word}. Press Enter to start a new game.
					</GreenText>
				)}
			</>
		);
	};

	const returnApp = (): JSX.Element => {
		if (gameState === "intro") {
			return (
				<>
					<GreenText>Welcome to Hangman, built with React Ink!</GreenText>
					<GreenText>Press Esc to exit at any time.</GreenText>
					<GreenText>Press Enter to start a new game.</GreenText>
				</>
			);
		} else if (gameState === "loading") {
			return <GreenText>Loading Game..</GreenText>;
		} else {
			return renderGame();
		}
	};

	return returnApp();
};

render(<App />);
