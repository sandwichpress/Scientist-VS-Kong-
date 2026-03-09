/**
 * BadVibes.js - Basic patrol enemy
 * Walks back and forth on platforms like DK barrels/enemies
 */
class BadVibes {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'enemy_badvibes', 0);
        this.sprite.setDepth(80);
        this.sprite.setBounce(0);
        this.sprite.setCollideWorldBounds(true);

        // Physics
        this.speed = 60;
        this.direction = 1; // 1 = right, -1 = left
        this.sprite.setVelocityX(this.speed * this.direction);

        // Health
        this.health = 1;
        this.isAlive = true;
        this.scoreValue = 50;

        // Hitbox
        this.sprite.body.setSize(24, 24);
        this.sprite.body.setOffset(4, 8);

        // Animation
        if (!scene.anims.exists('badvibes_walk')) {
            scene.anims.create({
                key: 'badvibes_walk',
                frames: scene.anims.generateFrameNumbers('enemy_badvibes', { start: 0, end: 1 }),
                frameRate: 4,
                repeat: -1,
            });
        }
        this.sprite.anims.play('badvibes_walk', true);

        // Edge detection timer
        this.edgeCheckTimer = 0;
    }

    update(time, delta) {
        if (!this.isAlive) return;

        // Reverse at walls
        if (this.sprite.body.blocked.left) {
            this.direction = 1;
            this.sprite.setFlipX(false);
        } else if (this.sprite.body.blocked.right) {
            this.direction = -1;
            this.sprite.setFlipX(true);
        }

        // Simple edge detection - reverse if about to fall
        this.edgeCheckTimer += delta;
        if (this.edgeCheckTimer > 200) {
            this.edgeCheckTimer = 0;
            if (this.sprite.body.blocked.down) {
                // Check ahead for edge using a raycast-like approach
                const aheadX = this.sprite.x + (this.direction * 20);
                const tileBelow = this.scene.levelManager ?
                    this.scene.levelManager.getTileAt(aheadX, this.sprite.y + 20) : null;
                if (tileBelow === null || tileBelow === 0) {
                    this.direction *= -1;
                    this.sprite.setFlipX(this.direction < 0);
                }
            }
        }

        this.sprite.setVelocityX(this.speed * this.direction);
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

        // Death animation - flash and disappear
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 300,
            onComplete: () => {
                // Spawn particles
                this.createDeathParticles();
                this.sprite.destroy();
            },
        });
    }

    createDeathParticles() {
        for (let i = 0; i < 6; i++) {
            const p = this.scene.add.rectangle(
                this.sprite.x + Phaser.Math.Between(-10, 10),
                this.sprite.y + Phaser.Math.Between(-10, 10),
                4, 4, 0x8844AA
            );
            p.setDepth(85);
            this.scene.tweens.add({
                targets: p,
                y: p.y - Phaser.Math.Between(20, 50),
                x: p.x + Phaser.Math.Between(-30, 30),
                alpha: 0,
                duration: 500,
                onComplete: () => p.destroy(),
            });
        }
    }

    destroy() {
        if (this.sprite) this.sprite.destroy();
    }
}

window.BadVibes = BadVibes;
