/**
 * FeedbackBoss.js - Level 3 boss
 * Large enemy with 3-phase attack patterns
 * DK-style boss fight arena
 */
class FeedbackBoss {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'enemy_feedback_boss', 0);
        this.sprite.setDepth(80);
        this.sprite.body.immovable = true;
        this.sprite.body.allowGravity = false;

        // Boss stats
        this.maxHealth = 10;
        this.health = this.maxHealth;
        this.isAlive = true;
        this.scoreValue = 500;

        // Phase tracking (3 phases)
        this.phase = 1;
        this.phaseThresholds = [7, 4]; // health thresholds for phase changes

        // Attack patterns
        this.attackTimer = 0;
        this.attackInterval = 2500;
        this.isAttacking = false;
        this.moveDirection = 1;
        this.moveSpeed = 40;
        this.moveRange = 100;
        this.startX = x;

        // Health bar
        this.healthBarBg = scene.add.rectangle(x, y - 50, 70, 8, 0x333333);
        this.healthBarBg.setDepth(200);
        this.healthBar = scene.add.rectangle(x, y - 50, 70, 8, 0xCC0000);
        this.healthBar.setDepth(201);

        // Boss name
        this.nameText = scene.add.text(x, y - 65, 'FEEDBACK', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#FF3333',
        }).setOrigin(0.5).setDepth(200);

        // Visual effects
        this.pulseTimer = 0;
    }

    update(time, delta) {
        if (!this.isAlive) return;

        // Update phase
        if (this.health <= this.phaseThresholds[1]) {
            this.phase = 3;
        } else if (this.health <= this.phaseThresholds[0]) {
            this.phase = 2;
        }

        // Movement
        this.updateMovement(delta);

        // Attack
        this.attackTimer += delta;
        const interval = this.attackInterval - (this.phase - 1) * 500;
        if (this.attackTimer >= interval) {
            this.attackTimer = 0;
            this.performAttack();
        }

        // Visual pulse (faster in later phases)
        this.pulseTimer += delta * this.phase;
        const scale = 1 + Math.sin(this.pulseTimer * 0.003) * 0.05;
        this.sprite.setScale(scale);

        // Phase coloring
        if (this.phase === 2) {
            this.sprite.setTint(0xFF6600);
        } else if (this.phase === 3) {
            this.sprite.setTint(0xFF0000);
        }

        // Update health bar position
        this.healthBarBg.setPosition(this.sprite.x, this.sprite.y - 50);
        this.healthBar.setPosition(this.sprite.x, this.sprite.y - 50);
        this.healthBar.width = 70 * (this.health / this.maxHealth);
        this.nameText.setPosition(this.sprite.x, this.sprite.y - 65);
    }

    updateMovement(delta) {
        const speed = this.moveSpeed + (this.phase - 1) * 20;

        // Simple back and forth
        this.sprite.x += this.moveDirection * speed * delta / 1000;

        if (this.sprite.x > this.startX + this.moveRange) {
            this.moveDirection = -1;
        } else if (this.sprite.x < this.startX - this.moveRange) {
            this.moveDirection = 1;
        }
    }

    performAttack() {
        if (this.phase === 1) {
            this.attackShockwave();
        } else if (this.phase === 2) {
            // Phase 2: alternates
            if (Math.random() > 0.5) {
                this.attackShockwave();
            } else {
                this.attackProjectiles();
            }
        } else {
            // Phase 3: rapid attacks
            this.attackShockwave();
            this.scene.time.delayedCall(500, () => {
                if (this.isAlive) this.attackProjectiles();
            });
        }
    }

    attackShockwave() {
        // Ground shockwave
        const wave = this.scene.add.rectangle(
            this.sprite.x, this.sprite.y + 30,
            10, 10, 0xFF6600, 0.8
        );
        wave.setDepth(85);

        this.scene.tweens.add({
            targets: wave,
            scaleX: 20,
            scaleY: 0.5,
            alpha: 0,
            duration: 800,
            onComplete: () => wave.destroy(),
        });

        // Damage check
        this.scene.time.delayedCall(200, () => {
            if (this.scene.player && this.scene.player.isAlive && this.scene.player.isGrounded) {
                const dx = Math.abs(this.scene.player.sprite.x - this.sprite.x);
                if (dx < 150) {
                    this.scene.player.takeDamage();
                }
            }
        });

        this.scene.cameras.main.shake(100, 0.005);
    }

    attackProjectiles() {
        // Fire 3-5 projectiles based on phase
        const count = 2 + this.phase;
        for (let i = 0; i < count; i++) {
            this.scene.time.delayedCall(i * 200, () => {
                if (!this.isAlive) return;

                const proj = this.scene.add.circle(
                    this.sprite.x, this.sprite.y,
                    6, 0xFF0000
                );
                proj.setDepth(85);

                // Aim toward player
                const targetX = this.scene.player ? this.scene.player.sprite.x : this.sprite.x;
                const targetY = this.scene.player ? this.scene.player.sprite.y : this.sprite.y + 100;
                const angle = Math.atan2(targetY - this.sprite.y, targetX - this.sprite.x);
                const speed = 120 + this.phase * 30;

                this.scene.tweens.add({
                    targets: proj,
                    x: proj.x + Math.cos(angle) * 300,
                    y: proj.y + Math.sin(angle) * 300,
                    duration: 300 / (speed / 150),
                    onUpdate: () => {
                        // Collision check with player
                        if (this.scene.player && this.scene.player.isAlive) {
                            const dist = Phaser.Math.Distance.Between(
                                proj.x, proj.y,
                                this.scene.player.sprite.x, this.scene.player.sprite.y
                            );
                            if (dist < 20) {
                                this.scene.player.takeDamage();
                                proj.destroy();
                            }
                        }
                    },
                    onComplete: () => proj.destroy(),
                });
            });
        }
    }

    takeDamage(damage = 1) {
        if (!this.isAlive) return;

        this.health -= damage;

        // Flash white
        this.sprite.setTint(0xFFFFFF);
        this.scene.time.delayedCall(100, () => {
            if (this.sprite && this.sprite.active) {
                if (this.phase === 2) this.sprite.setTint(0xFF6600);
                else if (this.phase === 3) this.sprite.setTint(0xFF0000);
                else this.sprite.clearTint();
            }
        });

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.isAlive = false;

        // Epic death sequence
        this.scene.cameras.main.shake(500, 0.02);

        // Multiple explosions
        for (let i = 0; i < 5; i++) {
            this.scene.time.delayedCall(i * 200, () => {
                const ex = this.scene.add.circle(
                    this.sprite.x + Phaser.Math.Between(-30, 30),
                    this.sprite.y + Phaser.Math.Between(-30, 30),
                    Phaser.Math.Between(10, 25),
                    Phaser.Math.RND.pick([0xFF0000, 0xFF6600, 0xFFD700, 0xFFFF00]),
                    0.8
                );
                ex.setDepth(200);
                this.scene.tweens.add({
                    targets: ex,
                    scaleX: 3,
                    scaleY: 3,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => ex.destroy(),
                });
            });
        }

        // Fade boss
        this.scene.tweens.add({
            targets: [this.sprite, this.healthBarBg, this.healthBar, this.nameText],
            alpha: 0,
            duration: 1000,
            delay: 800,
            onComplete: () => {
                this.sprite.destroy();
                this.healthBarBg.destroy();
                this.healthBar.destroy();
                this.nameText.destroy();

                // Trigger level complete
                if (this.scene.handleBossDefeated) {
                    this.scene.handleBossDefeated();
                }
            },
        });

        window.audioManager.playEnemyDeath();
    }

    destroy() {
        if (this.sprite) this.sprite.destroy();
        if (this.healthBarBg) this.healthBarBg.destroy();
        if (this.healthBar) this.healthBar.destroy();
        if (this.nameText) this.nameText.destroy();
    }
}

window.FeedbackBoss = FeedbackBoss;
