/**
 * LevelSelectScene.js - Grid of 20 levels with lock/unlock states
 */
class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#0a0a1a');

        // Title
        this.add.text(width / 2, 30, 'SELECT LEVEL', {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        // Back button
        const back = this.add.text(20, 25, '← BACK', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#FFD700',
        }).setInteractive();

        back.on('pointerdown', () => {
            window.audioManager.playMenuSelect();
            this.scene.start('MenuScene');
        });

        // Level grid (4 columns x 5 rows)
        const cols = 4;
        const rows = 5;
        const cellW = 70;
        const cellH = 80;
        const startX = (width - cols * cellW) / 2 + cellW / 2;
        const startY = 75;

        const levelNames = LevelManager.getLevelNames();

        for (let i = 0; i < 20; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * cellW;
            const y = startY + row * cellH;
            const levelNum = i + 1;
            const unlocked = window.saveManager.isLevelUnlocked(levelNum);
            const stars = window.saveManager.getLevelStars(levelNum);

            // Level box
            const boxColor = unlocked ? 0x333366 : 0x1a1a1a;
            const borderColor = unlocked ? 0xFFD700 : 0x333333;
            const box = this.add.rectangle(x, y, cellW - 10, cellH - 10, boxColor)
                .setStrokeStyle(2, borderColor);

            // Level number
            const numColor = unlocked ? '#FFD700' : '#444444';
            this.add.text(x, y - 18, `${levelNum}`, {
                fontFamily: 'monospace',
                fontSize: '20px',
                fontStyle: 'bold',
                color: numColor,
            }).setOrigin(0.5);

            // Location name (tiny)
            const info = levelNames[i];
            if (info) {
                this.add.text(x, y + 5, info.location.substring(0, 8), {
                    fontFamily: 'monospace',
                    fontSize: '7px',
                    color: unlocked ? '#888888' : '#333333',
                }).setOrigin(0.5);
            }

            // Stars
            if (stars > 0) {
                const starStr = '⭐'.repeat(stars);
                this.add.text(x, y + 20, starStr, {
                    fontSize: '10px',
                }).setOrigin(0.5);
            }

            // Lock icon
            if (!unlocked) {
                this.add.text(x, y + 20, '🔒', {
                    fontSize: '14px',
                }).setOrigin(0.5);
            }

            // Interactivity
            if (unlocked) {
                box.setInteractive();
                box.on('pointerover', () => box.setFillStyle(0x444488));
                box.on('pointerout', () => box.setFillStyle(0x333366));
                box.on('pointerdown', () => {
                    window.audioManager.playMenuSelect();
                    this.scene.start('GameScene', { level: levelNum });
                });
            }
        }

        // Total score
        this.add.text(width / 2, height - 30, `TOTAL SCORE: ${window.saveManager.data.totalScore}`, {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#888888',
        }).setOrigin(0.5);

        // Total vinyls
        const tracksUnlocked = window.saveManager.data.unlockedTracks ? window.saveManager.data.unlockedTracks.length : 0;
        this.add.text(width / 2, height - 15, `💿 VINYLS: ${window.saveManager.data.totalVinyls || 0}  🎵 TRACKS: ${tracksUnlocked}/20`, {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#666666',
        }).setOrigin(0.5);
    }
}

window.LevelSelectScene = LevelSelectScene;
