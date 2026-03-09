/**
 * MenuScene.js - Poster-themed title screen
 * Gold/pink/blue tropical palette with palm trees + sunset
 */
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.fadeIn(400);

        // Sunset gradient background (single canvas texture for performance)
        const gradKey = 'menu_gradient_' + width + 'x' + height;
        if (!this.textures.exists(gradKey)) {
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            const grad = ctx.createLinearGradient(0, 0, 0, height);
            grad.addColorStop(0, '#FF69B4');    // hot pink
            grad.addColorStop(0.35, '#FF8C00'); // orange
            grad.addColorStop(0.65, '#FFD700'); // gold
            grad.addColorStop(1, '#4169E1');    // blue
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 1, height);
            this.textures.addCanvas(gradKey, canvas);
        }
        this.add.image(width / 2, height / 2, gradKey)
            .setDisplaySize(width, height).setDepth(0);

        // Sunset rays (poster style)
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI;
            const rayLen = Math.max(width, height) * 1.5;
            const ray = this.add.triangle(
                width / 2, height * 0.15,
                0, 0,
                Math.cos(angle - 0.08) * rayLen, Math.sin(angle - 0.08) * rayLen,
                Math.cos(angle + 0.08) * rayLen, Math.sin(angle + 0.08) * rayLen,
                0xFFD700, 0.06
            ).setDepth(1);
        }

        // Water at bottom
        const waterH = height * 0.15;
        this.add.rectangle(width / 2, height - waterH / 2, width, waterH, 0x4169E1, 0.5).setDepth(1);

        // Palm trees
        if (this.textures.exists('deco_palm')) {
            this.add.image(35, height - waterH - 10, 'deco_palm')
                .setScale(1.8).setDepth(3).setAlpha(0.7);
            this.add.image(width - 40, height - waterH, 'deco_palm')
                .setScale(1.5).setDepth(3).setAlpha(0.6);
        }

        // Dolphins
        if (this.textures.exists('deco_dolphin')) {
            const d1 = this.add.image(width * 0.3, height - 25, 'deco_dolphin')
                .setScale(0.8).setDepth(4).setAlpha(0.5);
            this.tweens.add({
                targets: d1, y: d1.y - 8, x: d1.x + 30,
                duration: 2500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            });
        }

        // Decorative stars (from poster)
        for (let i = 0; i < 8; i++) {
            const sx = Phaser.Math.Between(15, width - 15);
            const sy = Phaser.Math.Between(10, height * 0.35);
            const star = this.add.star(sx, sy, 5, 2, 5,
                Phaser.Math.RND.pick([0xFF69B4, 0xFFD700, 0x228B22]),
                0.6
            ).setDepth(2);
            this.tweens.add({
                targets: star, alpha: 0.15,
                duration: 600 + i * 150, yoyo: true, repeat: -1,
            });
        }

        // Title: "SCIENTIST vs KONG"
        const titleY = height * 0.15;
        const title = this.add.text(width / 2, titleY, 'SCIENTIST', {
            fontFamily: 'monospace',
            fontSize: '32px',
            color: '#FFFFFF',
            stroke: '#FF69B4',
            strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 0, fill: true },
        }).setOrigin(0.5).setDepth(20);

        this.add.text(width / 2, titleY + 28, 'vs', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#FF69B4',
            stroke: '#000',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(20);

        this.add.text(width / 2, titleY + 48, 'KONG', {
            fontFamily: 'monospace',
            fontSize: '32px',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 5,
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 0, fill: true },
        }).setOrigin(0.5).setDepth(20);

        // Title pulse
        this.tweens.add({
            targets: title, scaleX: 1.03, scaleY: 1.03,
            duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });

        // Characters
        const charY = height * 0.48;
        if (this.textures.exists('jack_kong')) {
            const kong = this.add.sprite(width * 0.35, charY, 'jack_kong', 0)
                .setScale(3).setDepth(15);
            this.tweens.add({
                targets: kong, y: charY - 5,
                duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            });
        }
        if (this.textures.exists('scientist')) {
            const sci = this.add.sprite(width * 0.65, charY, 'scientist', 0)
                .setScale(3).setDepth(15);
            this.tweens.add({
                targets: sci, y: charY - 5,
                duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 200,
            });
        }

        // Kong is always the player (the Mario of this game)
        this.selectedChar = 'jackKong';

        // Buttons
        const btnY = height * 0.72;
        this.createButton(width / 2, btnY, 'PLAY', () => {
            window.saveManager.data.character = this.selectedChar;
            window.saveManager.save();
            this.cameras.main.fadeOut(300);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                const save = window.saveManager.data;
                if (!save.hasSeenIntro) {
                    save.hasSeenIntro = true;
                    window.saveManager.save();
                    this.scene.start('StoryCutscene', {
                        cutscene: 'intro',
                        nextScene: 'WorldMapScene',
                        nextData: { world: 1, level: 1 },
                    });
                } else {
                    this.scene.start('WorldMapScene', {
                        world: Math.ceil((save.levelsUnlocked || 1) / 5) || 1,
                        level: save.levelsUnlocked || 1,
                    });
                }
            });
        });

        this.createButton(width / 2, btnY + 45, 'MAP', () => {
            window.saveManager.data.character = this.selectedChar;
            window.saveManager.save();
            this.scene.start('WorldMapScene', { world: 1, level: 1 });
        });

    }

    createButton(x, y, text, callback, small = false) {
        const pad = small ? 8 : 12;
        const fontSize = small ? '11px' : '14px';
        const w = small ? 120 : 150;
        const h = small ? 28 : 34;

        // Green pill shape (poster style)
        const bg = this.add.graphics().setDepth(19);
        bg.fillStyle(0x228B22, 0.9);
        bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, h / 2);
        bg.lineStyle(2, 0xFFD700);
        bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, h / 2);

        const label = this.add.text(x, y, text, {
            fontFamily: 'monospace', fontSize,
            color: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 1,
        }).setOrigin(0.5).setDepth(20);

        // Interactive zone
        const zone = this.add.zone(x, y, w, h).setDepth(21).setInteractive();
        zone.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0x32CD32, 0.95);
            bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, h / 2);
            bg.lineStyle(2, 0xFFD700);
            bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, h / 2);
        });
        zone.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x228B22, 0.9);
            bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, h / 2);
            bg.lineStyle(2, 0xFFD700);
            bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, h / 2);
        });
        zone.on('pointerdown', () => {
            if (navigator.vibrate) navigator.vibrate(10);
            callback();
        });

        return { bg, label, zone };
    }
}

window.MenuScene = MenuScene;
