/**
 * Checkpoint.js - Mid-level save point (dub speaker)
 * Activates when player passes, saves progress
 */
class Checkpoint {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.activated = false;

        // Speaker sprite
        this.sprite = scene.physics.add.staticSprite(x, y, 'checkpoint_speaker');
        this.sprite.setDepth(8);
        this.sprite.setTint(0x666666); // Inactive = grey
        this.sprite.refreshBody();
    }

    activate(player) {
        if (this.activated) return;
        this.activated = true;

        // Light up speaker with gold
        this.sprite.clearTint();
        this.sprite.setTint(0xFFD700);

        // Sound + haptic
        window.audioManager.playCollect();
        if (navigator.vibrate) navigator.vibrate([15, 10, 15]);

        // Save checkpoint position
        if (this.scene.currentCheckpoint) {
            this.scene.currentCheckpoint = { x: this.x, y: this.y - 20 };
        }

        // Particle burst (gold + green)
        const colors = [0xFFD700, 0x228B22, 0xFF69B4];
        for (let i = 0; i < 8; i++) {
            const p = this.scene.add.rectangle(
                this.x + Phaser.Math.Between(-10, 10),
                this.y + Phaser.Math.Between(-10, 10),
                3, 3, Phaser.Math.RND.pick(colors)
            ).setDepth(100);
            this.scene.tweens.add({
                targets: p,
                y: p.y - Phaser.Math.Between(20, 50),
                x: p.x + Phaser.Math.Between(-25, 25),
                alpha: 0, duration: 500,
                onComplete: () => p.destroy(),
            });
        }

        // Pulsing glow
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: 1.15, scaleY: 1.15,
            duration: 400, yoyo: true, repeat: 2,
        });
    }

    destroy() {
        if (this.sprite) this.sprite.destroy();
    }
}

window.Checkpoint = Checkpoint;
