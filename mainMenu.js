import { setIsMenuActive } from './state.js';
import { getIsMenuActive } from './state.js';

document.addEventListener("DOMContentLoaded", function () {
    const mainMusic = document.getElementById('main-music');
    const startButton = document.getElementById('start-button');
    const exitButton = document.getElementById('exit-button');
    const optionsButton = document.getElementById('options-button');
    const backButton = document.getElementById('back-button');
    const toggleMusicButton = document.getElementById('toggle-music-button');
    const resetProgressButton = document.getElementById('reset-progress-button');
    const optionsMenu = document.getElementById('options-menu');
    const mainMenu = document.getElementById('main-menu');
    const game = document.getElementById('game');
    const volumeSlider = document.getElementById('volume-slider');
    const sceneSelectorButton = document.getElementById('scene-selector-button');
    const linksButton = document.getElementById('links-button');
    const feedbackButton = document.getElementById("feedback-button");
    const feedbackModal = document.getElementById("feedback-modal");
    const feedbackForm = document.getElementById("feedback-form"); // The Netlify form
    const feedbackText = document.getElementById("feedback-text");
    const submitFeedbackButton = document.getElementById("submit-feedback-button");
    const closeFeedbackButton = document.getElementById("close-feedback-button");
    

    
    
  

    setIsMenuActive(true);
    let musicToggled = false;

    document.body.addEventListener('click', () => {
        if (mainMusic.paused === true && musicToggled === false) {
            mainMusic.play().catch((error) => {
                console.error('Main menu music playback error:', error);
            });
            musicToggled = true;
        }
    });

    // Initialize music volume
    mainMusic.volume = 0.5;

    // "Play Game" button functionality
    startButton.addEventListener('click', function () {
        window.open("game.html", "_blank");
        open('index.html', '_self').close();
    });

    // Exit button functionality
    exitButton.addEventListener('click', function () {
        open('index.html', '_self').close();
       
    });

    // Toggle Options Menu
    optionsButton.addEventListener('click', function () {
        feedbackButton.classList.add("active");
        optionsMenu.classList.toggle('active');
    });

    // Close Options Menu with Back Button
    backButton.addEventListener('click', function () {
        optionsMenu.classList.remove('active');
    });

    // Toggle Music Button functionality
    toggleMusicButton.addEventListener('click', function () {
        if (mainMusic.paused && getIsMenuActive() === true) {
            mainMusic.play().catch((error) => {
                console.error('Music playback error:', error);
            });
        } else {
            mainMusic.pause();
        }
    });

    // Volume Slider functionality
    volumeSlider.addEventListener('input', function () {
        mainMusic.volume = this.value;
    });

    sceneSelectorButton.addEventListener('click', function () {
        alert("This feature is under construction <3");
    });

    linksButton.addEventListener('click', function () {
        alert("This feature is under construction <3");
    });

    // Alert for buttons under construction
    resetProgressButton.addEventListener('click', function () {
        alert("This feature is under construction <3");
    });
    

    // Show the feedback modal
    feedbackButton.addEventListener("click", () => {
        feedbackModal.classList.add("active"); // Show backdrop
        document.querySelector(".modal-content").classList.add("active"); // Slide content down // Add active class to slide modal down
        feedbackButton.classList.remove("active"); // Hide the feedback button if necessary
        feedbackModal.style.transform = "translate(0, 0%)"
    });

    // Close the feedback modal
    closeFeedbackButton.addEventListener("click", () => {
        feedbackModal.style.transform = "translate(0, -200%)";
        feedbackText.value = ""; // Clear the feedback form
        feedbackButton.classList.add("active"); // Show the feedback button again
        
    });


    // Handle feedback submission
    feedbackForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default page reload
    
        const feedback = feedbackText.value.trim();
        if (!feedback) {
            alert("Please enter your feedback.");
            return;
        }
    
        // Let Netlify handle the form submission
        try {
            const formData = new FormData(feedbackForm);
            const response = await fetch("/", {
                method: "POST",
                body: formData,
            });
    
            if (response.ok) {
                alert("Thank you for your feedback!");
                feedbackText.value = ""; // Clear the text area
                feedbackModal.classList.remove("active");
            } else {
                throw new Error("Failed to submit feedback.");
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("There was an error submitting your feedback. Please try again.");
        }
    });
    
    

    async function sendFeedbackToAPI(feedback) {
        try {
        const response = await fetch('/submit-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedback }),
        });
    
        if (!response.ok) {
            throw new Error('Failed to submit feedback');
        }
    
        const data = await response.json();
        console.log(data.message);
        alert('Thank you for your feedback!');
        } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('There was an error submitting your feedback. Please try again.');
        }
    }

    


    


    
    

});

document.addEventListener("DOMContentLoaded", () => {
    const updatesWindow = document.getElementById("updates-window");

    // Fetch updates from the JSON file
    fetch("updates.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch updates.");
            }
            return response.json();
        })
        .then(data => {
            // Clear the updates window
            updatesWindow.innerHTML = "";

            // Populate updates dynamically
            data.forEach(update => {
                // Create elements for each update
                const header = document.createElement("h3");
                header.className = "update-header";
                header.textContent = update.header;

                const text = document.createElement("p");
                text.className = "update-text";
                text.textContent = update.text;

                // Append to the updates window
                updatesWindow.appendChild(header);
                updatesWindow.appendChild(text);
            });
        })
        .catch(error => {
            updatesWindow.textContent = "Failed to load updates.";
            console.error(error);
        });
});


export function returnToMainMenu() {
    const mainMenu = document.getElementById('main-menu');
    const game = document.getElementById('game');
    const pauseMenu = document.getElementById('pause-menu');
    const pauseButton = document.getElementById('pause-button');

    // Reset visibility states
    mainMenu.style.display = 'flex';
    game.style.display = 'none';
    pauseMenu.style.display = 'none';
    pauseButton.style.display = 'none';

    // Reset pause menu styles and states
    pauseMenu.classList.remove('active');
    document.body.classList.remove('paused');
    const mainMusic = document.getElementById('main-music');
    mainMusic.play().catch((error) => {
        console.error('Music playback error:', error);
    });

    setIsMenuActive(true); // Use the setter to update the state
    
    
}