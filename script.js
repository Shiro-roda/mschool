// DOM Elements
const textEl = document.getElementById("text");
const nameTabEl = document.getElementById("name-tab");
const backgroundEl = document.getElementById("background");
const characterEl = document.getElementById("character");
const choicesEl = document.getElementById("choice-box");
const toggleMusicButton = document.getElementById('toggle-music-button');
const pauseButton = document.getElementById('pause-button');
const pauseMenuElement = document.getElementById("pause-menu");



let backgroundMusic = null;

// Scenes array (to be populated dynamically)
let scenes = [];

// Fetch scenes from JSON file
async function fetchScenes() {
  try {
    const response = await fetch('scenes.json'); // Ensure scenes.json is in the same directory
    scenes = await response.json();
  } catch (error) {
    console.error('Error loading scenes:', error);
  }
}

// Load a Scene
async function loadScene(sceneIndex) {
  const scene = scenes[sceneIndex];

  nameTabEl.innerText = scene.name || "Sight"; // Set scene name, or leave blank if undefined
  updateNameStyles(scene.nameStyle);

  // Update character
  if (scene.character) {
    characterEl.style.display = "block";
    characterEl.src = scene.character;
  } else {
    characterEl.style.display = "none";
  }

  // Handle background music
  updateBackgroundMusic(scene.backgroundMusic);

  updateTextBoxStyles(scene.textBoxStyle);

  choicesEl.innerHTML = "";

  // Update background to `beforeBackground` or fallback to `background`
  if (scene.beforeBackground) {
    backgroundEl.style.backgroundImage = `url('${scene.beforeBackground}')`;
  } else {
    backgroundEl.style.backgroundImage = `url('${scene.background}')`;
  }

  // Display text with scene-specific typing sound
  await typeText(scene.text, scene.typingSound || "Retro_Single_v2_wav.mp3");

  // Update background to `afterBackground` after typing effect, if specified
  if (scene.afterBackground) {
    backgroundEl.style.backgroundImage = `url('${scene.afterBackground}')`;
  }

  // Show choices after typing effect is finished
  showChoices(scene.choices);
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
  if (musicIsplaying === true) {
    backgroundMusic.play();
  }
}

// Toggle Music Button functionality
toggleMusicButton.addEventListener('click', function () {
  if (!backgroundMusic) {
      console.error('No background music initialized.');
      return;
  }

  if (musicIsplaying) {
      backgroundMusic.pause();
      musicIsplaying = false;
  } else {
      backgroundMusic.play().catch((error) => {
          console.error('Music playback error:', error);
      });
      musicIsplaying = true;
  }
});


// Typing Effect
function typeText(htmlString, soundFile = "Retro_Single_v2_wav.mp3") {
  return new Promise((resolve) => {
    const parser = new DOMParser();
    const parsedHtml = parser.parseFromString(htmlString, "text/html");
    const nodes = Array.from(parsedHtml.body.childNodes);

    // Clear the text element and reset variables
    textEl.innerHTML = "";
    let currentIndex = 0;
    let typingInterval;
    let skipTyping = false;

    // Initialize the typing audio
    const typingAudio = new Audio(soundFile);
    typingAudio.volume = 0.3;

    // Function to play typing sound
    function playTypingSound() {
      if (!typingAudio.paused) {
        typingAudio.currentTime = 0; // Reset playback if already playing
      }
      typingAudio.play();
    }

    // Function to type nodes
    function typeNode() {
      if (currentIndex >= nodes.length) {
        removeSkipListeners(); // Remove listeners after typing finishes
        resolve(); // Resolve promise
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
            playTypingSound(); // Play sound at every other character
          }

          i++;
          if (i >= text.length) {
            clearInterval(typingInterval);
            typeNode(); // Move to the next node
          }
        }, 30);
      } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const elementClone = currentNode.cloneNode(true);
        textEl.appendChild(elementClone);
        typeNode(); // Move to the next node
      }
    }

    typeNode(); // Start typing the first node

    // Skip typing
    function skipTypingEffect() {
      const minTypedChars = 3; // Threshold for visible characters before skipping
      if (textEl.innerHTML.length >= minTypedChars) {
        if (skipTyping) return; // Prevent multiple triggers
        skipTyping = true;

        clearInterval(typingInterval); // Stop the typing effect
        textEl.innerHTML = htmlString; // Display full text immediately
        removeSkipListeners(); // Clean up listeners
        resolve(); // Resolve the promise
      }
    }

    // Attach skip event listeners
    function addSkipListeners() {
      document.addEventListener("click", skipTypingEffect);
      document.addEventListener("keydown", (event) => {
        if (event.key === " ") skipTypingEffect();
      });
    }

    // Remove skip event listeners
    function removeSkipListeners() {
      document.removeEventListener("click", skipTypingEffect);
      document.removeEventListener("keydown", (event) => {
        if (event.key === " ") skipTypingEffect();
      });
    }

    addSkipListeners(); // Add listeners to allow skipping
  });
}

// Show Choices
function showChoices(choices) {
  if (choices.length === 0) {
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
}

// Handle Special Actions
function handleAction(action, actionTarget) {
  switch (action) {
    case "mainMenu":
      //returnToMainMenu();
      window.location.reload();
      break;
    case "redirect":
      // Redirect to an external site
      window.location.href = actionTarget;
      break;
    default:
      console.error(`Unknown action: ${action}`);
  }
}

// Initialize Game
async function initializeGame() {
  await fetchScenes(); // Load scenes from JSON
  document.getElementById("start-button").addEventListener("click", function () {
    document.getElementById("main-menu").style.display = "none";

    // Show the game content
    document.getElementById("game").style.display = "block";
    pauseButton.style.display = 'inline-block';
    pauseButton.classList.add("active");
    pauseMenuElement.style.display = 'flex';
    loadScene(0); // Start with the first scene
  });
}


// Start the game when the script loads
initializeGame();

import { PauseMenu } from './pauseMenu.mjs';
import { returnToMainMenu } from './mainMenu.js';
import { getIsMenuActive } from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    PauseMenu.initMenuButtons();

    // Example of toggling the pause menu on "P" key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'p' || e.key === 'P') {
            PauseMenu.toggle();
        }
    });
});

// Toggle pause menu when the pause button is clicked
pauseButton.addEventListener('click', () => {
  PauseMenu.toggle();
});

