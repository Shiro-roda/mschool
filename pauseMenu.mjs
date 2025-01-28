// File: pauseMenu.mjs
export const PauseMenu = (() => {
    let isPaused = false; // Tracks pause state
    const pauseMenuElement = document.getElementById("pause-menu");
    const pauseButton = document.getElementById('pause-button');
    const volumeSlider = document.getElementById('pause-volume-slider');
    let musicElement = null; // Store the passed background music reference

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


    function initMusicControls(music) {
        if (!music) {
            console.error("Music element is not defined.");
            return;
        }
    
        musicElement = music;
    
        // Sync slider and music volume
        volumeSlider.value = musicElement.volume;
        volumeSlider.addEventListener("input", () => {
            const volume = parseFloat(volumeSlider.value); // Ensure value is parsed correctly
            musicElement.volume = volume; // Update music volume
            console.log(`Volume set to: ${volume}`); // Debugging log
        });
    
        // Update slider when music volume changes (optional, for future features)
        musicElement.addEventListener("volumechange", () => {
            volumeSlider.value = musicElement.volume;
        });
    }

    

    // Initialize menu buttons
    function initMenuButtons() {
        document.getElementById("resume-button").addEventListener("click", hide);
        document.getElementById("main-menu-button").addEventListener("click", () => {
            window.open("index.html", "_blank");
            open('game.html', '_self').close();
        });
    }

    return { show, hide, toggle, initMenuButtons, initMusicControls };
})();
