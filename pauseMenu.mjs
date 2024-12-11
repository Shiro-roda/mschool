// File: pauseMenu.mjs
import { returnToMainMenu } from './mainMenu.js';
export const PauseMenu = (() => {
    let isPaused = false; // Tracks pause state
    const pauseMenuElement = document.getElementById("pause-menu");
    const pauseButton = document.getElementById('pause-button');

    // Show the pause menu with animation
    function show() {
        if (pauseMenuElement) {
            pauseButton.classList.remove("active");
            pauseMenuElement.classList.add("active"); // Trigger sliding animation
            isPaused = true;
            document.body.classList.add("paused");
        }
    }

    // Hide the pause menu with animation
    function hide() {
        if (pauseMenuElement) {
            pauseMenuElement.classList.remove("active"); // Trigger sliding-out animation
            pauseButton.classList.add("active");
            isPaused = false;
            document.body.classList.remove("paused");
        }
    }

    // Toggle the pause menu
    function toggle() {
        if (isPaused) {
            hide();
        } else {
            show();
        }
    }

    // Initialize menu buttons
    function initMenuButtons() {
        document.getElementById("resume-button").addEventListener("click", hide);
        document.getElementById("main-menu-button").addEventListener("click", () => {
            hide();
            //returnToMainMenu();
            window.location.reload();
        });
    }

    return { show, hide, toggle, initMenuButtons };
})();
