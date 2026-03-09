/**
 * WorldMapScene.js - DK Country-style overworld map
 * Poster palette: gold, pink, blue, green
 */
class WorldMapScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WorldMapScene' });
    }

    init(data) {
        this.startWorld = data.world || 1;
        this.initialLevel = data.level || 1;
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.fadeIn(400);

        // Play theme song on world map
        window.audioManager.playThemeSong();

        // World data
        this.worlds = [
            { name: 'THE COAST', color: '#4169E1', levels: 5, unlock: 0 },
            { name: 'THE CITY', color: '#FF8C00', levels: 5, unlock: 5 },
            { name: 'THE ISLAND', color: '#228B22', levels: 5, unlock: 10 },
            { name: 'THE FACTORY', color: '#CC0000', levels: 5, unlock: 15 },
        ];

        this.currentWorld = this.startWorld - 1;
        this.selectedLevel = this.initialLevel;

        // Background gradient (poster sunset)
        this.drawBackground(width, height);

        // World title
        this.worldTitle = this.add.text(width / 2, 30, '', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(50);

        // World switch arrows (must be created before drawWorld which references them)
        const arrowStyle = {
            fontFamily: 'monospace', fontSize: '28px',
            color: '#FFD700', stroke: '#000', strokeThickness: 3,
        };
        this.leftArrow = this.add.text(20, height / 2, '◀', arrowStyle)
            .setOrigin(0, 0.5).setDepth(50).setInteractive();
        this.rightArrow = this.add.text(width - 20, height / 2, '▶', arrowStyle)
            .setOrigin(1, 0.5).setDepth(50).setInteractive();

        this.leftArrow.on('pointerdown', () => this.switchWorld(-1));
        this.rightArrow.on('pointerdown', () => this.switchWorld(1));

        // Level nodes
        this.nodes = [];
        this.paths = [];
        this.drawWorld();

        // Navigation
        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

        // Back button
        this.add.text(20, 20, '← BACK', {
            fontFamily: 'monospace', fontSize: '12px',
            color: '#FFF', stroke: '#000', strokeThickness: 2,
        }).setDepth(50).setInteractive().on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        // Instructions
        this.add.text(width / 2, height - 20, 'TAP LEVEL TO PLAY', {
            fontFamily: 'monospace', fontSize: '10px',
            color: '#FFD700', stroke: '#000', strokeThickness: 2,
        }).setOrigin(0.5).setDepth(50);

        // Decorative elements
        this.addDecorations(width, height);

        // Keyboard navigation
        this.input.keyboard.on('keydown-LEFT', () => this.switchWorld(-1));
        this.input.keyboard.on('keydown-RIGHT', () => this.switchWorld(1));
    }

    drawBackground(w, h) {
        // Poster-style sunset gradient (single canvas texture for performance)
        const gradKey = 'world_gradient_' + w + 'x' + h;
        if (!this.textures.exists(gradKey)) {
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#FF69B4');    // hot pink top
            grad.addColorStop(0.3, '#FF8C00');  // orange
            grad.addColorStop(0.6, '#FFD700');  // gold
            grad.addColorStop(1, '#4169E1');    // blue bottom (ocean)
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 1, h);
            this.textures.addCanvas(gradKey, canvas);
        }
        this.add.image(w / 2, h / 2, gradKey)
            .setDisplaySize(w, h).setDepth(0);

        // Sunset rays (poster style)
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI - Math.PI / 2;
            const ray = this.add.triangle(
                w / 2, -20,
                0, 0,
                Math.cos(angle - 0.1) * w, Math.sin(angle - 0.1) * h * 1.5,
                Math.cos(angle + 0.1) * w, Math.sin(angle + 0.1) * h * 1.5,
                0xFFD700, 0.08
            ).setDepth(1);
        }
    }

    drawWorld() {
        // Clear existing
        this.nodes.forEach(n => n.destroy());
        this.paths.forEach(p => p.destroy());
        this.nodes = [];
        this.paths = [];

        const { width, height } = this.scale;
        const world = this.worlds[this.currentWorld];
        const save = window.saveManager.data;

        this.worldTitle.setText(world.name);

        // Node positions (zigzag path)
        const positions = [];
        for (let i = 0; i < world.levels; i++) {
            const t = i / (world.levels - 1);
            const x = width * 0.2 + (width * 0.6) * (i % 2 === 0 ? 0.3 : 0.7);
            const y = height * 0.75 - t * (height * 0.5);
            positions.push({ x, y });
        }

        // Draw paths between nodes
        const gfx = this.add.graphics().setDepth(5);
        gfx.lineStyle(3, 0xDEB887);
        for (let i = 0; i < positions.length - 1; i++) {
            gfx.lineBetween(
                positions[i].x, positions[i].y,
                positions[i + 1].x, positions[i + 1].y
            );
        }
        this.paths.push(gfx);

        // Draw nodes
        for (let i = 0; i < world.levels; i++) {
            const levelNum = world.unlock + i + 1;
            const pos = positions[i];
            const unlocked = levelNum <= (save.levelsUnlocked || 1);
            const completed = save.levelData && save.levelData[levelNum] && save.levelData[levelNum].completed;
            const stars = save.levelData && save.levelData[levelNum] ? save.levelData[levelNum].stars || 0 : 0;

            // Node circle
            const nodeColor = unlocked ? 0xFFD700 : 0x444444;
            const node = this.add.circle(pos.x, pos.y, 22, nodeColor)
                .setDepth(10).setStrokeStyle(3, unlocked ? 0xFF8C00 : 0x222222);

            // Level number
            const numText = this.add.text(pos.x, pos.y, `${i + 1}`, {
                fontFamily: 'monospace', fontSize: '14px',
                color: unlocked ? '#000' : '#666',
                fontStyle: 'bold',
            }).setOrigin(0.5).setDepth(11);

            if (unlocked) {
                node.setInteractive({ useHandCursor: true });
                numText.setInteractive({ useHandCursor: true });

                const startLvl = () => this.startLevel(levelNum);
                node.on('pointerdown', startLvl);
                numText.on('pointerdown', startLvl);

                // Pulse animation for current level
                if (!completed) {
                    this.tweens.add({
                        targets: node, scaleX: 1.15, scaleY: 1.15,
                        duration: 600, yoyo: true, repeat: -1,
                    });
                }
            }

            // Stars below
            if (completed && stars > 0) {
                const starStr = '★'.repeat(stars) + '☆'.repeat(3 - stars);
                this.add.text(pos.x, pos.y + 24, starStr, {
                    fontFamily: 'monospace', fontSize: '8px',
                    color: '#FFD700',
                }).setOrigin(0.5).setDepth(11);
            }

            this.nodes.push(node);
            this.nodes.push(numText);
        }

        // Update arrow visibility
        this.leftArrow.setAlpha(this.currentWorld > 0 ? 1 : 0.3);
        this.rightArrow.setAlpha(this.currentWorld < 3 ? 1 : 0.3);
    }

    addDecorations(w, h) {
        // Palm trees
        if (this.textures.exists('deco_palm')) {
            this.add.image(40, h - 60, 'deco_palm').setScale(1.5).setDepth(2).setAlpha(0.6);
            this.add.image(w - 40, h - 50, 'deco_palm').setScale(1.2).setDepth(2).setAlpha(0.5);
        }

        // Animated dolphins in the "water"
        for (let i = 0; i < 2; i++) {
            const dx = Phaser.Math.Between(w * 0.2, w * 0.8);
            const dy = h - Phaser.Math.Between(15, 35);
            if (this.textures.exists('deco_dolphin')) {
                const dolphin = this.add.image(dx, dy, 'deco_dolphin')
                    .setDepth(3).setAlpha(0.5).setScale(0.8);
                this.tweens.add({
                    targets: dolphin,
                    x: dolphin.x + Phaser.Math.Between(-60, 60),
                    y: dolphin.y + Phaser.Math.Between(-5, 5),
                    duration: 3000 + i * 1000,
                    yoyo: true, repeat: -1,
                    ease: 'Sine.easeInOut',
                });
            }
        }

        // Stars (poster style)
        for (let i = 0; i < 5; i++) {
            const star = this.add.star(
                Phaser.Math.Between(20, w - 20),
                Phaser.Math.Between(10, h * 0.3),
                5, 2, 5,
                Phaser.Math.RND.pick([0xFF69B4, 0xFFD700, 0x228B22])
            ).setDepth(2).setAlpha(0.6);
            this.tweens.add({
                targets: star, alpha: 0.2, duration: 1000 + i * 200,
                yoyo: true, repeat: -1,
            });
        }
    }

    switchWorld(dir) {
        const next = this.currentWorld + dir;
        if (next < 0 || next > 3) return;
        this.currentWorld = next;
        this.drawWorld();
    }

    startLevel(levelNum) {
        // Transition effect
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            // Use setTimeout to escape the camera callback context —
            // calling scene.start() directly here freezes the new scene's update loop
            setTimeout(() => {
                this.scene.start('GameScene', { level: levelNum });
            }, 0);
        });
    }
}

window.WorldMapScene = WorldMapScene;
