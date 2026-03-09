/**
 * Static.js - Stationary shock enemy
 * Sits in place and sends periodic shock waves
 */
class StaticEnemy {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'enemy_static', 0);
        this.sprite.setDepth(80);
        this.sprite.body.allowGravity = false;
        this.sprite.body.immovable = true;

        // Shock wave timing
        this.shockInterval = 2000; // ms between shocks
        this.shockTimer = 0;
        this.shockRange = 100;

        // Health
        this.health = 2;
        this.isAlive = true;
        this.scoreValue = 100;

        // Visual pulse
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    update(time, delta) {
        if (!this.isAlive) return;

        this.shockTimer += delta;
        if (this.shockTimer >= this.shockInterval) {
            this.shockTimer = 0;
            this.fireShockWave();
        }
    }

    fireShockWave() {
        // Create expanding shock ring
        const ring = this.scene.add.circle(
            this.sprite.x, this.sprite.y,
            8, 0xFFFF00, 0.6
        );
        ring.setDepth(85);
        ring.setStrokeStyle(2, 0xFFFF00);

        this.scene.tweens.add({
            targets: ring,
            radius: this.shockRange,
            alpha: 0,
            duration: 600,
            onComplete: () => ring.destroy(),
        });

        // Check if player is in range
        if (this.scene.player && this.scene.player.isAlive) {
            const dist = Phaser.Math.Distance.Between(
                this.sprite.x, this.sprite.y,
                this.scene.player.sprite.x, this.scene.player.sprite.y
            );
            if (dist < this.shockRange) {
                // Delay damage to match visual
                this.scene.time.delayedCall(300, () => {
                    if (this.scene.player && this.scene.player.isAlive) {
                        const currentDist = Phaser.Math.Distance.Between(
                            this.sprite.x, this.sprite.y,
                            this.scene.player.sprite.x, this.scene.player.sprite.y
                        );
                        if (currentDist < this.shockRange) {
                            this.scene.player.takeDamage();
                        }
                    }
                });
            }
        }
    }

    takeDamage(damage = 1) {
        if (!this.isAlive) return;

        this.health -= damage;
        this.sprite.setTint(0xFF0000);
        this.scene.time.delayedCall(100, () => {
            if (this.sprite && this.sprite.active) this.sprite.clearTint();
        });

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.isAlive = false;
        window.audioManager.playEnemyDeath();

        // Electrical burst death
        for (let i = 0; i < 8; i++) {
            const spark = this.scene.add.rectangle(
                this.sprite.x, this.sprite.y,
                3, 3, 0xFFFF00
            );
            spark.setDepth(85);
            const angle = (i / 8) * Math.PI * 2;
            this.scene.tweens.add({
                targets: spark,
                x: this.sprite.x + Math.cos(angle) * 40,
                y: this.sprite.y + Math.sin(angle) * 40,
                alpha: 0,
                duration: 400,
                onComplete: () => spark.destroy(),
            });
        }

        this.sprite.destroy();
    }

    destroy() {
        if (this.sprite) this.sprite.destroy();
    }
}

window.StaticEnemy = StaticEnemy;
