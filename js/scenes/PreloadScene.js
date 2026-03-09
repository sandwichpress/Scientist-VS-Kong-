/**
 * PreloadScene.js - Generates all sprite assets and shows loading bar
 */
class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Update loading bar
        const loadingBar = document.getElementById('loading-bar');
        if (loadingBar) {
            loadingBar.style.width = '30%';
        }
    }

    create() {
        // Generate all sprites programmatically
        const spriteGen = new SpriteGenerator(this);

        const loadingBar = document.getElementById('loading-bar');
        if (loadingBar) loadingBar.style.width = '50%';

        spriteGen.generateAll();

        if (loadingBar) loadingBar.style.width = '100%';

        // Hide loading screen
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(() => loadingScreen.remove(), 500);
            }
        }, 300);

        // Proceed to menu
        this.scene.start('MenuScene');
    }
}

window.PreloadScene = PreloadScene;
