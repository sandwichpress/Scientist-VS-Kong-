/**
 * TouchControls.js - Mobile-first virtual controls
 * Virtual joystick (left), action buttons (right), keyboard fallback
 * Joystick: left/right only, analog speed (further = faster)
 */
class TouchControls {
    constructor(scene) {
        this.scene = scene;
        this.enabled = true;

        // State
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        this.jump = false;
        this.attack = false;
        this.special = false;

        // Analog joystick (0 to 1)
        this.analogX = 0;

        // Swipe
        this.swipeUp = false;
        this.swipeDown = false;
        this.swipeStartX = 0;
        this.swipeStartY = 0;
        this.swipeStartTime = 0;

        // Hold
        this.holdAttack = false;
        this.holdStartTime = 0;
        this.isHolding = false;

        // Double tap
        this.lastJumpTime = 0;
        this.doubleJump = false;

        // UI elements
        this.buttons = [];
        this.uiElements = [];

        // Joystick state
        this.joystickActive = false;
        this.joystickPointerId = null;
        this.joystickBase = null;
        this.joystickThumb = null;
        this.joystickBaseX = 0;
        this.joystickBaseY = 0;
        this.joystickRadius = 50;

        // Settings
        this.opacity = 0.6;
        this.scale = 1.0;

        // Keyboard (desktop)
        this.keys = null;
    }

    create() {
        const { width, height } = this.scene.scale;

        // Check if touch device
        this.isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

        if (this.isTouchDevice) {
            this.createTouchControls(width, height);
        }

        this.createKeyboardControls();
    }

    createTouchControls(width, height) {
        const isLandscape = width > height;

        // Joystick sizing
        const joyRadius = isLandscape ? Math.round(height * 0.16) : 50;
        const joyBaseSize = joyRadius * 2.4;
        const joyThumbSize = joyRadius * 0.9;
        this.joystickRadius = joyRadius;

        // Button sizing - MUCH bigger in landscape
        const btnSize = isLandscape ? Math.round(height * 0.22) : 60;
        const padding = isLandscape ? 20 : 20;

        // ========================
        // VIRTUAL JOYSTICK (left side)
        // ========================
        const joyX = padding + joyBaseSize / 2;
        const joyY = height - padding - joyBaseSize / 2;
        this.joystickBaseX = joyX;
        this.joystickBaseY = joyY;

        // Base circle (outer ring)
        this.joystickBase = this.scene.add.graphics()
            .setScrollFactor(0)
            .setDepth(1000)
            .setAlpha(this.opacity);

        // Draw base
        this.joystickBase.lineStyle(3, 0xFFD700, 0.6); // gold border
        this.joystickBase.fillStyle(0x000000, 0.3);
        this.joystickBase.fillCircle(joyX, joyY, joyRadius * 1.2);
        this.joystickBase.strokeCircle(joyX, joyY, joyRadius * 1.2);

        // Draw left/right arrows on base
        this.joystickBase.fillStyle(0xFFD700, 0.5);
        // Left arrow ◀
        this.joystickBase.fillTriangle(
            joyX - joyRadius * 0.9, joyY,
            joyX - joyRadius * 0.5, joyY - joyRadius * 0.3,
            joyX - joyRadius * 0.5, joyY + joyRadius * 0.3
        );
        // Right arrow ▶
        this.joystickBase.fillTriangle(
            joyX + joyRadius * 0.9, joyY,
            joyX + joyRadius * 0.5, joyY - joyRadius * 0.3,
            joyX + joyRadius * 0.5, joyY + joyRadius * 0.3
        );

        this.uiElements.push(this.joystickBase);

        // Thumb (draggable knob)
        this.joystickThumb = this.scene.add.graphics()
            .setScrollFactor(0)
            .setDepth(1001);

        this.drawJoystickThumb(joyX, joyY, joyThumbSize / 2);

        this.uiElements.push(this.joystickThumb);

        // Joystick touch zone (covers left half of screen)
        const joyZone = this.scene.add.zone(width * 0.3, height / 2, width * 0.6, height)
            .setScrollFactor(0)
            .setDepth(999)
            .setInteractive();

        joyZone.on('pointerdown', (pointer) => {
            if (!this.joystickActive) {
                this.joystickActive = true;
                this.joystickPointerId = pointer.id;
                this.updateJoystick(pointer.x);
            }
        });

        this.uiElements.push(joyZone);

        // Global pointer move/up for joystick tracking
        this.scene.input.on('pointermove', (pointer) => {
            if (this.joystickActive && pointer.id === this.joystickPointerId) {
                this.updateJoystick(pointer.x);
            }
        });

        this.scene.input.on('pointerup', (pointer) => {
            if (this.joystickActive && pointer.id === this.joystickPointerId) {
                this.releaseJoystick();
            }
        });

        // ========================
        // ACTION BUTTONS (right side) - bigger in landscape
        // ========================
        const btnBaseX = width - padding - btnSize / 2;
        const btnBaseY = height - padding - btnSize / 2;
        const btnSpacing = btnSize + (isLandscape ? 12 : 8);

        // Jump (A) - bottom-right (primary, most accessible)
        this.createActionButton(btnBaseX, btnBaseY, 'ui_btn_a', 'jump', btnSize);
        // Attack/Dub (B) - left of jump
        this.createActionButton(btnBaseX - btnSpacing, btnBaseY, 'ui_btn_b', 'attack', btnSize);
        // Special/Bass (C) - above jump
        this.createActionButton(btnBaseX, btnBaseY - btnSpacing, 'ui_btn_c', 'special', btnSize);

        // Swipe detection (for climbing etc)
        this.scene.input.on('pointerdown', (pointer) => {
            // Only track swipes on non-joystick, non-button touches
            if (pointer.x > width * 0.3 && pointer.x < width - padding - btnSize * 2) {
                this.swipeStartX = pointer.x;
                this.swipeStartY = pointer.y;
                this.swipeStartTime = Date.now();
            }
        });

        this.scene.input.on('pointerup', (pointer) => {
            const dx = pointer.x - this.swipeStartX;
            const dy = pointer.y - this.swipeStartY;
            const dt = Date.now() - this.swipeStartTime;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 50 && dt < 300) {
                if (Math.abs(dy) > Math.abs(dx)) {
                    if (dy < 0) {
                        this.swipeUp = true;
                        setTimeout(() => this.swipeUp = false, 100);
                    } else {
                        this.swipeDown = true;
                        setTimeout(() => this.swipeDown = false, 100);
                    }
                }
            }
        });
    }

    drawJoystickThumb(x, y, radius) {
        this.joystickThumb.clear();
        this.joystickThumb.fillStyle(0xFFD700, 0.8);
        this.joystickThumb.fillCircle(x, y, radius);
        this.joystickThumb.lineStyle(2, 0xFFFFFF, 0.6);
        this.joystickThumb.strokeCircle(x, y, radius);
    }

    updateJoystick(pointerX) {
        const dx = pointerX - this.joystickBaseX;
        const clamped = Phaser.Math.Clamp(dx, -this.joystickRadius, this.joystickRadius);
        const normalized = clamped / this.joystickRadius; // -1 to 1

        // Update thumb visual position
        const thumbRadius = this.joystickRadius * 0.45;
        this.drawJoystickThumb(this.joystickBaseX + clamped, this.joystickBaseY, thumbRadius);

        // Set analog + digital state
        this.analogX = Math.abs(normalized);

        if (normalized < -0.15) {
            this.left = true;
            this.right = false;
        } else if (normalized > 0.15) {
            this.right = true;
            this.left = false;
        } else {
            this.left = false;
            this.right = false;
            this.analogX = 0;
        }
    }

    releaseJoystick() {
        this.joystickActive = false;
        this.joystickPointerId = null;
        this.left = false;
        this.right = false;
        this.analogX = 0;

        // Reset thumb to center
        const thumbRadius = this.joystickRadius * 0.45;
        this.drawJoystickThumb(this.joystickBaseX, this.joystickBaseY, thumbRadius);
    }

    createActionButton(x, y, texture, action, size) {
        const btn = this.scene.add.image(x, y, texture)
            .setScrollFactor(0)
            .setDepth(1000)
            .setAlpha(this.opacity)
            .setDisplaySize(size, size)
            .setInteractive();

        btn.on('pointerdown', () => {
            btn.setAlpha(1);
            btn.setScale(btn.scaleX * 1.1, btn.scaleY * 1.1);

            if (action === 'jump') {
                const now = Date.now();
                if (now - this.lastJumpTime < 300) {
                    this.doubleJump = true;
                    setTimeout(() => this.doubleJump = false, 100);
                }
                this.lastJumpTime = now;
                this.jump = true;
            } else if (action === 'attack') {
                this.holdStartTime = Date.now();
                this.isHolding = true;
                this.attack = true;
            } else if (action === 'special') {
                this.special = true;
            }
        });

        btn.on('pointerup', () => {
            btn.setAlpha(this.opacity);
            btn.setDisplaySize(size, size);

            if (action === 'jump') {
                this.jump = false;
            } else if (action === 'attack') {
                if (this.isHolding && Date.now() - this.holdStartTime > 500) {
                    this.holdAttack = true;
                    setTimeout(() => this.holdAttack = false, 100);
                }
                this.isHolding = false;
                this.attack = false;
            } else if (action === 'special') {
                this.special = false;
            }
        });

        btn.on('pointerout', () => {
            btn.setAlpha(this.opacity);
            btn.setDisplaySize(size, size);
        });

        this.buttons.push(btn);
        this.uiElements.push(btn);
    }

    createKeyboardControls() {
        this.keys = this.scene.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            jump: Phaser.Input.Keyboard.KeyCodes.Z,
            attack: Phaser.Input.Keyboard.KeyCodes.X,
            special: Phaser.Input.Keyboard.KeyCodes.C,
            a_left: Phaser.Input.Keyboard.KeyCodes.A,
            d_right: Phaser.Input.Keyboard.KeyCodes.D,
            w_up: Phaser.Input.Keyboard.KeyCodes.W,
            s_down: Phaser.Input.Keyboard.KeyCodes.S,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            escape: Phaser.Input.Keyboard.KeyCodes.ESC,
        });
    }

    update() {
        if (!this.enabled) return;

        if (this.keys) {
            // Keyboard overrides (desktop) — always full speed
            if (this.keys.left.isDown || this.keys.a_left.isDown) {
                this.left = true;
                this.analogX = 1;
            } else if (!this.isTouchDevice) {
                this.left = false;
            }

            if (this.keys.right.isDown || this.keys.d_right.isDown) {
                this.right = true;
                this.analogX = 1;
            } else if (!this.isTouchDevice) {
                this.right = false;
            }

            if (this.keys.up.isDown || this.keys.w_up.isDown) this.up = true;
            else if (!this.isTouchDevice) this.up = false;

            if (this.keys.down.isDown || this.keys.s_down.isDown) this.down = true;
            else if (!this.isTouchDevice) this.down = false;

            // Reset analogX when keyboard not pressed and not using touch
            if (!this.isTouchDevice && !this.left && !this.right) {
                this.analogX = 0;
            }

            if (Phaser.Input.Keyboard.JustDown(this.keys.jump) || Phaser.Input.Keyboard.JustDown(this.keys.space)) {
                this.jump = true;
                const now = Date.now();
                if (now - this.lastJumpTime < 300) {
                    this.doubleJump = true;
                    setTimeout(() => this.doubleJump = false, 100);
                }
                this.lastJumpTime = now;
            }
            if (this.keys.jump.isUp && this.keys.space.isUp && !this.isTouchDevice) {
                this.jump = false;
            }

            if (Phaser.Input.Keyboard.JustDown(this.keys.attack)) {
                this.attack = true;
                this.holdStartTime = Date.now();
                this.isHolding = true;
            }
            if (this.keys.attack.isUp && !this.isTouchDevice) {
                if (this.isHolding && Date.now() - this.holdStartTime > 500) {
                    this.holdAttack = true;
                    setTimeout(() => this.holdAttack = false, 100);
                }
                this.isHolding = false;
                this.attack = false;
            }

            if (Phaser.Input.Keyboard.JustDown(this.keys.special)) {
                this.special = true;
            }
            if (this.keys.special.isUp && !this.isTouchDevice) {
                this.special = false;
            }
        }
    }

    setOpacity(val) {
        this.opacity = val;
        this.uiElements.forEach(el => {
            if (el.setAlpha) el.setAlpha(val);
        });
    }

    destroy() {
        this.uiElements.forEach(el => {
            if (el.destroy) el.destroy();
        });
        this.uiElements = [];
        this.buttons = [];
    }
}

window.TouchControls = TouchControls;
