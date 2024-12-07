// DOM Elements
const textEl = document.getElementById("text");
const backgroundEl = document.getElementById("background");
const characterEl = document.getElementById("character");
const choicesEl = document.getElementById("choice-box");

// Scenes
const scenes = [
    {
      text: "A girl with long white hair stops by your locker between classes.             You've never seen her before,         although it *is* your first day back after a month-long suspension.",
      background: "",
      character: "",
      choices: [
        { text: "<em>Turn to face her.</em>", next: 1},
      ], 
    },
    {
      text: "Hi!              I'm new here,          can you help me get to class?                  Oh,            sorry,           but what's your name?",
      background: "background1.jpg",
      character: "character1.png",
      choices: [
        { text: "Madelyn.", next: 2 },
        { text: "What's yours?", next: 4 },
        { text: "<em>Ignore her.</em>", next: 3},
      ],
    },
    {
      text: "Oh,           that's a lovely name!                  You can call me Indra,              by the way.",
      background: "background2.jpg",
      character: "character1.png",
      choices: [
        { text: "What was that?", next: 4 },
        { text: "Nice. Sorry, I'm kind of busy right now.", next: 3 },
      ],
    },
    {
      text: "Oh,             uh,                              buh-bye then!",
      background: "background3.jpg",
      character: "",
      choices: [],
    },
    {
      text: "Ah     .     .     .            you can call me Indra,              if you'd like   .   .   .",
      background: "background4.jpg",
      character: "character1.png",
      choices: [
        { text: "Nice. Sorry, I'm kind of busy right now.", next: 3 },
      ],
    },
];

// Load a Scene
async function loadScene(sceneIndex) {
  const scene = scenes[sceneIndex];

  // Update background
  backgroundEl.style.backgroundImage = `url('${scene.background}')`;

  // Update character
  if (scene.character) {
    characterEl.style.display = "block";
    characterEl.src = scene.character;
  } else {
    characterEl.style.display = "none";
  }

  choicesEl.innerHTML = "";

  // Display text and wait for it to finish typing
  await typeText(scene.text);

  // Show choices after typing effect is finished
  showChoices(scene.choices);
}

// Typing Effect
function typeText(text) {
    return new Promise((resolve) => {
      let i = 0;
      textEl.textContent = "";
      const interval = setInterval(() => {
        const currentChar = text[i];
        textEl.textContent += currentChar;
  
        // Play the typing sound only every other character, and skip spaces
        if (i % 2 === 0 && currentChar !== " ") {
          playTypingSound();
        }
  
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          resolve();  // Resolve the promise when typing is done
        }
      }, 30);
    });
  }

function playTypingSound() {
    const audio = new Audio("Retro_Single_v1_wav.wav");
    audio.volume = 0.3;
    audio.play();  
}

// Show Choices
function showChoices(choices) {
  

  if (choices.length === 0) {
    choicesEl.style.display = "none";
    return;
  }

  choicesEl.style.display = "flex";

  choices.forEach(choice => {
    const button = document.createElement("button");
    button.innerHTML = choice.text;
    button.classList.add("choice");
    button.addEventListener("click", () => {
      loadScene(choice.next);
    });
    choicesEl.appendChild(button);
  });
}

// Start the game
loadScene(0);
