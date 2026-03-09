/**
 * game.js - Phaser 3 game configuration
 * Fullscreen responsive canvas for PC, mobile, iPad
 */

(function () {
    // Fullscreen: use the full viewport
    const gameWidth = window.innerWidth;
    const gameHeight = window.innerHeight;

    const config = {
        type: Phaser.AUTO,
        width: gameWidth,
        height: gameHeight,
        parent: 'game-container',
        pixelArt: true,
        roundPixels: true,
        antialias: false,

        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: '100%',
            height: '100%',
        },

        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 800 },
                debug: false,
                fps: 60,
            },
        },

        input: {
            activePointers: 4,
            touch: {
                capture: true,
            },
        },

        scene: [
            BootScene,
            PreloadScene,
            MenuScene,
            LevelSelectScene,
            WorldMapScene,
            StoryCutscene,
            GameScene,
            GameOverScene,
        ],

        render: {
            pixelArt: true,
            antialias: false,
            roundPixels: true,
        },

        fps: {
            target: 60,
            forceSetTimeOut: false,
        },

        audio: {
            disableWebAudio: false,
        },

        banner: {
            text: '#FFD700',
            background: ['#CC0000', '#FFD700', '#006400'],
        },
    };

    const game = new Phaser.Game(config);

    // Expose game globally for debugging
    window.game = game;

    // Prevent context menu on long press
    window.addEventListener('contextmenu', (e) => e.preventDefault());

    // Wake lock for mobile
    async function requestWakeLock() {
        try {
            if ('wakeLock' in navigator) {
                await navigator.wakeLock.request('screen');
            }
        } catch (e) { }
    }
    requestWakeLock();

    // Visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            game.scene.scenes.forEach(scene => {
                if (scene.scene.isActive() && scene.physics) {
                    scene.physics.pause();
                }
            });
        } else {
            game.scene.scenes.forEach(scene => {
                if (scene.scene.isActive() && scene.physics) {
                    scene.physics.resume();
                }
            });
            requestWakeLock();
        }
    });
})();
