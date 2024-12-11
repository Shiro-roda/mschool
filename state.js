// File: state.js

let isMenuActive = true; // Private variable

// Function to get the state
export function getIsMenuActive() {
    return isMenuActive;
}

// Function to set the state
export function setIsMenuActive(state) {
    isMenuActive = state;
}
