import { state, toggleAudioState } from './state.js';

function setGameVariable(variable, value) {
  const currentState = state.get('gameState') || {};
  currentState[variable] = value;
  state.set('gameState', currentState);
  console.log(`Variable ${variable} set to`, value);
}

function getGameVariable(variable) {
  const currentState = state.get('gameState') || {};
  return currentState[variable];
}

function addChoiceToHistory(choiceText) {
  const currentState = state.get('gameState') || {};
  if (!currentState.choiceHistory) {
    currentState.choiceHistory = [];
  }
  currentState.choiceHistory.push(choiceText);
  state.set('gameState', currentState);
}

function hasChoiceBeenMade(choiceText) {
  const currentState = state.get('gameState') || {};
  return currentState.choiceHistory && currentState.choiceHistory.includes(choiceText);
}

// DOM Elements
const textEl = document.getElementById("text");
const nameTabEl = document.getElementById("name-tab");
const backgroundEl = document.getElementById("background");
const characterEl = document.getElementById("character");
const choicesEl = document.getElementById("choice-box");
const toggleMusicButton = document.getElementById("toggle-music-button");
const pauseButton = document.getElementById("pause-button");

let backgroundMusic = null;
let musicIsPlaying = true;
// Game paused flag (set via PauseMenu events)
let gamePaused = false;
const cachedAudio = {}; // Global cache for audio files

import { PauseMenu } from "./pauseMenu.mjs";

document.addEventListener("DOMContentLoaded", () => {
  PauseMenu.initMenuButtons();

  document.getElementById("pause-button").addEventListener("click", () => {
    // Ensure audio is initialized/unlocked before toggling pause (fixes first-pause music not stopping)
    try { initializeAudioPlayback(); } catch (e) { /* ignore */ }
    PauseMenu.toggle();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "p") {
      PauseMenu.toggle();
    }
  });

  // Initialize audio playback on first interaction
  document.addEventListener("click", initializeAudioPlayback, { once: true });
});

// Listen for pause/resume events dispatched by PauseMenu
document.addEventListener('game:paused', () => {
  gamePaused = true;
  // Pause background music immediately
  try {
    if (backgroundMusic && !backgroundMusic.paused) backgroundMusic.pause();
  } catch (e) { console.warn('Error pausing background music on game:paused', e); }
});

document.addEventListener('game:resumed', () => {
  gamePaused = false;
  // Resume background music if the user had it enabled
  try {
    if (backgroundMusic && musicIsPlaying) backgroundMusic.play().catch(() => {});
  } catch (e) { console.warn('Error resuming background music on game:resumed', e); }
});

// Scenes array (to be populated dynamically)
let scenes = [];
// Chapter-level defaults (from scene files that include a defaults object)
let chapterDefaults = {};

// Load a Scene
async function loadScene(sceneIndex) {
  const scene = scenes[sceneIndex];
  if (!scene) {
    console.error("Scene not found:", sceneIndex);
    return;
  }

  // Save the current scene index to game state
  setGameVariable('currentScene', sceneIndex);

  nameTabEl.innerText = scene.name || "Sight";
  // Merge chapter defaults with scene-specific styles when calling update
  const mergedNameStyle = Object.assign({}, chapterDefaults.nameStyle || {}, scene.nameStyle || {});
  updateNameStyles(mergedNameStyle);

  if (scene.character) {
    characterEl.style.display = "block";
    characterEl.src = scene.character;
  } else {
    characterEl.style.display = "none";
  }

  updateBackgroundMusic(scene.backgroundMusic);
  if (backgroundMusic.paused === true && musicIsPlaying === true)
    {
      document.addEventListener('click', () => {
        updateBackgroundMusic(scene.backgroundMusic);
      }, { once: true });
    }

  const mergedTextBoxStyle = Object.assign({}, chapterDefaults.textBoxStyle || {}, scene.textBoxStyle || {});
  updateTextBoxStyles(mergedTextBoxStyle);

  choicesEl.innerHTML = "";

  // Set background before typing, fallback to main background
  backgroundEl.style.backgroundImage = `url('${scene.beforeBackground || scene.background}')`;

  // Display text with typing effect
  
  const typingSound = scene.typingSound || chapterDefaults.typingSound || "Retro_Single_v2_wav.mp3";
  await typeText(scene.text, typingSound);

  // Update background after typing, if specified
  if (scene.afterBackground) {
    backgroundEl.style.backgroundImage = `url('${scene.afterBackground}')`;
  }

  // Show choices after typing effect
  showChoices(scene.choices);
}

// Function to handle background music
function updateBackgroundMusic(newTrack) {
  if (!newTrack) return; // If no new track, keep the current one playing

  if (backgroundMusic && backgroundMusic.src === new URL(newTrack, window.location.href).href) {
    console.log("The new track is the same as the current one. No changes made.");
    return;
  }

  if (backgroundMusic) {
    // If already playing music, stop it
    backgroundMusic.pause();
    backgroundMusic = null;
  }

  // Start playing the new track
  backgroundMusic = new Audio(newTrack);
  backgroundMusic.loop = true; // Loop background music
  backgroundMusic.volume = 0.5; // Adjust volume as needed
  backgroundMusic.volume = parseFloat(document.getElementById('pause-volume-slider').value) || 0.5; // Sync with slider
  PauseMenu.initMusicControls(backgroundMusic); // Pass new music to PauseMenu
  if (musicIsPlaying === true) {
    backgroundMusic.play();
  }
}

toggleMusicButton.addEventListener("click", function () {
  if (!backgroundMusic) {
    console.error("No background music initialized.");
    return;
  }

  if (musicIsPlaying) {
    backgroundMusic.pause();
    musicIsPlaying = false;
  } else {
    backgroundMusic.play().catch((error) => {
      console.error("Music playback error:", error);
    });
    musicIsPlaying = true;
  }
  toggleAudioState();
});

// Typing Effect
function typeText(htmlString, soundFile) {
  return new Promise((resolve) => {
    const parser = new DOMParser();
    const parsedHtml = parser.parseFromString(htmlString, "text/html");
    const nodes = Array.from(parsedHtml.body.childNodes);

    textEl.innerHTML = "";
    let currentIndex = 0;
    let typingInterval;
    let skipTyping = false;

    // Load or reuse audio instance
    if (!cachedAudio[soundFile]) {
      cachedAudio[soundFile] = new Audio(soundFile);
      cachedAudio[soundFile].volume = 0.3;
    }
    const typingAudio = cachedAudio[soundFile];

    function playTypingSound() {
      if (gamePaused) return; // don't play while paused
      if (typingAudio && typingAudio.readyState >= 3) {
        typingAudio.currentTime = 0;
        typingAudio.play().catch((error) => {
          console.error("Typing sound playback error:", error);
        });
      }
    }

    function typeNode() {
      if (currentIndex >= nodes.length) {
        removeSkipListeners();
        resolve();
        return;
      }

      const currentNode = nodes[currentIndex];
      currentIndex++;

      if (currentNode.nodeType === Node.TEXT_NODE) {
        let text = currentNode.textContent;
        let i = 0;

        typingInterval = setInterval(() => {
          if (gamePaused) return; // suspend progress while paused

          const currentChar = text[i];
          textEl.innerHTML += currentChar;

          if (i % 2 === 0 && currentChar !== " ") {
            playTypingSound();
          }

          i++;
          if (i >= text.length) {
            clearInterval(typingInterval);
            typeNode();
          }
        }, 30);
      } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const elementClone = currentNode.cloneNode(true);
        textEl.appendChild(elementClone);
        typeNode();
      }
    }

    typeNode();

    function skipTypingEffect() {
      if (gamePaused) return; // don't allow skipping while paused
      if (!skipTyping) {
        skipTyping = true;
        clearInterval(typingInterval);
        textEl.innerHTML = htmlString;
        removeSkipListeners();
        resolve();
      }
    }

    // Use named listeners so they can be removed correctly
    function onSkipKey(event) {
      if (event.key === " ") skipTypingEffect();
    }

    function onGamePaused() {
      // Pause typing audio immediately when game is paused
      try { if (typingAudio && !typingAudio.paused) typingAudio.pause(); } catch (e) { /* ignore */ }
    }

    function onGameResumed() {
      // Nothing special required here; typing will resume because intervals continue
    }

    function addSkipListeners() {
      document.addEventListener("keydown", onSkipKey);
      document.addEventListener('game:paused', onGamePaused);
      document.addEventListener('game:resumed', onGameResumed);
    }

    function removeSkipListeners() {
      document.removeEventListener("keydown", onSkipKey);
      document.removeEventListener('game:paused', onGamePaused);
      document.removeEventListener('game:resumed', onGameResumed);
    }

    addSkipListeners();
  });
}

// Show Choices
function showChoices(choices, currentSceneIndex) {
  choicesEl.innerHTML = ""; // Clear any existing choices
  const hasChoices = Array.isArray(choices) && choices.length > 0;

  if (!hasChoices) {
    // Add fallback for navigation when no choices are provided
    document.addEventListener("keydown", navigateToNextScene);
    document.addEventListener("click", navigateToNextScene);

    choicesEl.style.display = "none";
    return;
  }


  choicesEl.style.display = "flex";
  choices.forEach((choice) => {
    const button = document.createElement("button");
    button.innerHTML = choice.text;
    button.classList.add("choice");

    // Check if the choice has been made before and add a class if so
    if (hasChoiceBeenMade(choice.text)) {
      button.classList.add("previously-chosen");
    }

    button.addEventListener("click", () => {
      if (choice.code) {
        // Execute the code within the choice
        eval(choice.code);
      } 
      if (choice.action) {
        handleAction(choice.action, choice.actionTarget, choice.variable, choice.value, choice.next);
      }
      if (choice.next) {
        loadScene(choice.next);
      }
      if (choice.trackChoice !== false && choices.length > 1) {
        addChoiceToHistory(choice.text);
      }
    });
    choicesEl.appendChild(button);
  });

  function removeNextSceneListeners() {
    document.removeEventListener("keydown", navigateToNextScene);
    document.removeEventListener("click", navigateToNextScene);
  }
}

// Handle Special Actions
function handleAction(action, actionTarget) {
  switch (action) {
    case "mainMenu":
      setGameVariable('currentScene', 0);
      const currentState = state.get('gameState') || {};
      state.set('gameState', currentState);
      window.open("index.html", "_blank");
      open("game.html", "_self").close();
      break;
    case "redirect":
      window.location.href = actionTarget;
      break;
    case "setVariable":
      setGameVariable(variable, value);
      break;
    default:
      console.error(`Unknown action: ${action}`);
  }
}

function initializeAudioPlayback() {
  Object.values(cachedAudio).forEach((audio) => {
    // Attempt to unlock the audio context
    audio.play().catch(() => {
      console.warn("Audio playback blocked, awaiting user interaction.");
    });
    audio.pause();
  });

  if (backgroundMusic) {
    backgroundMusic.play().catch(() => {
      console.warn("Background music blocked, retrying after user interaction.");
    });
    // If the game is currently paused, ensure music does not keep playing after initialization
    if (gamePaused) {
      try { if (!backgroundMusic.paused) backgroundMusic.pause(); } catch (e) { /* ignore */ }
    }
  }
}

// One-Time Interaction Listener
document.addEventListener("click", initializeAudioPlayback, { once: true });

function updateNameStyles(customStyles) {
  const nameTab = document.getElementById("name-tab");

  // Get computed styles from style.css
  const defaultStyles = getComputedStyle(nameTab);

  // Function to safely apply styles
  function applyStyle(property, value) {
    if (value && defaultStyles[property] !== value) {
      nameTab.style[property] = value;
    } else if (!value) {
      // Reset to default if no custom value is provided
      nameTab.style[property] = defaultStyles[property];
    }
  }

  // Apply provided styles or reset to default
  if (customStyles) {
    Object.keys(customStyles).forEach((property) => {
      applyStyle(property, customStyles[property]);
    });
  } else {
    // Reset all styles if no custom styles are provided
    nameTab.style.cssText = ""; // Reset inline styles to match style.css
  }
}

function updateTextBoxStyles(customStyles) {
  const textBox = document.getElementById("text-box");

  // Get computed styles from style.css
  const defaultStyles = getComputedStyle(textBox);

  // Function to safely apply styles
  function applyStyle(property, value) {
    if (value && defaultStyles[property] !== value) {
      textBox.style[property] = value;
    } else if (!value) {
      // Reset to default if no custom value is provided
      textBox.style[property] = defaultStyles[property];
    }
  }

  // Apply provided styles or reset to default
  if (customStyles) {
    Object.keys(customStyles).forEach((property) => {
      applyStyle(property, customStyles[property]);
    });
  } else {
    // Reset all styles if no custom styles are provided
    textBox.style.cssText = ""; // Reset inline styles to match style.css
  }
}

// -- New helper: load scenes from a given JSON file and optionally start at a given scene index
async function loadScenesFromFile(filename, startIndex = 0) {
  try {
    if (!filename) {
      console.error("No scenes filename provided to loadScenesFromFile.");
      return;
    }
    const response = await fetch(filename);
    const loadedScenes = await response.json();

    // Support two shapes for scene files for backward compatibility:
    // 1) An array of scenes (original behavior)
    // 2) An object: { defaults: { ... }, scenes: [ ... ] }
    if (Array.isArray(loadedScenes)) {
      chapterDefaults = {};
      scenes = loadedScenes;
    } else if (loadedScenes && Array.isArray(loadedScenes.scenes)) {
      chapterDefaults = loadedScenes.defaults || {};
      scenes = loadedScenes.scenes;
    } else {
      console.error("Loaded scenes file has an unsupported shape:", filename);
      return;
    }

    if (!Array.isArray(scenes) || scenes.length === 0) {
      console.error("Loaded scenes file is empty or scenes array is invalid:", filename);
      return;
    }

    // Merge top-level chapter defaults into individual scenes where values are missing.
    // For style objects like nameStyle / textBoxStyle, do a shallow merge so scene overrides apply.
    function mergeDefaultsIntoScene(scene, defaults) {
      if (!defaults || typeof defaults !== 'object') return scene;
      const merged = Object.assign({}, defaults, scene || {});

      // For nested style objects, do shallow merge so individual scene keys override defaults
      if (defaults.nameStyle || scene.nameStyle) {
        merged.nameStyle = Object.assign({}, defaults.nameStyle || {}, scene.nameStyle || {});
      }
      if (defaults.textBoxStyle || scene.textBoxStyle) {
        merged.textBoxStyle = Object.assign({}, defaults.textBoxStyle || {}, scene.textBoxStyle || {});
      }

      // Ensure other defaults like backgroundMusic, typingSound, beforeBackground, afterBackground
      ['backgroundMusic', 'typingSound', 'beforeBackground', 'afterBackground', 'character'].forEach((k) => {
        if (merged[k] === undefined && defaults[k] !== undefined) {
          merged[k] = defaults[k];
        }
      });

      return merged;
    }

    scenes = scenes.map(s => mergeDefaultsIntoScene(s, chapterDefaults));
    // Save the filename so it can persist in the game state
    setGameVariable('scenesFile', filename);
    pauseButton.classList.add("active");
    // Load the startIndex if within range, otherwise 0
    const indexToLoad = (typeof startIndex === 'number' && startIndex >= 0 && startIndex < scenes.length) ? startIndex : 0;
    loadScene(indexToLoad);
  } catch (error) {
    console.error("Error loading scenes from file:", filename, error);
  }
}

// Convenience wrapper to switch chapters by filename
function setChapter(filename, startIndex = 0) {
  setScenesFile(filename, startIndex);
}

// Utility to switch scenes file at runtime. It persists the filename in game state and reloads.
function setScenesFile(filename, startIndex = 0) {
  if (!filename) {
    console.error("setScenesFile called without a filename");
    return;
  }
  setGameVariable('scenesFile', filename);
  loadScenesFromFile(filename, startIndex);
}

// Initialize Game
async function initializeGame() {
  try {
    // Load saved game state first so we can decide which scenes file to load
    const savedState = state.get('gameState');
    if (savedState) {
      console.log('Loaded game state:', savedState);
      Object.keys(savedState).forEach(key => {
        setGameVariable(key, savedState[key]);
      });

      // Apply audio state
      if (!savedState.isAudioEnabled) {
        if (backgroundMusic) backgroundMusic.pause();
        musicIsPlaying = false;
      }
    }

    // Decide default scenes file based on whether eyeCaught is set in the saved state.
    // If eyeCaught is true, use scenes.json; otherwise use scenesOG.json.
    const defaultScenesFile = (savedState && savedState.eyeCaught) ? 'firstDayBackB.json' : 'firstDayBackA.json';

    // If a scenesFile was explicitly saved in the gameState use it; otherwise use the default above.
    const scenesFileFromState = getGameVariable('scenesFile') || defaultScenesFile;
    const startScene = getGameVariable('currentScene') || 0;
    await loadScenesFromFile(scenesFileFromState, startScene);
  } catch (error) {
    console.error("Error initializing game:", error);
  }
}

// Start the game
initializeGame();


