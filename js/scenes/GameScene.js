/**
 * GameScene.js - Core gameplay
 * Side-scrolling with poster palette, ladder fix, one-way platforms
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.currentLevel = data.level || 1;
    }

    create() {
        this.cameras.main.fadeIn(400);

        window.audioManager.init();
        window.audioManager.resume();
        window.audioManager.stopMusic(); // Stop theme song from world map

        // Restore music mute state from save
        window.audioManager.musicMuted = window.saveManager.data.musicMuted || false;

        // Play selected track as background music if record player unlocked
        if (window.saveManager.data.recordPlayerUnlocked) {
            const selectedTrack = window.saveManager.data.selectedTrack;
            if (selectedTrack && !window.saveManager.data.musicMuted) {
                // Delay slightly to let level load first
                this.time.delayedCall(500, () => {
                    window.audioManager.playTrack(selectedTrack);
                });
            }
        }

        // Physics groups
        this.platforms = this.physics.add.staticGroup();
        this.oneWayPlatforms = this.physics.add.staticGroup();
        this.ladderGroup = this.physics.add.staticGroup();
        this.vinylsGroup = this.physics.add.group({ allowGravity: false });
        this.healthPickupsGroup = this.physics.add.group({ allowGravity: false });
        this.enemySprites = this.physics.add.group();
        this.playerProjectiles = this.physics.add.group({ allowGravity: false });
        this.movingPlatformSprites = this.physics.add.group({ allowGravity: false, immovable: true });
        this.exitZone = null;

        // Level manager
        this.levelManager = new LevelManager(this);
        const levelData = this.levelManager.loadLevel(this.currentLevel);

        // World dimensions
        const worldWidth = levelData.width * 32;
        const worldHeight = levelData.map.length * 32;

        // Player
        const character = window.saveManager.data.character || 'jackKong';
        this.player = new Player(
            this,
            this.levelManager.spawnPoint.x,
            this.levelManager.spawnPoint.y,
            character
        );

        // Camera — horizontal follow for side-scrolling
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(40, 30);
        this.cameras.main.fadeIn(300);

        // Checkpoint
        this.currentCheckpoint = { x: this.levelManager.spawnPoint.x, y: this.levelManager.spawnPoint.y };

        // ===== COLLISIONS =====

        // Platform collision WITH ladder pass-through fix
        this.platformCollider = this.physics.add.collider(
            this.player.sprite, this.platforms,
            null,
            (playerSprite, platform) => {
                // If climbing up a ladder, disable floor collision so player passes through
                if (this.player.isOnLadder && this.player.isClimbingUp) {
                    return false;
                }
                return true;
            },
            this
        );

        // One-way platforms — only collide from above
        this.physics.add.collider(
            this.player.sprite, this.oneWayPlatforms,
            null,
            (playerSprite, platform) => {
                // Only collide if player is falling and feet are above platform
                return playerSprite.body.velocity.y >= 0 &&
                    playerSprite.body.bottom <= platform.body.top + 10;
            },
            this
        );

        // Moving platforms
        this.physics.add.collider(
            this.player.sprite, this.movingPlatformSprites,
            null,
            (playerSprite, platform) => {
                return playerSprite.body.velocity.y >= 0 &&
                    playerSprite.body.bottom <= platform.body.top + 10;
            },
            this
        );

        this.physics.add.collider(this.enemySprites, this.platforms);

        // Ladder overlap
        this.physics.add.overlap(
            this.player.sprite, this.ladderGroup,
            this.handleLadderOverlap, null, this
        );

        // Collectibles
        this.physics.add.overlap(
            this.player.sprite, this.vinylsGroup,
            this.collectVinyl, null, this
        );
        this.physics.add.overlap(
            this.player.sprite, this.healthPickupsGroup,
            this.collectHealth, null, this
        );

        // Enemy collision
        this.physics.add.overlap(
            this.player.sprite, this.enemySprites,
            this.handleEnemyCollision, null, this
        );

        // Projectiles
        this.physics.add.overlap(
            this.playerProjectiles, this.enemySprites,
            this.handleProjectileHit, null, this
        );

        // Exit zone
        if (this.exitZone) {
            this.physics.add.overlap(
                this.player.sprite, this.exitZone,
                this.handleExitReached, null, this
            );
        }

        // Checkpoint overlaps (set up here because player doesn't exist during parseTilemap)
        if (this.levelManager.checkpoints) {
            this.levelManager.checkpoints.forEach(cp => {
                this.physics.add.overlap(
                    this.player.sprite, cp.sprite,
                    () => {
                        cp.activate(this.player);
                        this.currentCheckpoint = { x: cp.x, y: cp.y - 20 };
                    }
                );
            });
        }

        // Boss
        this.boss = null;
        if (this.levelManager.bossSpawn && levelData.isBossLevel) {
            this.boss = new FeedbackBoss(
                this,
                this.levelManager.bossSpawn.x,
                this.levelManager.bossSpawn.y
            );
        }

        // Controls
        this.controls = new TouchControls(this);
        this.controls.create();

        // HUD
        this.hud = new HUD(this);
        this.hud.create(levelData.name);

        // Pause
        this.pauseMenu = new PauseMenu(this);

        // Level intro
        this.hud.showLevelIntro(levelData.name, levelData.subtitle);

        // State
        this.levelComplete = false;
        this.levelStartTime = Date.now();
        this.playerOnLadder = false;

        // Parallax background
        this.createParallaxBg(worldWidth, worldHeight, levelData);

        // ESC to pause
        this.input.keyboard.on('keydown-ESC', () => this.pauseMenu.toggle());
    }

    createParallaxBg(worldW, worldH, levelData) {
        // Poster-style gradient background
        const { width, height } = this.scale;
        const bg = this.add.graphics().setDepth(0).setScrollFactor(0);

        // Determine world colors
        const worldNum = Math.ceil(this.currentLevel / 5);
        const palettes = {
            1: [0xFF69B4, 0xFF8C00, 0xFFD700, 0x4169E1], // coast
            2: [0xFF8C00, 0x444444, 0x222222, 0x111111], // city
            3: [0x228B22, 0x006400, 0x008080, 0x4169E1], // island
            4: [0x444444, 0xCC0000, 0x222222, 0x000000], // factory
        };
        const colors = palettes[worldNum] || palettes[1];

        const steps = 20;
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const ci = Math.min(Math.floor(t * (colors.length - 1)), colors.length - 2);
            const lt = (t * (colors.length - 1)) - ci;
            const c1 = Phaser.Display.Color.IntegerToColor(colors[ci]);
            const c2 = Phaser.Display.Color.IntegerToColor(colors[ci + 1]);
            const interp = Phaser.Display.Color.Interpolate.ColorWithColor(c1, c2, 100, Math.floor(lt * 100));
            const c = Phaser.Display.Color.GetColor(interp.r, interp.g, interp.b);
            bg.fillStyle(c);
            bg.fillRect(0, (i / steps) * height, width, height / steps + 1);
        }

        // Decorations based on world
        if (worldNum === 1 || worldNum === 3) {
            // Palm trees parallax
            if (this.textures.exists('deco_palm')) {
                for (let i = 0; i < 3; i++) {
                    const palm = this.add.image(
                        100 + i * 200, worldH - 60, 'deco_palm'
                    ).setDepth(1).setAlpha(0.3).setScrollFactor(0.3, 1);
                }
            }
        }
    }

    update(time, delta) {
        if (this.levelComplete) return;
        if (this.pauseMenu && this.pauseMenu.isOpen) return;

        this.controls.update();

        if (this.player) {
            // Ladder state check
            this.playerOnLadder = false;
            this.physics.overlap(
                this.player.sprite, this.ladderGroup,
                () => { this.playerOnLadder = true; }
            );

            // Ladder engagement
            if (this.playerOnLadder && (this.controls.up || this.controls.down)) {
                this.player.setOnLadder(true);
            } else if (!this.playerOnLadder) {
                this.player.setOnLadder(false);
            }

            this.player.update(this.controls, time, delta);

            // Death check — fell off world
            if (this.player.sprite.y > this.physics.world.bounds.height + 50) {
                this.player.takeDamage();
                if (this.player.isAlive) {
                    // Respawn at checkpoint
                    this.player.sprite.setPosition(this.currentCheckpoint.x, this.currentCheckpoint.y);
                    this.player.sprite.setVelocity(0, 0);
                }
            }
        }

        // Update moving platforms
        if (this.levelManager.movingPlatforms) {
            this.levelManager.movingPlatforms.forEach(mp => mp.update(time, delta));
        }

        // Update barrel launchers
        if (this.levelManager.barrelLaunchers) {
            this.levelManager.barrelLaunchers.forEach(bl => bl.update(time, delta));
        }

        // Update enemies
        if (this.levelManager) this.levelManager.updateEnemies(time, delta);

        // Boss
        if (this.boss && this.boss.isAlive) {
            this.boss.update(time, delta);
            if (this.playerProjectiles) {
                this.playerProjectiles.children.iterate((proj) => {
                    if (proj && proj.active && this.boss && this.boss.isAlive) {
                        const dist = Phaser.Math.Distance.Between(
                            proj.x, proj.y, this.boss.sprite.x, this.boss.sprite.y
                        );
                        if (dist < 40) {
                            this.boss.takeDamage(1);
                            proj.destroy();
                        }
                    }
                });
            }
        }

        // HUD
        if (this.hud && this.player) this.hud.update(this.player);

        // Exit check
        if (this.exitZone && this.player && this.player.isAlive) {
            const dist = Phaser.Math.Distance.Between(
                this.player.sprite.x, this.player.sprite.y,
                this.levelManager.exitPoint.x, this.levelManager.exitPoint.y
            );
            if (dist < 30) this.handleExitReached();
        }
    }

    handleLadderOverlap(playerSprite, ladder) {
        this.playerOnLadder = true;
    }

    collectVinyl(playerSprite, plate) {
        if (!plate.active) return;
        plate.destroy();
        this.player.collectVinyl();

        for (let i = 0; i < 8; i++) {
            const p = this.add.rectangle(
                plate.x + Phaser.Math.Between(-5, 5),
                plate.y + Phaser.Math.Between(-5, 5),
                3, 3, 0xFFD700
            ).setDepth(100);
            this.tweens.add({
                targets: p,
                y: p.y - Phaser.Math.Between(15, 40),
                x: p.x + Phaser.Math.Between(-20, 20),
                alpha: 0, duration: 400,
                onComplete: () => p.destroy(),
            });
        }

        const popup = this.add.text(plate.x, plate.y - 10, '+100', {
            fontFamily: 'monospace', fontSize: '12px',
            color: '#FFD700', stroke: '#000', strokeThickness: 2,
        }).setOrigin(0.5).setDepth(110);
        this.tweens.add({
            targets: popup, y: popup.y - 30, alpha: 0,
            duration: 800, onComplete: () => popup.destroy(),
        });
    }

    collectHealth(playerSprite, hp) {
        if (!hp.active) return;
        hp.destroy();
        this.player.heal(1);
        window.audioManager.playCollect();

        for (let i = 0; i < 6; i++) {
            const p = this.add.rectangle(
                hp.x + Phaser.Math.Between(-5, 5),
                hp.y + Phaser.Math.Between(-5, 5),
                3, 3, 0xFF69B4
            ).setDepth(100);
            this.tweens.add({
                targets: p, y: p.y - 20, alpha: 0,
                duration: 300, onComplete: () => p.destroy(),
            });
        }
    }

    handleEnemyCollision(playerSprite, enemySprite) {
        // Roll attack kills enemies
        if (this.player.isRolling) {
            const enemy = this.levelManager.enemies.find(e => e.sprite === enemySprite && e.isAlive);
            if (enemy) {
                enemy.takeDamage(2);
                this.player.addScore(enemy.scoreValue || 50);
            }
            return;
        }

        if (this.player.sprite.body.velocity.y > 0 &&
            this.player.sprite.y < enemySprite.y - 10) {
            const enemy = this.levelManager.enemies.find(e => e.sprite === enemySprite && e.isAlive);
            if (enemy) {
                enemy.takeDamage(1);
                this.player.addScore(enemy.scoreValue || 50);
                this.player.sprite.setVelocityY(-250);
                window.audioManager.playJump();
            }
        } else {
            this.player.takeDamage();
        }
    }

    handleProjectileHit(projectile, enemySprite) {
        if (!projectile.active || !enemySprite.active) return;
        const enemy = this.levelManager.enemies.find(e => e.sprite === enemySprite && e.isAlive);
        if (enemy) {
            enemy.takeDamage(1);
            this.player.addScore(enemy.scoreValue || 50);
        }
        projectile.destroy();
    }

    handleExitReached() {
        if (this.levelComplete) return;
        this.levelComplete = true;

        window.audioManager.playLevelComplete();

        const timeElapsed = (Date.now() - this.levelStartTime) / 1000;
        const stars = this.player.vinyls >= 3 ? 3 :
            this.player.vinyls >= 1 ? 2 : 1;

        const result = window.saveManager.completeLevel(
            this.currentLevel, this.player.score, stars, this.player.vinyls
        );
        const trackName = result.trackName;
        const firstUnlock = result.firstUnlock;

        this.hud.showLevelComplete(this.player.score, this.player.vinyls, timeElapsed, trackName, firstUnlock);
        this.controls.enabled = false;

        // Stop background music for the level complete moment
        window.audioManager.stopMusic();

        // Play track preview after the level complete jingle
        if (trackName) {
            this.time.delayedCall(1200, () => {
                window.audioManager.playTrackPreview();
            });
        }

        this.time.delayedCall(1500, () => {
            const advance = () => {
                // Check for world transition cutscene
                const nextLevel = this.currentLevel + 1;
                if (nextLevel > 20) {
                    this.scene.start('StoryCutscene', {
                        cutscene: 'ending',
                        nextScene: 'GameOverScene',
                        nextData: { won: true, score: this.player.score },
                    });
                } else if (nextLevel === 6) {
                    this.scene.start('StoryCutscene', {
                        cutscene: 'world2',
                        nextScene: 'WorldMapScene',
                        nextData: { world: 2, level: 6 },
                    });
                } else if (nextLevel === 11) {
                    this.scene.start('StoryCutscene', {
                        cutscene: 'world3',
                        nextScene: 'WorldMapScene',
                        nextData: { world: 3, level: 11 },
                    });
                } else if (nextLevel === 16) {
                    this.scene.start('StoryCutscene', {
                        cutscene: 'world4',
                        nextScene: 'WorldMapScene',
                        nextData: { world: 4, level: 16 },
                    });
                } else {
                    this.scene.restart({ level: nextLevel });
                }
            };

            this.input.once('pointerdown', advance);
            this.input.keyboard.once('keydown', advance);
        });
    }

    handleBossDefeated() {
        this.handleExitReached();
    }

    handlePlayerDeath() {
        this.scene.start('GameOverScene', {
            won: false, score: this.player.score, level: this.currentLevel,
        });
    }

    shutdown() {
        if (this.controls) this.controls.destroy();
        if (this.hud) this.hud.destroy();
        if (this.pauseMenu) this.pauseMenu.destroy();
        if (this.levelManager) this.levelManager.clearLevel();
        if (this.player) this.player.destroy();
        if (this.boss) this.boss.destroy();
    }
}

window.GameScene = GameScene;
