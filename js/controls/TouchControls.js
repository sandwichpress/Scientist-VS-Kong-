/**
 * TouchControls.js - Mobile-first virtual controls
 * D-pad (left), action buttons (right), swipe gestures
 * Keyboard fallback for desktop
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

        // Touch tracking
        this.activeTouches = {};

        // UI elements
        this.dpad = null;
        this.buttons = [];
        this.uiElements = [];

        // Settings
        this.opacity = 0.6;
        this.scale = 1.0;
        this.oneHandedMode = false;

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
        const padding = isLandscape ? 15 : 20;
        const scaleFactor = isLandscape ? Math.min(1, height / 400) : this.scale;
        const dpadSize = Math.round(120 * scaleFactor);
        const btnSize = Math.round(60 * scaleFactor);

        // D-pad position (bottom-left)
        const dpadX = padding + dpadSize / 2;
        const dpadY = height - padding - dpadSize / 2;

        // Create D-pad background
        this.dpad = this.scene.add.image(dpadX, dpadY, 'ui_dpad')
            .setScrollFactor(0)
            .setDepth(1000)
            .setAlpha(this.opacity)
            .setDisplaySize(dpadSize, dpadSize)
            .setInteractive();

        this.uiElements.push(this.dpad);

        // D-pad zones (invisible interactive areas)
        const zoneSize = dpadSize / 3;

        // Up zone
        this.createDPadZone(dpadX, dpadY - zoneSize, zoneSize, zoneSize, 'up');
        // Down zone
        this.createDPadZone(dpadX, dpadY + zoneSize, zoneSize, zoneSize, 'down');
        // Left zone
        this.createDPadZone(dpadX - zoneSize, dpadY, zoneSize, zoneSize, 'left');
        // Right zone
        this.createDPadZone(dpadX + zoneSize, dpadY, zoneSize, zoneSize, 'right');

        // Action buttons (bottom-right) - Diamond layout: Jump at bottom, Attack left, Special top
        const btnBaseX = width - padding - btnSize / 2;
        const btnBaseY = height - padding - btnSize / 2;
        const btnSpacing = btnSize + 8;

        // Jump (A) - bottom-right (primary, most accessible)
        this.createActionButton(btnBaseX, btnBaseY, 'ui_btn_a', 'jump', btnSize);
        // Attack/Dub (B) - left of jump
        this.createActionButton(btnBaseX - btnSpacing, btnBaseY, 'ui_btn_b', 'attack', btnSize);
        // Special/Bass (C) - above jump
        this.createActionButton(btnBaseX, btnBaseY - btnSpacing, 'ui_btn_c', 'special', btnSize);

        // Swipe detection on the whole screen
        this.scene.input.on('pointerdown', (pointer) => {
            this.swipeStartX = pointer.x;
            this.swipeStartY = pointer.y;
            this.swipeStartTime = Date.now();
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

    createDPadZone(x, y, w, h, direction) {
        const zone = this.scene.add.zone(x, y, w, h)
            .setScrollFactor(0)
            .setDepth(1001)
            .setInteractive();

        zone.on('pointerdown', () => {
            this[direction] = true;
        });

        zone.on('pointerup', () => {
            this[direction] = false;
        });

        zone.on('pointerout', () => {
            this[direction] = false;
        });

        this.uiElements.push(zone);
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
            // Keyboard overrides (desktop)
            if (this.keys.left.isDown || this.keys.a_left.isDown) this.left = true;
            else if (!this.isTouchDevice) this.left = false;

            if (this.keys.right.isDown || this.keys.d_right.isDown) this.right = true;
            else if (!this.isTouchDevice) this.right = false;

            if (this.keys.up.isDown || this.keys.w_up.isDown) this.up = true;
            else if (!this.isTouchDevice) this.up = false;

            if (this.keys.down.isDown || this.keys.s_down.isDown) this.down = true;
            else if (!this.isTouchDevice) this.down = false;

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

    setScale(val) {
        this.scale = val;
        // Recreate controls with new scale
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
