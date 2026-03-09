/**
 * StoryCutscene.js - Pixel art dialog between worlds
 */
class StoryCutscene extends Phaser.Scene {
    constructor() {
        super({ key: 'StoryCutscene' });
    }

    init(data) {
        this.cutsceneId = data.cutscene || 'intro';
        this.nextScene = data.nextScene || 'WorldMapScene';
        this.nextData = data.nextData || {};
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.cameras.main.setBackgroundColor('#0a0a1e');
        this.cameras.main.fadeIn(400);

        // Get dialog data
        this.dialogs = this.getDialogs(this.cutsceneId);
        this.currentDialog = 0;

        // Dialog box
        this.dialogBox = this.add.rectangle(
            width / 2, height - 80, width - 30, 120,
            0x000000, 0.85
        ).setDepth(50).setStrokeStyle(2, 0xFFD700);

        // Speaker name
        this.speakerText = this.add.text(30, height - 135, '', {
            fontFamily: 'monospace', fontSize: '12px',
            color: '#FFD700', stroke: '#000', strokeThickness: 2,
        }).setDepth(51);

        // Dialog text
        this.dialogText = this.add.text(30, height - 115, '', {
            fontFamily: 'monospace', fontSize: '11px',
            color: '#FFFFFF',
            wordWrap: { width: width - 60 },
            lineSpacing: 4,
        }).setDepth(51);

        // Continue prompt
        this.continueText = this.add.text(width - 30, height - 30, '▼', {
            fontFamily: 'monospace', fontSize: '14px',
            color: '#FFD700',
        }).setOrigin(1, 1).setDepth(51);
        this.tweens.add({
            targets: this.continueText,
            y: this.continueText.y - 5,
            duration: 500, yoyo: true, repeat: -1,
        });

        // Portrait positions
        this.leftPortrait = this.add.image(60, height - 200, 'portrait_kong')
            .setScale(2).setDepth(40).setAlpha(0);
        this.rightPortrait = this.add.image(width - 60, height - 200, 'portrait_scientist')
            .setScale(2).setDepth(40).setAlpha(0);

        // Scene illustration area
        this.sceneGraphics = this.add.container(width / 2, height / 2 - 60).setDepth(10);
        this.drawSceneIllustration();

        // Show first dialog
        this.showDialog();

        // Advance on tap/key
        this.input.on('pointerdown', () => this.advanceDialog());
        this.input.keyboard.on('keydown', () => this.advanceDialog());

        // Skip button
        this.add.text(width - 20, 15, 'SKIP >', {
            fontFamily: 'monospace', fontSize: '10px',
            color: '#888',
        }).setOrigin(1, 0).setDepth(60).setInteractive()
            .on('pointerdown', () => this.endCutscene());
    }

    getDialogs(id) {
        const scripts = {
            intro: [
                { speaker: 'KONG', side: 'left', text: 'We recorded something special, me and the Scientist.' },
                { speaker: 'KONG', side: 'left', text: 'A whole album. Every track was gold.' },
                { speaker: 'KONG', side: 'left', text: 'But something happened... the vinyls got scattered. Every last one, lost.' },
                { speaker: 'KONG', side: 'left', text: 'I\'m going to find them all. Every track, every frequency.' },
            ],
            world2: [
                { speaker: 'KONG', side: 'left', text: 'I can hear the bass echoing through these tunnels.' },
                { speaker: 'KONG', side: 'left', text: 'More tracks are down here. I can feel the vibrations.' },
            ],
            world3: [
                { speaker: 'KONG', side: 'left', text: 'Some of the recordings made it offshore. His island studio.' },
                { speaker: 'KONG', side: 'left', text: 'The best sessions are always hidden in the deepest places.' },
            ],
            world4: [
                { speaker: 'KONG', side: 'left', text: 'This is it. The Scientist\'s headquarters.' },
                { speaker: 'KONG', side: 'left', text: 'The final tracks are here. I\'m completing this album.' },
            ],
            ending: [
                { speaker: 'SCIENTIST', side: 'right', text: '...you found them all.' },
                { speaker: 'KONG', side: 'left', text: 'Every track. Every frequency. The album is complete.' },
                { speaker: 'SCIENTIST', side: 'right', text: 'Maybe we should make some new ones. Together.' },
                { speaker: 'KONG', side: 'left', text: 'That\'s all I ever wanted, brother.' },
            ],
        };
        return scripts[id] || scripts.intro;
    }

    showDialog() {
        if (this.currentDialog >= this.dialogs.length) {
            this.endCutscene();
            return;
        }

        const d = this.dialogs[this.currentDialog];
        this.speakerText.setText(d.speaker);
        this.dialogText.setText('');

        // Typewriter effect
        let charIndex = 0;
        const text = d.text;
        if (this.typeTimer) this.typeTimer.remove();
        this.typeTimer = this.time.addEvent({
            delay: 30,
            callback: () => {
                charIndex++;
                this.dialogText.setText(text.substring(0, charIndex));
                if (charIndex >= text.length && this.typeTimer) {
                    this.typeTimer.remove();
                    this.typeTimer = null;
                }
            },
            repeat: text.length - 1,
        });

        // Highlight active portrait
        if (d.side === 'left') {
            this.leftPortrait.setAlpha(1);
            this.rightPortrait.setAlpha(0.3);
            this.speakerText.setColor('#FFD700');
        } else {
            this.leftPortrait.setAlpha(0.3);
            this.rightPortrait.setAlpha(1);
            this.speakerText.setColor('#00CED1');
        }
    }

    advanceDialog() {
        // If typing, finish instantly
        if (this.typeTimer) {
            this.typeTimer.remove();
            this.typeTimer = null;
            this.dialogText.setText(this.dialogs[this.currentDialog].text);
            return;
        }

        this.currentDialog++;
        this.showDialog();
    }

    drawSceneIllustration() {
        // Simple pixel art scene based on cutscene type
        const id = this.cutsceneId;
        const { width } = this.scale;

        // Stars background
        for (let i = 0; i < 15; i++) {
            const star = this.add.star(
                Phaser.Math.Between(10, width - 10),
                Phaser.Math.Between(10, 140),
                5, 1, 3,
                Phaser.Math.RND.pick([0xFF69B4, 0xFFD700, 0xFFFFFF]),
                0.5
            ).setDepth(5);
            this.tweens.add({
                targets: star, alpha: 0.1,
                duration: 800 + Math.random() * 600,
                yoyo: true, repeat: -1,
            });
        }

        // Scene-specific decoration
        if (id === 'intro' || id === 'world3') {
            // Palm trees + ocean
            if (this.textures.exists('deco_palm')) {
                this.add.image(60, 120, 'deco_palm').setScale(1.5).setDepth(6);
                this.add.image(width - 70, 110, 'deco_palm').setScale(1.3).setDepth(6);
            }
            // Water line
            this.add.rectangle(width / 2, 155, width, 30, 0x4169E1, 0.4).setDepth(4);
        }
    }

    endCutscene() {
        if (this.typeTimer) { this.typeTimer.remove(); this.typeTimer = null; }
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(this.nextScene, this.nextData);
        });
    }
}

window.StoryCutscene = StoryCutscene;
