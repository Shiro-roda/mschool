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

    setIsMenuActive(true);

    // Initialize music volume
    mainMusic.volume = 0.5;

    // "Play Game" button functionality
    startButton.addEventListener('click', function () {
        if (!mainMusic.paused) {
            mainMusic.pause();
            mainMusic.currentTime = 0;
        }
        setIsMenuActive(false);
        mainMenu.style.display = 'none';
        game.style.display = 'block';
    });

    // Exit button functionality
    exitButton.addEventListener('click', function () {
        if (!mainMusic.paused) {
            mainMusic.pause();
            mainMusic.currentTime = 0;
        }
        if (window.close) {
            window.close();
        } else {
            alert("Thank you for playing! Please close the tab manually.");
        }
    });

    // Toggle Options Menu
    optionsButton.addEventListener('click', function () {
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