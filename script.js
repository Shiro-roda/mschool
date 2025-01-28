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
const cachedAudio = {}; // Global cache for audio files

import { PauseMenu } from "./pauseMenu.mjs";

document.addEventListener("DOMContentLoaded", () => {
  PauseMenu.initMenuButtons();

  document.getElementById("pause-button").addEventListener("click", () => {
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

// Scenes array (to be populated dynamically)
let scenes = [];

// Load a Scene
async function loadScene(sceneIndex) {
  const scene = scenes[sceneIndex];
  if (!scene) {
    console.error("Scene not found:", sceneIndex);
    return;
  }

  nameTabEl.innerText = scene.name || "Sight";
  updateNameStyles(scene.nameStyle);

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

  updateTextBoxStyles(scene.textBoxStyle);

  choicesEl.innerHTML = "";

  // Set background before typing, fallback to main background
  backgroundEl.style.backgroundImage = `url('${scene.beforeBackground || scene.background}')`;

  // Display text with typing effect
  
  const typingSound = scene.typingSound || "Retro_Single_v2_wav.mp3";
  await typeText(scene.text, typingSound);

  // Update background after typing, if specified
  if (scene.afterBackground) {
    backgroundEl.style.backgroundImage = `url('${scene.afterBackground}')`;
  }

  // Show choices after typing effect
  showChoices(scene.choices);
}

// Background Music Handling
let musicIsplaying = true;
// Function to handle background music
function updateBackgroundMusic(newTrack) {
  if (!newTrack) return; // If no new track, keep the current one playing

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
  if (musicIsplaying === true) {
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
      if (typingAudio.readyState >= 3) {
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
      if (!skipTyping) {
        skipTyping = true;
        clearInterval(typingInterval);
        textEl.innerHTML = htmlString;
        removeSkipListeners();
        resolve();
      }
    }

    function addSkipListeners() {
      document.addEventListener("keydown", (event) => {
        if (event.key === " ") skipTypingEffect();
      });
    }

    function removeSkipListeners() {
      document.removeEventListener("keydown", (event) => {
        if (event.key === " ") skipTypingEffect();
      });
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
    button.addEventListener("click", () => {
      if (choice.action) {
        handleAction(choice.action, choice.actionTarget);
      } else {
        loadScene(choice.next);
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
      window.open("index.html", "_blank");
      open("game.html", "_self").close();
      break;
    case "redirect":
      window.location.href = actionTarget;
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

// Initialize Game
async function initializeGame() {
  try {
    const response = await fetch("scenes.json");
    scenes = await response.json();

    if (scenes.length > 0) {
      pauseButton.classList.add("active");
      loadScene(0);
    } else {
      console.error("No scenes available in scenes.json.");
    }
  } catch (error) {
    console.error("Error loading scenes:", error);
  }
}

// Start the game
initializeGame();
