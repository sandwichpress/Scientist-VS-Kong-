/**
 * GameOverScene.js - Game over / victory screen
 */
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.won = data.won || false;
        this.finalScore = data.score || 0;
        this.lastLevel = data.level || 1;
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#0a0a0a');

        if (this.won) {
            this.createVictoryScreen(width, height);
        } else {
            this.createGameOverScreen(width, height);
        }
    }

    createVictoryScreen(width, height) {
        // Reggae colored confetti
        for (let i = 0; i < 30; i++) {
            const colors = [0xCC0000, 0xFFD700, 0x006400];
            const confetti = this.add.rectangle(
                Phaser.Math.Between(0, width),
                -10,
                Phaser.Math.Between(4, 8),
                Phaser.Math.Between(4, 8),
                Phaser.Math.RND.pick(colors)
            ).setDepth(10);

            this.tweens.add({
                targets: confetti,
                y: height + 20,
                x: confetti.x + Phaser.Math.Between(-50, 50),
                angle: Phaser.Math.Between(0, 720),
                duration: Phaser.Math.Between(2000, 4000),
                delay: Phaser.Math.Between(0, 2000),
                repeat: -1,
            });
        }

        this.add.text(width / 2, height / 2 - 80, 'CONGRATULATIONS!', {
            fontFamily: 'monospace', fontSize: '28px',
            color: '#FFD700', stroke: '#000', strokeThickness: 4,
        }).setOrigin(0.5).setDepth(20);

        this.add.text(width / 2, height / 2 - 40, 'ALL TRACKS RECOVERED!\nTHE ALBUM IS COMPLETE!', {
            fontFamily: 'monospace', fontSize: '14px',
            color: '#FFFFFF',
        }).setOrigin(0.5).setDepth(20);

        this.add.text(width / 2, height / 2, `FINAL SCORE: ${this.finalScore}`, {
            fontFamily: 'monospace', fontSize: '20px',
            color: '#FFD700',
        }).setOrigin(0.5).setDepth(20);

        this.createButtons(width, height);
    }

    createGameOverScreen(width, height) {
        // GAME OVER text with DK-style presentation
        const gameOver = this.add.text(width / 2, height / 2 - 60, 'GAME OVER', {
            fontFamily: 'monospace', fontSize: '36px',
            color: '#CC0000', stroke: '#000', strokeThickness: 4,
        }).setOrigin(0.5).setDepth(20);

        // Pulse effect
        this.tweens.add({
            targets: gameOver,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.add.text(width / 2, height / 2 - 10, `SCORE: ${this.finalScore}`, {
            fontFamily: 'monospace', fontSize: '18px',
            color: '#FFFFFF',
        }).setOrigin(0.5).setDepth(20);

        this.add.text(width / 2, height / 2 + 20, `LEVEL: ${this.lastLevel}`, {
            fontFamily: 'monospace', fontSize: '14px',
            color: '#888888',
        }).setOrigin(0.5).setDepth(20);

        this.createButtons(width, height, true);
    }

    createButtons(width, height, showRetry = false) {
        const buttonY = height / 2 + 70;

        if (showRetry) {
            const retry = this.add.text(width / 2, buttonY, '🔄 RETRY', {
                fontFamily: 'monospace', fontSize: '20px',
                color: '#FFD700', stroke: '#000', strokeThickness: 2,
            }).setOrigin(0.5).setDepth(20).setInteractive();

            retry.on('pointerover', () => retry.setColor('#FFFFFF'));
            retry.on('pointerout', () => retry.setColor('#FFD700'));
            retry.on('pointerdown', () => {
                window.audioManager.playMenuSelect();
                this.scene.start('GameScene', { level: this.lastLevel });
            });
        }

        const menu = this.add.text(width / 2, buttonY + 40, '🏠 MAIN MENU', {
            fontFamily: 'monospace', fontSize: '16px',
            color: '#FFFFFF', stroke: '#000', strokeThickness: 2,
        }).setOrigin(0.5).setDepth(20).setInteractive();

        menu.on('pointerover', () => menu.setColor('#FFD700'));
        menu.on('pointerout', () => menu.setColor('#FFFFFF'));
        menu.on('pointerdown', () => {
            window.audioManager.playMenuSelect();
            this.scene.start('MenuScene');
        });

        const levels = this.add.text(width / 2, buttonY + 75, '📋 LEVEL SELECT', {
            fontFamily: 'monospace', fontSize: '14px',
            color: '#888888',
        }).setOrigin(0.5).setDepth(20).setInteractive();

        levels.on('pointerover', () => levels.setColor('#FFD700'));
        levels.on('pointerout', () => levels.setColor('#888888'));
        levels.on('pointerdown', () => {
            window.audioManager.playMenuSelect();
            this.scene.start('LevelSelectScene');
        });
    }
}

window.GameOverScene = GameOverScene;
