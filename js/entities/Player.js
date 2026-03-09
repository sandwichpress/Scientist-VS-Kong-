/**
 * Player.js - Jack Kong / The Scientist
 * DK Country-inspired platforming with poster-themed effects
 */
class Player {
    constructor(scene, x, y, character = 'jackKong') {
        this.scene = scene;
        this.character = character;
        this.spriteKey = character === 'jackKong' ? 'jack_kong' : 'scientist';

        // Create sprite
        this.sprite = scene.physics.add.sprite(x, y, this.spriteKey, 0);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBounce(0);
        this.sprite.setDepth(100);

        // Tighten physics body to match pixel art (sprite is 32x32 but art only fills ~top 22px)
        this.sprite.body.setSize(20, 22);
        this.sprite.body.setOffset(6, 2);

        // Physics tuning
        this.speed = 160;
        this.sprintSpeed = 240;
        this.jumpForce = -370;
        this.wallSlideSpeed = 50;
        this.rollSpeed = 280;

        // State
        this.health = 3;
        this.maxHealth = 3;
        this.score = 0;
        this.vinyls = 0;
        this.isAlive = true;
        this.facingRight = true;

        // Ladder
        this.isOnLadder = false;
        this.isClimbing = false;
        this.isClimbingUp = false; // Exposed for ladder-through-floor fix

        // Movement states
        this.isGrounded = false;
        this.isSprinting = false;
        this.isRolling = false;
        this.rollTimer = 0;
        this.isWallSliding = false;
        this.isGroundPounding = false;
        this.groundPoundLanded = false;

        // Jump
        this.canJump = true;
        this.jumpHeld = false;
        this.jumpTimer = 0;
        this.maxJumpHoldTime = 150; // ms - variable jump height
        this.coyoteTime = 80; // ms grace period after leaving edge
        this.coyoteTimer = 0;
        this.wasGrounded = false;

        // Attack
        this.isAttacking = false;
        this.isInvincible = false;
        this.invincibilityTimer = 0;
        this.attackCooldown = 0;
        this.attackCooldownMax = 300;
        this.chargeTime = 0;

        // Create animations
        this.createAnimations();

        // Hitbox
        this.sprite.body.setSize(24, 28);
        this.sprite.body.setOffset(4, 4);
    }

    createAnimations() {
        const key = this.spriteKey;
        if (this.scene.anims.exists(`${key}_idle`)) return;

        this.scene.anims.create({
            key: `${key}_idle`,
            frames: [{ key: key, frame: 0 }],
            frameRate: 1, repeat: -1,
        });
        this.scene.anims.create({
            key: `${key}_walk`,
            frames: this.scene.anims.generateFrameNumbers(key, { start: 0, end: 2 }),
            frameRate: 8, repeat: -1,
        });
        this.scene.anims.create({
            key: `${key}_jump`,
            frames: [{ key: key, frame: 3 }],
            frameRate: 1, repeat: 0,
        });
        this.scene.anims.create({
            key: `${key}_attack`,
            frames: [{ key: key, frame: 4 }],
            frameRate: 1, repeat: 0,
        });
        this.scene.anims.create({
            key: `${key}_climb`,
            frames: [{ key: key, frame: 5 }],
            frameRate: 4, repeat: -1,
        });
    }

    update(controls, time, delta) {
        if (!this.isAlive) return;

        this.isGrounded = this.sprite.body.blocked.down || this.sprite.body.touching.down;

        // Coyote time tracking
        if (this.isGrounded) {
            this.coyoteTimer = this.coyoteTime;
            this.wasGrounded = true;
        } else if (this.wasGrounded) {
            this.coyoteTimer -= delta;
            if (this.coyoteTimer <= 0) {
                this.wasGrounded = false;
            }
        }

        // Invincibility flash
        if (this.isInvincible) {
            this.invincibilityTimer -= delta;
            this.sprite.setAlpha(Math.sin(time * 0.02) > 0 ? 1 : 0.3);
            if (this.invincibilityTimer <= 0) {
                this.isInvincible = false;
                this.sprite.setAlpha(1);
            }
        }

        // Cooldowns
        if (this.attackCooldown > 0) this.attackCooldown -= delta;
        if (this.rollTimer > 0) {
            this.rollTimer -= delta;
            if (this.rollTimer <= 0) this.isRolling = false;
        }

        // Ground pound landing
        if (this.isGroundPounding && this.isGrounded) {
            this.isGroundPounding = false;
            this.groundPoundLanded = true;
            this.scene.cameras.main.shake(150, 0.015);
            if (navigator.vibrate) navigator.vibrate([40, 20, 40]);

            // Shockwave particles (poster pink)
            for (let i = 0; i < 6; i++) {
                const p = this.scene.add.rectangle(
                    this.sprite.x + Phaser.Math.Between(-20, 20),
                    this.sprite.y + 14,
                    4, 4, 0xFF69B4
                ).setDepth(95);
                this.scene.tweens.add({
                    targets: p,
                    x: p.x + Phaser.Math.Between(-40, 40),
                    y: p.y - Phaser.Math.Between(5, 20),
                    alpha: 0, duration: 350,
                    onComplete: () => p.destroy(),
                });
            }
            this.scene.time.delayedCall(200, () => { this.groundPoundLanded = false; });
        }

        // Main movement
        if (this.isOnLadder) {
            this.handleLadderMovement(controls);
        } else if (this.isRolling) {
            this.handleRollMovement();
        } else if (this.isGroundPounding) {
            // Falling straight down
            this.sprite.setVelocityX(0);
        } else {
            this.handleNormalMovement(controls, delta);
        }

        // Attacks
        this.handleAttack(controls, time);

        // Wall slide detection
        this.checkWallSlide();

        // Animation
        this.updateAnimation();
    }

    handleNormalMovement(controls, delta) {
        const speed = controls.sprint ? this.sprintSpeed : this.speed;
        this.isSprinting = controls.sprint && (controls.left || controls.right);

        // Horizontal
        if (controls.left) {
            this.sprite.setVelocityX(-speed);
            this.facingRight = false;
            this.sprite.setFlipX(true);
        } else if (controls.right) {
            this.sprite.setVelocityX(speed);
            this.facingRight = true;
            this.sprite.setFlipX(false);
        } else {
            // Deceleration
            const vx = this.sprite.body.velocity.x;
            this.sprite.setVelocityX(vx * 0.85);
            if (Math.abs(this.sprite.body.velocity.x) < 5) {
                this.sprite.setVelocityX(0);
            }
        }

        // Jump with variable height + coyote time
        const canJumpNow = this.isGrounded || this.coyoteTimer > 0;
        if (controls.jump && canJumpNow && this.canJump) {
            this.sprite.setVelocityY(this.jumpForce);
            this.canJump = false;
            this.jumpHeld = true;
            this.jumpTimer = 0;
            this.coyoteTimer = 0;
            this.wasGrounded = false;
            window.audioManager.playJump();
            if (navigator.vibrate) navigator.vibrate(10);
        }

        // Variable jump height — cut jump short on release
        if (this.jumpHeld && !controls.jump) {
            this.jumpHeld = false;
            if (this.sprite.body.velocity.y < -100) {
                this.sprite.setVelocityY(this.sprite.body.velocity.y * 0.5);
            }
        }

        if (!controls.jump && this.isGrounded) {
            this.canJump = true;
        }

        // Ground pound (down in air)
        if (controls.down && !this.isGrounded && !this.isGroundPounding) {
            this.isGroundPounding = true;
            this.sprite.setVelocityX(0);
            this.sprite.setVelocityY(500);
            window.audioManager.playBassBomb();
        }

        // Roll attack (down + attack on ground, or swipe)
        if ((controls.swipeDown || (controls.down && controls.attack)) && this.isGrounded && !this.isRolling) {
            this.startRoll();
        }

        // Double jump / echo jump
        if (controls.doubleJump && this.isGrounded) {
            this.sprite.setVelocityY(this.jumpForce * 1.15);
            this.canJump = false;
            this.createEchoEffect();
            window.audioManager.playJump();
        }

        // Swipe up = echo jump
        if (controls.swipeUp && this.isGrounded) {
            this.sprite.setVelocityY(this.jumpForce * 1.15);
            this.createEchoEffect();
            window.audioManager.playJump();
        }
    }

    startRoll() {
        this.isRolling = true;
        this.rollTimer = 400;
        const dir = this.facingRight ? 1 : -1;
        this.sprite.setVelocityX(dir * this.rollSpeed);
        if (navigator.vibrate) navigator.vibrate(20);
    }

    handleRollMovement() {
        // Roll in current direction, pass through enemies dealing damage
        const dir = this.facingRight ? 1 : -1;
        this.sprite.setVelocityX(dir * this.rollSpeed);
    }

    checkWallSlide() {
        if (!this.isGrounded && !this.isOnLadder && !this.isGroundPounding) {
            const touchingWall = this.sprite.body.blocked.left || this.sprite.body.blocked.right;
            if (touchingWall && this.sprite.body.velocity.y > 0) {
                this.isWallSliding = true;
                this.sprite.setVelocityY(this.wallSlideSpeed);
            } else {
                this.isWallSliding = false;
            }
        } else {
            this.isWallSliding = false;
        }
    }

    handleLadderMovement(controls) {
        this.sprite.body.allowGravity = false;
        this.isClimbingUp = false;

        if (controls.up) {
            this.sprite.setVelocityY(-this.speed * 0.7);
            this.isClimbing = true;
            this.isClimbingUp = true; // Key flag for floor pass-through
        } else if (controls.down) {
            this.sprite.setVelocityY(this.speed * 0.7);
            this.isClimbing = true;
        } else {
            this.sprite.setVelocityY(0);
            this.isClimbing = false;
        }

        // Horizontal on ladder
        if (controls.left) {
            this.sprite.setVelocityX(-this.speed * 0.5);
        } else if (controls.right) {
            this.sprite.setVelocityX(this.speed * 0.5);
        } else {
            this.sprite.setVelocityX(0);
        }

        // Jump off ladder
        if (controls.jump) {
            this.isOnLadder = false;
            this.sprite.body.allowGravity = true;
            this.sprite.setVelocityY(this.jumpForce * 0.8);
            window.audioManager.playJump();
        }
    }

    handleAttack(controls, time) {
        if (this.attackCooldown > 0) return;

        if (controls.holdAttack) {
            this.fireBassAttack();
            return;
        }
        if (controls.attack && !this.isAttacking) {
            this.fireSoundwave();
        }
        if (controls.special) {
            this.fireSpecial();
        }
    }

    fireSoundwave() {
        this.isAttacking = true;
        this.attackCooldown = this.attackCooldownMax;
        window.audioManager.playSoundwave();
        setTimeout(() => { this.isAttacking = false; }, 200);

        const dir = this.facingRight ? 1 : -1;
        const wave = this.scene.physics.add.sprite(
            this.sprite.x + (dir * 20), this.sprite.y, 'fx_soundwave'
        );
        wave.setVelocityX(dir * 300);
        wave.setDepth(90);
        wave.body.allowGravity = false;
        this.scene.time.delayedCall(500, () => {
            if (wave && wave.active) wave.destroy();
        });
        if (this.scene.playerProjectiles) {
            this.scene.playerProjectiles.add(wave);
        }
        if (navigator.vibrate) navigator.vibrate(15);
    }

    fireBassAttack() {
        this.isAttacking = true;
        this.attackCooldown = this.attackCooldownMax * 2;
        window.audioManager.playBassBomb();
        setTimeout(() => { this.isAttacking = false; }, 400);

        const bomb = this.scene.physics.add.sprite(
            this.sprite.x, this.sprite.y, 'fx_bassbomb'
        );
        bomb.setDepth(90);
        bomb.body.allowGravity = false;
        bomb.setScale(0.5);
        this.scene.tweens.add({
            targets: bomb,
            scaleX: 2.5, scaleY: 2.5, alpha: 0,
            duration: 500,
            onComplete: () => bomb.destroy(),
        });
        this.scene.cameras.main.shake(200, 0.01);
        if (this.scene.playerProjectiles) {
            this.scene.playerProjectiles.add(bomb);
        }
        if (navigator.vibrate) navigator.vibrate([30, 20, 50]);
    }

    fireSpecial() {
        if (this.character === 'jackKong') {
            if (this.isGrounded) {
                this.sprite.setVelocityY(this.jumpForce * 1.2);
                this.createEchoEffect();
                window.audioManager.playJump();
            }
        } else {
            window.audioManager.playReverbPulse();
            const pulse = this.scene.physics.add.sprite(
                this.sprite.x, this.sprite.y, 'fx_reverb'
            );
            pulse.setDepth(90);
            pulse.body.allowGravity = false;
            this.scene.tweens.add({
                targets: pulse,
                scaleX: 5, scaleY: 5, alpha: 0,
                duration: 800,
                onComplete: () => pulse.destroy(),
            });
            if (this.scene.playerProjectiles) {
                this.scene.playerProjectiles.add(pulse);
            }
        }
    }

    createEchoEffect() {
        for (let i = 0; i < 3; i++) {
            const echo = this.scene.add.sprite(
                this.sprite.x, this.sprite.y + (i * 5),
                this.spriteKey, 3
            );
            echo.setAlpha(0.5 - i * 0.15);
            echo.setTint(0xFFD700);
            echo.setDepth(99);
            echo.setFlipX(!this.facingRight);
            this.scene.tweens.add({
                targets: echo,
                alpha: 0, y: echo.y + 20,
                duration: 300 + i * 100,
                onComplete: () => echo.destroy(),
            });
        }
    }

    takeDamage() {
        if (this.isInvincible || !this.isAlive) return;
        if (this.isRolling) return; // Invincible during roll

        this.health--;
        this.isInvincible = true;
        this.invincibilityTimer = 1500;
        window.audioManager.playHit();
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
        this.scene.cameras.main.shake(200, 0.015);
        this.sprite.setTint(0xFF0000);
        this.scene.time.delayedCall(100, () => this.sprite.clearTint());

        if (this.health <= 0) this.die();
    }

    die() {
        this.isAlive = false;
        window.audioManager.playDeath();
        this.sprite.setVelocityY(-300);
        this.sprite.setVelocityX(this.facingRight ? -100 : 100);
        this.sprite.body.allowGravity = true;
        this.sprite.body.checkCollision.none = true;
        this.scene.tweens.add({
            targets: this.sprite, angle: 360,
            duration: 1000, repeat: 2,
        });
        this.scene.time.delayedCall(2000, () => {
            if (this.scene.handlePlayerDeath) this.scene.handlePlayerDeath();
        });
    }

    heal(amount = 1) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }

    addScore(points) {
        this.score += points;
    }

    collectVinyl() {
        this.vinyls++;
        this.addScore(100);
        window.audioManager.playCollect();
    }

    setOnLadder(onLadder) {
        if (onLadder && !this.isOnLadder) {
            this.isOnLadder = true;
            this.sprite.body.allowGravity = false;
        } else if (!onLadder && this.isOnLadder) {
            this.isOnLadder = false;
            this.isClimbingUp = false;
            this.sprite.body.allowGravity = true;
        }
    }

    updateAnimation() {
        const key = this.spriteKey;
        if (!this.isAlive) return;

        if (this.isRolling) {
            this.sprite.anims.play(`${key}_attack`, true);
        } else if (this.isAttacking) {
            this.sprite.anims.play(`${key}_attack`, true);
        } else if (this.isClimbing) {
            this.sprite.anims.play(`${key}_climb`, true);
        } else if (this.isWallSliding) {
            this.sprite.anims.play(`${key}_climb`, true);
        } else if (!this.isGrounded && !this.isOnLadder) {
            this.sprite.anims.play(`${key}_jump`, true);
        } else if (Math.abs(this.sprite.body.velocity.x) > 10) {
            this.sprite.anims.play(`${key}_walk`, true);
        } else {
            this.sprite.anims.play(`${key}_idle`, true);
        }
    }

    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }

    destroy() {
        if (this.sprite) this.sprite.destroy();
    }
}

window.Player = Player;
