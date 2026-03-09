/**
 * MovingPlatform.js - Horizontal/vertical moving platforms
 */
class MovingPlatform {
    constructor(scene, x, y, type = 'horizontal', distance = 128, speed = 60) {
        this.scene = scene;
        this.type = type;
        this.startX = x;
        this.startY = y;
        this.distance = distance;
        this.speed = speed;

        // Create platform sprite
        this.sprite = scene.physics.add.sprite(x, y, 'tile_platform_moving');
        this.sprite.setDepth(10);
        this.sprite.body.immovable = true;
        this.sprite.body.allowGravity = false;
        this.sprite.body.moves = true;

        // Set velocity based on type
        if (type === 'horizontal') {
            this.sprite.body.velocity.x = speed;
        } else {
            this.sprite.body.velocity.y = speed;
        }

        this.direction = 1;
    }

    update(time, delta) {
        if (this.type === 'horizontal') {
            if (this.sprite.x >= this.startX + this.distance) {
                this.direction = -1;
                this.sprite.body.velocity.x = -this.speed;
            } else if (this.sprite.x <= this.startX) {
                this.direction = 1;
                this.sprite.body.velocity.x = this.speed;
            }
        } else {
            if (this.sprite.y >= this.startY + this.distance) {
                this.direction = -1;
                this.sprite.body.velocity.y = -this.speed;
            } else if (this.sprite.y <= this.startY) {
                this.direction = 1;
                this.sprite.body.velocity.y = this.speed;
            }
        }
    }

    destroy() {
        if (this.sprite) this.sprite.destroy();
    }
}

window.MovingPlatform = MovingPlatform;
