import "./index.css";
import { clsx } from "clsx";
import Header from "./components/Header";
import { useState } from "react";
import { languages } from "./languages.js";
import Confetti from "react-confetti";
import { generate } from "random-words";
import getFarewellText from "./utils.js";

export default function App() {
  // Word state values
  const [currentWord, setCurrentWord] = useState(generate());

  // Hold guessed letter values via button click
  const [guessedLetters, setGuessedLetters] = useState([]);

  // Derived values for wrongGuessCount
  const wrongGuessCount = guessedLetters.filter(
    (letter) => !currentWord.includes(letter)
  );

  // Derived values for isGameWon, isGameLost, isGameOver
  const isGameWon = currentWord
    .split("")
    .every((letter) => guessedLetters.includes(letter));
  const isGameLost = wrongGuessCount.length >= languages.length - 1;
  const isGameOver = isGameWon || isGameLost;
  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1];
  const isLastGuessIncorrect =
    lastGuessedLetter && !currentWord.includes(lastGuessedLetter);

  // Handle for guesses letters
  function addGuessedLetters(letter) {
    setGuessedLetters((prevLetter) =>
      prevLetter.includes(letter) ? prevLetter : [...prevLetter, letter]
    );
  }

  // Generate english keyboard
  const alphabet = Array.from("abcdefghijklmnopqrstuvwxyz");
  const keyboardElements = alphabet.map((letter) => {
    const isCorrect =
      currentWord.includes(letter) && guessedLetters.includes(letter);
    const isWrong =
      !currentWord.includes(letter) && guessedLetters.includes(letter);
    const className = clsx({
      correct: isCorrect,
      wrong: isWrong,
    });
    return (
      <button
        disabled={isGameOver}
        aria-disabled={guessedLetters.includes(letter)}
        aria-label={`Letter ${letter}`}
        className={className}
        onClick={() => addGuessedLetters(letter)}
        key={letter}
      >
        {letter.toUpperCase()}
      </button>
    );
  });

  // Handle langauages mapping
  const languageElements = languages.map((item, index) => {
    const lostLanguage = index < wrongGuessCount.length;
    const SKULL = "\u{1F480}";
    const styles = {
      backgroundColor: item.backgroundColor,
      color: item.color,
    };

    const className = clsx({
      language: !lostLanguage,
      lost: lostLanguage,
    });
    return (
      <span
        className={className}
        style={lostLanguage ? { color: styles.color } : styles}
        key={item.name}
      >
        {lostLanguage ? SKULL : item.name}
      </span>
    );
  });

  // Handle word display
  const wordElement = currentWord
    .split("")
    .map((letter, index) => (
      <span key={`${letter}-${index}`}>
        {guessedLetters.includes(letter) ? letter.toUpperCase() : ""}
      </span>
    ));

  // Handle game status
  const className = clsx("game-status-container", {
    win: isGameWon,
    lose: isGameLost,
    farewell: !isGameOver && isLastGuessIncorrect,
  });
  const handleGameStatus = () => {
    if (!isGameOver && isLastGuessIncorrect) {
      return (
        <p className="farewell-message">
          {getFarewellText(languages[wrongGuessCount.length - 1].name)}
        </p>
      );
    }
    if (isGameWon) {
      return (
        <>
          <h2>You win!</h2>
          <p>Well done {`\u{1F389}`} </p>
        </>
      );
    }
    if (isGameLost) {
      return (
        <>
          <h2>Game over!</h2>
          <p>You lose! Better start learning Assembly {`\u{1F622}`}</p>
        </>
      );
    } else {
      return null;
    }
  };

  // New Game handler function
  function handleNewGame() {
    setCurrentWord(generate());
    setGuessedLetters([]);
  }

  return (
    <main>
      {isGameWon && (
        <section className="confetti-container">
          <Confetti
            width={1600}
            height={1200}
            recycle={false}
            numberOfPieces={500}
          />
        </section>
      )}
      <Header />
      <section aria-live="polite" className={className}>
        {handleGameStatus()}
      </section>
      <section className="language-container">{languageElements}</section>
      <section className="remaining-guess-count">{`Remaining guess: ${
        languages.length - 1 - wrongGuessCount.length
      }`}</section>
      <section className="word-container">{wordElement}</section>
      <section className="keyboard-container">{keyboardElements}</section>
      <section className="new-game-button">
        {isGameOver && <button onClick={handleNewGame}>New Game</button>}
      </section>
    </main>
  );
}
