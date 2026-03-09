/**
 * PauseMenu.js - Overlay pause menu with settings
 */
class PauseMenu {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.elements = [];
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.scene.physics.pause();

        const { width, height } = this.scene.scale;

        // Overlay background
        const bg = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85)
            .setScrollFactor(0).setDepth(800);
        this.elements.push(bg);

        // Title
        const title = this.scene.add.text(width / 2, height / 2 - 100, 'PAUSED', {
            fontFamily: 'monospace',
            fontSize: '32px',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 4,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(801);
        this.elements.push(title);

        // Menu buttons
        const buttons = [
            { text: '▶ RESUME', action: () => this.close() },
            { text: '🔄 RESTART', action: () => this.restart() },
            { text: '⚙ SETTINGS', action: () => this.showSettings() },
            { text: '🏠 MAIN MENU', action: () => this.toMainMenu() },
        ];

        buttons.forEach((btn, i) => {
            const text = this.scene.add.text(width / 2, height / 2 - 30 + i * 45, btn.text, {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#FFFFFF',
                stroke: '#000',
                strokeThickness: 2,
                padding: { x: 20, y: 10 },
            }).setOrigin(0.5).setScrollFactor(0).setDepth(801).setInteractive();

            text.on('pointerover', () => text.setColor('#FFD700'));
            text.on('pointerout', () => text.setColor('#FFFFFF'));
            text.on('pointerdown', () => {
                window.audioManager.playMenuSelect();
                btn.action();
            });

            this.elements.push(text);
        });
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.scene.physics.resume();
        this.destroyElements();
    }

    restart() {
        this.close();
        this.scene.scene.restart();
    }

    toMainMenu() {
        this.close();
        this.scene.scene.start('MenuScene');
    }

    showSettings() {
        this.destroyElements();
        const { width, height } = this.scene.scale;
        const settings = window.saveManager.data.settings;

        const bg = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9)
            .setScrollFactor(0).setDepth(800);
        this.elements.push(bg);

        const title = this.scene.add.text(width / 2, height / 2 - 120, 'SETTINGS', {
            fontFamily: 'monospace', fontSize: '24px', color: '#FFD700',
            stroke: '#000', strokeThickness: 3,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(801);
        this.elements.push(title);

        // SFX Volume
        this.createSlider(width / 2, height / 2 - 60, 'SFX VOLUME', settings.sfxVolume, (val) => {
            window.audioManager.setSFXVolume(val);
            window.saveManager.updateSettings({ sfxVolume: val });
        });

        // Music Volume
        this.createSlider(width / 2, height / 2, 'MUSIC VOLUME', settings.musicVolume, (val) => {
            window.audioManager.setMusicVolume(val);
            window.saveManager.updateSettings({ musicVolume: val });
        });

        // Battery Saver toggle
        const batterySaverText = this.scene.add.text(width / 2, height / 2 + 50,
            `BATTERY SAVER: ${settings.batterySaver ? 'ON' : 'OFF'}`, {
            fontFamily: 'monospace', fontSize: '14px', color: '#FFFFFF',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(801).setInteractive();

        batterySaverText.on('pointerdown', () => {
            settings.batterySaver = !settings.batterySaver;
            batterySaverText.setText(`BATTERY SAVER: ${settings.batterySaver ? 'ON' : 'OFF'}`);
            window.saveManager.updateSettings({ batterySaver: settings.batterySaver });
        });
        this.elements.push(batterySaverText);

        // Back button
        const back = this.scene.add.text(width / 2, height / 2 + 100, '← BACK', {
            fontFamily: 'monospace', fontSize: '16px', color: '#FFD700',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(801).setInteractive();

        back.on('pointerdown', () => {
            this.destroyElements();
            this.isOpen = false;
            this.open();
        });
        this.elements.push(back);
    }

    createSlider(x, y, label, value, onChange) {
        const labelText = this.scene.add.text(x, y - 12, label, {
            fontFamily: 'monospace', fontSize: '12px', color: '#CCCCCC',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(801);
        this.elements.push(labelText);

        const sliderWidth = 160;
        const sliderBg = this.scene.add.rectangle(x, y + 8, sliderWidth, 8, 0x333333)
            .setScrollFactor(0).setDepth(801);
        this.elements.push(sliderBg);

        const sliderFill = this.scene.add.rectangle(
            x - sliderWidth / 2 + (sliderWidth * value) / 2,
            y + 8, sliderWidth * value, 8, 0xFFD700
        ).setScrollFactor(0).setDepth(802);
        this.elements.push(sliderFill);

        // Make clickable
        sliderBg.setInteractive();
        sliderBg.on('pointerdown', (pointer) => {
            const localX = pointer.x - (x - sliderWidth / 2);
            const newValue = Math.max(0, Math.min(1, localX / sliderWidth));
            sliderFill.width = sliderWidth * newValue;
            sliderFill.x = x - sliderWidth / 2 + (sliderWidth * newValue) / 2;
            onChange(newValue);
        });
    }

    destroyElements() {
        this.elements.forEach(e => { if (e && e.destroy) e.destroy(); });
        this.elements = [];
    }

    destroy() {
        this.destroyElements();
    }
}

window.PauseMenu = PauseMenu;
