/**
 * HUD.js - 8-bit styled heads-up display
 * DK arcade-style layout: health hearts, score, level name
 */
class HUD {
    constructor(scene) {
        this.scene = scene;
        this.elements = [];
        this.hearts = [];
        this.scoreText = null;
        this.levelText = null;
        this.vinylCount = null;
        this.timerText = null;
        this.fpsText = null;
    }

    create(levelName) {
        const { width } = this.scene.scale;
        const padding = 10;
        const safeTop = 10;

        // Score (top-left)
        this.scoreText = this.scene.add.text(padding, safeTop, 'SCORE: 0', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(500);
        this.elements.push(this.scoreText);

        // Level name (top-center)
        this.levelText = this.scene.add.text(width / 2, safeTop, levelName, {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#FFFFFF',
            stroke: '#000',
            strokeThickness: 2,
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(500);
        this.elements.push(this.levelText);

        // Health hearts (top-right)
        for (let i = 0; i < 3; i++) {
            const heart = this.scene.add.image(
                width - padding - (i * 35) - 15,
                safeTop + 12,
                'ui_heart'
            ).setScrollFactor(0).setDepth(500);
            this.hearts.push(heart);
            this.elements.push(heart);
        }

        // Vinyl counter (below score)
        this.vinylCount = this.scene.add.text(padding, safeTop + 22, '💿 0', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#CCCCCC',
            stroke: '#000',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(500);
        this.elements.push(this.vinylCount);

        // Pause button (top-right corner)
        const pauseBtn = this.scene.add.text(width - padding, safeTop + 30, '⏸', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#FFD700',
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(500).setInteractive();

        pauseBtn.on('pointerdown', () => {
            if (this.scene.pauseMenu) {
                this.scene.pauseMenu.toggle();
            }
        });
        this.elements.push(pauseBtn);

        // ========================================
        // MINI MUSIC PLAYER (below pause button)
        // Only shows if record player is unlocked
        // ========================================
        if (window.saveManager.data.recordPlayerUnlocked) {
            this.createMiniPlayer(width, padding, safeTop);
        }
    }

    createMiniPlayer(width, padding, safeTop) {
        const tracks = window.saveManager.getUnlockedTracks();
        if (!tracks || tracks.length === 0) return;

        const playerY = safeTop + 55; // Below hearts and pause button
        const isMuted = window.saveManager.data.musicMuted;
        const selectedTrack = window.saveManager.data.selectedTrack || tracks[0];

        // Track name display
        this.trackNameText = this.scene.add.text(width - padding, playerY, `♫ ${selectedTrack}`, {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#00FF88',
            stroke: '#000',
            strokeThickness: 2,
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(500);
        this.elements.push(this.trackNameText);

        // Control buttons row
        const btnY = playerY + 16;
        const btnStyle = {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 1,
        };

        // Mute toggle
        this.muteBtn = this.scene.add.text(width - padding, btnY, isMuted ? '🔇' : '🔊', {
            fontSize: '16px',
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(500).setInteractive();
        this.muteBtn.on('pointerdown', () => this.toggleMute());
        this.elements.push(this.muteBtn);

        // Skip forward (next track)
        this.nextBtn = this.scene.add.text(width - padding - 28, btnY, '▶', btnStyle)
            .setOrigin(1, 0).setScrollFactor(0).setDepth(500).setInteractive();
        this.nextBtn.on('pointerdown', () => this.skipTrack(1));
        this.elements.push(this.nextBtn);

        // Skip backward (prev track)
        this.prevBtn = this.scene.add.text(width - padding - 48, btnY, '◀', btnStyle)
            .setOrigin(1, 0).setScrollFactor(0).setDepth(500).setInteractive();
        this.prevBtn.on('pointerdown', () => this.skipTrack(-1));
        this.elements.push(this.prevBtn);

        // Track counter (e.g. "1/5")
        const trackIdx = tracks.indexOf(selectedTrack) + 1;
        this.trackCounter = this.scene.add.text(width - padding - 68, btnY + 2, `${trackIdx}/${tracks.length}`, {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#AAAAAA',
            stroke: '#000',
            strokeThickness: 1,
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(500);
        this.elements.push(this.trackCounter);
    }

    toggleMute() {
        const muted = window.saveManager.toggleMusicMute();
        window.audioManager.toggleMusicMute();
        if (this.muteBtn) {
            this.muteBtn.setText(muted ? '🔇' : '🔊');
        }
        // If unmuting and no music playing, start the selected track
        if (!muted) {
            const track = window.saveManager.data.selectedTrack;
            if (track && !window.audioManager.currentMusic) {
                window.audioManager.playTrack(track);
            }
        }
    }

    skipTrack(direction) {
        const tracks = window.saveManager.getUnlockedTracks();
        if (tracks.length <= 1) return;

        const current = window.saveManager.data.selectedTrack;
        let idx = tracks.indexOf(current);
        idx = (idx + direction + tracks.length) % tracks.length;
        const newTrack = tracks[idx];

        window.saveManager.selectTrack(newTrack);
        window.audioManager.playTrack(newTrack);

        // Unmute if switching tracks while muted
        if (window.saveManager.data.musicMuted) {
            window.saveManager.toggleMusicMute();
            window.audioManager.musicMuted = false;
            if (window.audioManager.currentMusicGain) {
                window.audioManager.currentMusicGain.gain.value = 0.6;
            }
            if (this.muteBtn) this.muteBtn.setText('🔊');
        }

        if (this.trackNameText) this.trackNameText.setText(`♫ ${newTrack}`);
        if (this.trackCounter) this.trackCounter.setText(`${idx + 1}/${tracks.length}`);
    }

    update(player) {
        if (!player) return;

        // Update score
        if (this.scoreText) {
            this.scoreText.setText(`SCORE: ${player.score}`);
        }

        // Update hearts
        for (let i = 0; i < this.hearts.length; i++) {
            if (i < player.health) {
                this.hearts[i].setTexture('ui_heart');
            } else {
                this.hearts[i].setTexture('ui_heart_empty');
            }
        }

        // Update vinyl count
        if (this.vinylCount) {
            this.vinylCount.setText(`💿 ${player.vinyls}`);
        }
    }

    showLevelIntro(name, subtitle) {
        const { width, height } = this.scene.scale;

        const bg = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
            .setScrollFactor(0).setDepth(600);

        const title = this.scene.add.text(width / 2, height / 2 - 30, name, {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 3,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(601);

        const sub = this.scene.add.text(width / 2, height / 2 + 10, subtitle, {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#CC0000',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(601);

        const ready = this.scene.add.text(width / 2, height / 2 + 50, 'GET READY!', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#FFFFFF',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(601);

        // Blink effect
        this.scene.tweens.add({
            targets: ready,
            alpha: 0,
            duration: 400,
            yoyo: true,
            repeat: 3,
        });

        // Fade out after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            this.scene.tweens.add({
                targets: [bg, title, sub, ready],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    bg.destroy();
                    title.destroy();
                    sub.destroy();
                    ready.destroy();
                },
            });
        });
    }

    showLevelComplete(score, vinyls, time, trackName, firstUnlock) {
        const { width, height } = this.scene.scale;

        const bg = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85)
            .setScrollFactor(0).setDepth(600);

        const title = this.scene.add.text(width / 2, height / 2 - 80, 'LEVEL COMPLETE!', {
            fontFamily: 'monospace',
            fontSize: '28px',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 4,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(601);

        // Stars based on performance
        const stars = vinyls >= 3 ? 3 : vinyls >= 1 ? 2 : 1;
        const starText = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
        const starDisplay = this.scene.add.text(width / 2, height / 2 - 40, starText, {
            fontSize: '32px',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(601);

        const scoreDisplay = this.scene.add.text(width / 2, height / 2, `SCORE: ${score}`, {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#FFFFFF',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(601);

        const plateDisplay = this.scene.add.text(width / 2, height / 2 + 25, `VINYLS: ${vinyls}`, {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#CCCCCC',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(601);

        let nextY = height / 2 + 50;

        // Record player unlock (Level 1 only)
        if (firstUnlock) {
            const rpText = this.scene.add.text(width / 2, nextY, '📻 RECORD PLAYER UNLOCKED!', {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#FF6600',
            }).setOrigin(0.5).setScrollFactor(0).setDepth(601);
            // Pulsing orange glow
            this.scene.tweens.add({
                targets: rpText,
                alpha: 0.4,
                duration: 500,
                yoyo: true,
                repeat: 4,
            });
            this.elements.push(rpText);
            nextY += 22;
        }

        // Track unlock display
        let trackDisplay = null;
        if (trackName) {
            trackDisplay = this.scene.add.text(width / 2, nextY, `🎵 TRACK UNLOCKED: "${trackName}"`, {
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#FFD700',
            }).setOrigin(0.5).setScrollFactor(0).setDepth(601);
            // Pulsing gold glow
            this.scene.tweens.add({
                targets: trackDisplay,
                alpha: 0.5,
                duration: 600,
                yoyo: true,
                repeat: 3,
            });
            nextY += 22;
        }

        const continueText = this.scene.add.text(width / 2, nextY + 15, 'TAP TO CONTINUE', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#FFD700',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(601);

        this.scene.tweens.add({
            targets: continueText,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1,
        });

        this.elements.push(bg, title, starDisplay, scoreDisplay, plateDisplay, continueText);
        if (trackDisplay) this.elements.push(trackDisplay);

        return { bg, stars };
    }

    destroy() {
        this.elements.forEach(e => { if (e && e.destroy) e.destroy(); });
        this.hearts.forEach(h => { if (h && h.destroy) h.destroy(); });
        this.elements = [];
        this.hearts = [];
    }
}

window.HUD = HUD;
