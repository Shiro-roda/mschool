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

// Utility to manage game state with localStorage
const state = {
    set(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
        } catch (error) {
            console.error('Error saving state to localStorage:', error);
        }
    },

    get(key) {
        try {
            const serializedValue = localStorage.getItem(key);
            return serializedValue ? JSON.parse(serializedValue) : null;
        } catch (error) {
            console.error('Error retrieving state from localStorage:', error);
            return null;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing state from localStorage:', error);
        }
    },

    clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing state in localStorage:', error);
        }
    },
};

// Example usage for game state
const gameState = {
    isAudioEnabled: true,
    currentScene: 'main',
};

// Save game state
state.set('gameState', gameState);

// Retrieve game state
const savedState = state.get('gameState');
if (savedState) {
    console.log('Loaded game state:', savedState);
}

// Toggle audio state
function toggleAudioState() {
    const currentState = state.get('gameState') || {};
    currentState.isAudioEnabled = !currentState.isAudioEnabled;
    state.set('gameState', currentState);
    console.log('Audio state updated:', currentState.isAudioEnabled);
}

// Example function to update scene state
function updateCurrentScene(sceneIndex) {
    const currentState = state.get('gameState') || {};
    currentState.currentScene = sceneIndex;
    state.set('gameState', currentState);
    console.log('Current scene updated:', sceneIndex);
}

export { state, toggleAudioState, updateCurrentScene };
