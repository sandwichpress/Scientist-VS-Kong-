/**
 * BootScene.js - Initial boot, sets up loading screen
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Nothing to preload in boot
    }

    create() {
        // Initialize audio on first interaction
        this.input.once('pointerdown', () => {
            window.audioManager.init();
        });

        // Go to preload
        this.scene.start('PreloadScene');
    }
}

window.BootScene = BootScene;
