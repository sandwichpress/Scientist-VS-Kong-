/**
 * BarrelLauncher.js - DK Country barrel cannon
 * Player enters, aims, launches
 */
class BarrelLauncher {
    constructor(scene, x, y, angle = 0, power = 600) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.angle = angle; // degrees
        this.power = power;
        this.occupied = false;
        this.autoLaunch = false;
        this.rotateSpeed = 0; // degrees per second (0 = fixed)

        // Barrel sprite
        this.sprite = scene.physics.add.staticSprite(x, y, 'barrel_launcher');
        this.sprite.setDepth(12);
        this.sprite.refreshBody();

        // Rotation for aiming
        if (this.rotateSpeed > 0) {
            this.autoLaunch = true;
        }
    }

    enterBarrel(player) {
        if (this.occupied) return;
        this.occupied = true;

        // Hide player inside barrel
        player.sprite.setPosition(this.x, this.y);
        player.sprite.setVelocity(0, 0);
        player.sprite.body.allowGravity = false;
        player.sprite.setAlpha(0.5);

        // Highlight barrel
        this.sprite.setTint(0xFFD700);

        // Auto-launch after brief delay, or wait for tap
        if (this.autoLaunch) {
            this.scene.time.delayedCall(800, () => this.launch(player));
        } else {
            // Launch on next jump press
            const handler = () => {
                this.launch(player);
            };
            this.scene.input.once('pointerdown', handler);
            this.scene.input.keyboard.once('keydown-Z', handler);
        }
    }

    launch(player) {
        if (!this.occupied) return;
        this.occupied = false;

        // Calculate launch vector
        const rad = Phaser.Math.DegToRad(this.angle - 90);
        const vx = Math.cos(rad) * this.power;
        const vy = Math.sin(rad) * this.power;

        player.sprite.body.allowGravity = true;
        player.sprite.setAlpha(1);
        player.sprite.setVelocity(vx, vy);

        // Clear tint
        this.sprite.clearTint();

        // Launch effect
        window.audioManager.playJump();
        if (navigator.vibrate) navigator.vibrate([20, 10, 30]);

        // Smoke particles
        for (let i = 0; i < 5; i++) {
            const p = this.scene.add.circle(
                this.x + Phaser.Math.Between(-8, 8),
                this.y + Phaser.Math.Between(-8, 8),
                Phaser.Math.Between(3, 6), 0x888888, 0.6
            ).setDepth(11);
            this.scene.tweens.add({
                targets: p,
                y: p.y - 20, alpha: 0, scale: 2,
                duration: 400,
                onComplete: () => p.destroy(),
            });
        }
    }

    update(time, delta) {
        // Rotating barrel
        if (this.rotateSpeed > 0) {
            this.angle += this.rotateSpeed * delta / 1000;
            this.sprite.setAngle(this.angle);
        }
    }

    destroy() {
        if (this.sprite) this.sprite.destroy();
    }
}

window.BarrelLauncher = BarrelLauncher;
