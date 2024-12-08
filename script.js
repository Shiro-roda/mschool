// DOM Elements
const textEl = document.getElementById("text");
const backgroundEl = document.getElementById("background");
const characterEl = document.getElementById("character");
const choicesEl = document.getElementById("choice-box");

// Scenes
const scenes = [
    { /*0*/
      text: "                                          A girl with long white hair and a blue scarf stops by your locker between classes.                      You've never seen her before,                    but then again it <em>is</em> your first day back after a month-long suspension.",
      background: "",
      character: "",
      choices: [
        { text: "(<em>Turn to face her.</em>)", next: 1},
      ], 
    },
    { /*1*/
      text: "Hi!                      I'm new here,               can you help me get to class?                  Oh,                sorry,           but what's your name?",
      background: "background1.jpg",
      character: "character1.png",
      choices: [
        { text: "\"Madelyn.\"", next: 2 },
        { text: "\"What's yours?\"", next: 4 },
        { text: "(<em>Ignore her.</em>)", next: 3},
      ],
    },
    { /*2*/
      text: "Oh,           that's a lovely name!                  You can call me <strong>Indra</strong>,              by the way.",
      background: "background2.jpg",
      character: "character1.png",
      choices: [
        { text: "\"...thanks. You need help with something?\"", next: 5 },
        { text: "\"What was that?\"", next: 4 },
        { text: "\"Nice. Sorry, I'm kind of busy right now.\"", next: 3 },
      ],
    },
    { /*3*/
      text: "Oh,             uh,                              buh-bye then!",
      background: "background3.jpg",
      character: "",
      choices: [
        { text: "..."},
      ],
    },
    { /*4*/
      text: "Ah     .     .     .            you can call me Indra,              if you'd like   .   .   .",
      background: "background4.jpg",
      character: "character1.png",
      choices: [
        { text: "\"Nice. Sorry, I'm kind of busy right now.\"", next: 3 },
      ],
    },
    { /*5*/
      text: "I told you already,            silly!                    Are you done digging around in there?                        It's a mess,      I don't think you'll find whatever you're looking for.",
      background: "background4.jpg",
      character: "character1.png",
      choices: [
        { text: "\"Alright, I'll show you to class. Which one are you headed to?\"", next: 7 },
        { text: "\"That's none of your business. Do you want me to help you or not?\"", next: 7 },
        { text: "\"Sorry, I'm kind of busy right now.\"", next: 3 },
        { text: "\"<em>Can you screw off?</em>\"", next: 6 },
      ],
    },
    { /*6*/
      text: ".          .           .                                        (<em>She turns around sharply,              stomping away redfaced and incensed with a low grumble</em>.)",
      background: "background4.jpg",
      character: "character1.png",
      choices: [
        { text: "..."},
      ],
    },
    { /*7*/
      text: "(<em>She smiles sweetly under her scarf but doesn't answer,            instead taking you by the hand and pulling you along with strength unbefitting of her stature.                      You barely have a moment to grab your backpack before you're getting dragged down the hall</em>.)",
      background: "background4.jpg",
      character: "character1.png",
      choices: [
        { text: "\"...Can you let go of me? I thought you needed <em>me</em> to show you to class.\"", next: 8 },
        { text: "<em>Where does she think she's going??</em>", next: 9 },
        { text: "(<em>Accept your fate.</em>)", next: 9 },
      ],
    },
    { /*8*/
      text: "Nope!",
      background: "background4.jpg",
      character: "character1.png",
      choices: [
        { text: "\"...\"", next: 9 },
      ],
    },
    { /*9*/
      text: "(<em>Before long,             you're brought all the way to your own classroom.                    She pulls you inside,          throwing you into your usual seat by the back window and taking her own right beside you.                She leans forward and lays her head in her arms,             proudly peeking at you over them</em>.)",
      background: "background4.jpg",
      character: "character1.png",
      choices: [
        { text: "(<em>Try to ignore her and turn to look out the window</em>)", next: 10 },
        { text: "\"...since when were we seatmates?\"", next: 11 },
        { text: "(<em>Glare at her like she just grew an elephant's trunk with ears to match</em>)", next: 12 },
      ],
    },
    { /*10*/
      text: "You see a wild-eyed rooster standing just outside,                         staring you down like it's found a bug              or a kernel of corn.                                                 <br>Your classroom is two stories up.                      On a mountain populated by nothing but fake tress for miles around.                That's definitely a snake coming out of its ass.                                                             <br>You can feel yourself turn to stone as the world freezes over.",
      background: "background4.jpg",
      character: "character1.png",
      choices: [
        { text: ""},
      ],
    },
    { /*11*/
      text: "Since today,               <em>silly!</em>",
      background: "background4.jpg",
      character: "character1.png",
      choices: [
        { text: "\"...You're daft.\"", next: 12},
      ],
    },
    { /*12*/
      text: "(<em>She sticks her tongue out at you and turns to listen for the teacher taking role to call her name</em>.)",
      background: "background4.jpg",
      character: "character1.png",
      choices: [
        { text: "..."},
      ],
    },
    { /**/
      text: "",
      background: "background4.jpg",
      character: "character1.png",
      choices: [
        { text: ""},
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
function typeText(htmlString) {
    return new Promise((resolve) => {
      const parser = new DOMParser();
      const parsedHtml = parser.parseFromString(htmlString, "text/html");
      const nodes = Array.from(parsedHtml.body.childNodes);
  
      textEl.innerHTML = ""; // Clear the content of the text element
      let currentIndex = 0;
      let typingInterval;
  
      // Function to handle typing of nodes
      function typeNode(node) {
        if (currentIndex >= nodes.length) {
          resolve(); // Resolve when all nodes are processed
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
  
      // Handle user input to skip typing
      function showFullText() {
        if (textEl.innerHTML.length >= 10) {
            clearInterval(typingInterval); // Stop the typing effect
            textEl.innerHTML = htmlString; // Replace with full text
            resolve(); // Resolve promise to allow progress
        }
      }
  
      // Event listeners for user interaction
      document.addEventListener('click', showFullText);  // Click to skip typing
      document.addEventListener('keydown', function(event) {
        if (event.key === ' ') {  // Spacebar to skip typing
          showFullText();
        }
      });
    });
  }
  
  
  
  

function playTypingSound() {
    const audio = new Audio("Retro_Single_v1_wav.mp3");
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

document.getElementById('start-button').addEventListener('click', function() {
  loadScene(0);
});
