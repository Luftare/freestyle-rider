import { debounce } from "lodash";
import GameInput from "./GameInput";
import GameScene from "./GameScene";
import { showMessage } from "./Graphics";
import gameLevel from "./gameLevel";
import audio from "./audio";

const TIME_FACTOR_NORMAL = 1;
const TIME_FACTOR_SLOW = 0.5;

const canvas = document.querySelector("canvas");
const slowdownButton = document.getElementById("slowdown-button");
const startGameButton = document.getElementById("start-game");
const menuButton = document.getElementById("menu-button");
const input = new GameInput(canvas);

let gameConfig = {
  stance: -1,
  canvas,
  input,
  gameLevel,
};

let game;

function boot() {
  audio.init();
  setEventListeners();
}

function fitGameToScreen() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function setEventListeners() {
  const isTouchDevice = "ontouchstart" in window;

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      startGame();
      window.removeEventListener("keydown", handleEnterKey);
    }
  };

  document
    .getElementById("stance-option--goofy")
    .addEventListener("change", (e) => {
      gameConfig.stance = -1;
    });

  document
    .getElementById("stance-option--regular")
    .addEventListener("change", (e) => {
      gameConfig.stance = 1;
    });

  startGameButton.addEventListener(
    "click",
    isTouchDevice ? displayGuide : startGame
  );
  startGameButton.addEventListener(
    "touchstart",
    isTouchDevice ? displayGuide : startGame
  );
  menuButton.addEventListener("click", endGame);
  window.addEventListener("keydown", handleEnterKey);

  document.getElementById("guide").addEventListener("mousedown", startGame);
  document.getElementById("guide").addEventListener("touchstart", startGame);

  window.addEventListener("keydown", ({ key }) => {
    if (key.toLowerCase() === "s") {
      const shouldActivate = game.state.timeFactor === TIME_FACTOR_NORMAL;
      setSlowDown(shouldActivate);
    }
  });

  slowdownButton.addEventListener("touchstart", toggleSlowdown);
  slowdownButton.addEventListener("mousedown", toggleSlowdown);

  window.addEventListener("resize", debounce(fitGameToScreen, 250));
}

export function setSlowDown(activate) {
  game.state.timeFactor = activate ? TIME_FACTOR_SLOW : TIME_FACTOR_NORMAL;
  const methodName = activate ? "add" : "remove";
  slowdownButton.classList[methodName]("button--active");
}

function toggleSlowdown(e) {
  e.preventDefault();
  e.stopPropagation();
  const shouldActivate = game.state.timeFactor === TIME_FACTOR_NORMAL;
  setSlowDown(shouldActivate);
}

function displayGuide() {
  document.getElementById("menu-view").hidden = true;
  document.getElementById("guide").hidden = false;
}

function startGame() {
  canvas.hidden = false;
  document.getElementById("game-scene-buttons").hidden = false;
  document.getElementById("menu-view").hidden = true;
  document.getElementById("guide").hidden = true;
  fitGameToScreen();

  game = new GameScene(gameConfig);
  game.render();

  showMessage("Break a leg!", "#42f59b");

  setTimeout(() => {
    audio.startAmbientSounds();
    game.loop.start();
  }, 1000);
}

function endGame() {
  canvas.hidden = true;
  document.getElementById("game-scene-buttons").hidden = true;
  document.getElementById("menu-view").hidden = false;
  game.loop.stop();
  game = null;
  audio.stopAllSounds();
}

boot();
