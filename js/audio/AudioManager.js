/**
 * AudioManager.js - Hot-swappable audio system
 * Uses Web Audio API for placeholder 8-bit SFX
 * Real record samples can be loaded later via loadSample()
 */
class AudioManager {
    constructor() {
        this.ctx = null;
        this.samples = {};
        this.musicGain = null;
        this.sfxGain = null;
        this.masterGain = null;
        this.initialized = false;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.musicMuted = false;
        this.currentTrackName = null;
        this.currentMusicGain = null;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = this.musicVolume;
            this.musicGain.connect(this.masterGain);
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = this.sfxVolume;
            this.sfxGain.connect(this.masterGain);
            this.initialized = true;
            this.currentMusic = null;
            // Auto-load game sound assets
            this.loadGameSamples();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    async loadGameSamples() {
        // Load jump sound effect
        await this.loadSample('jump', 'Sound Assets/Rimshot Room Break_1.wav');
        // Load theme song (used as track preview placeholder)
        await this.loadSample('themeSong', 'Sound Assets/Tip of the Day_ Scientist Dubs KONG to Free the Yellow King and Save the Swamp (Holiday Maker).mp3');
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Load a real audio sample (for when user supplies their record samples)
    async loadSample(name, url) {
        if (!this.ctx) return;
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
            this.samples[name] = audioBuffer;
            console.log(`Sample loaded: ${name}`);
        } catch (e) {
            console.warn(`Failed to load sample ${name}:`, e);
        }
    }

    // Play a loaded sample
    playSample(name, volume = 1) {
        if (!this.ctx || !this.samples[name]) return;
        const source = this.ctx.createBufferSource();
        source.buffer = this.samples[name];
        const gain = this.ctx.createGain();
        gain.gain.value = volume;
        source.connect(gain);
        gain.connect(this.sfxGain);
        source.start();
    }

    // ========================================
    // PLACEHOLDER 8-BIT SFX (Web Audio API)
    // These play until real samples are loaded
    // ========================================

    playJump() {
        if (this.samples['jump']) { this.playSample('jump'); return; }
        this._play8BitSFX('square', [200, 400, 600], 0.1, 0.5);
    }

    playSoundwave() {
        if (this.samples['soundwave']) { this.playSample('soundwave'); return; }
        this._play8BitSFX('sawtooth', [300, 250, 200, 150], 0.08, 0.4);
    }

    playBassBomb() {
        if (this.samples['bassBomb']) { this.playSample('bassBomb'); return; }
        this._play8BitSFX('sine', [80, 60, 40, 30, 20], 0.15, 0.8);
    }

    playReverbPulse() {
        if (this.samples['reverbPulse']) { this.playSample('reverbPulse'); return; }
        this._play8BitSFX('triangle', [400, 350, 300, 350, 400], 0.1, 0.5);
    }

    playCollect() {
        if (this.samples['collect']) { this.playSample('collect'); return; }
        this._play8BitSFX('square', [523, 659, 784, 1047], 0.08, 0.4);
    }

    playHit() {
        if (this.samples['hit']) { this.playSample('hit'); return; }
        this._play8BitSFX('sawtooth', [150, 80, 40], 0.05, 0.6);
    }

    playDeath() {
        if (this.samples['death']) { this.playSample('death'); return; }
        this._play8BitSFX('square', [400, 350, 300, 250, 200, 150, 100, 50], 0.12, 0.6);
    }

    playEnemyDeath() {
        if (this.samples['enemyDeath']) { this.playSample('enemyDeath'); return; }
        this._play8BitSFX('square', [600, 800, 1000, 1200], 0.06, 0.4);
    }

    playLevelComplete() {
        if (this.samples['levelComplete']) { this.playSample('levelComplete'); return; }
        // DK-style victory jingle
        const notes = [523, 587, 659, 784, 659, 784, 1047];
        const durations = [0.15, 0.15, 0.15, 0.3, 0.15, 0.15, 0.5];
        let time = this.ctx.currentTime;
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + durations[i]);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(time);
            osc.stop(time + durations[i]);
            time += durations[i];
        });
    }

    playMenuSelect() {
        this._play8BitSFX('square', [440, 880], 0.05, 0.3);
    }

    // Internal: generate an 8-bit style SFX
    _play8BitSFX(type, frequencies, noteDuration, volume) {
        if (!this.ctx) return;
        this.resume();

        let time = this.ctx.currentTime;
        frequencies.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(volume, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + noteDuration);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(time);
            osc.stop(time + noteDuration);
            time += noteDuration;
        });
    }

    setMusicVolume(vol) {
        this.musicVolume = vol;
        if (this.musicGain) this.musicGain.gain.value = vol;
    }

    setSFXVolume(vol) {
        this.sfxVolume = vol;
        if (this.sfxGain) this.sfxGain.gain.value = vol;
    }

    setMasterVolume(vol) {
        if (this.masterGain) this.masterGain.gain.value = vol;
    }

    playThemeSong() {
        this._playMusicTrack('themeSong', 'Theme Song', true);
    }

    // Play a named track — all use themeSong as placeholder audio for now
    playTrack(trackName) {
        if (!trackName) return;
        this.currentTrackName = trackName;
        // All tracks map to the single theme song audio for now
        // When real audio files are added, map trackName → sample name here
        this._playMusicTrack('themeSong', trackName, true);
    }

    _playMusicTrack(sampleName, displayName, loop) {
        if (!this.ctx || !this.samples[sampleName]) return;
        this.stopMusic();
        const source = this.ctx.createBufferSource();
        source.buffer = this.samples[sampleName];
        source.loop = loop;
        const gain = this.ctx.createGain();
        gain.gain.value = this.musicMuted ? 0 : 0.6;
        source.connect(gain);
        gain.connect(this.musicGain);
        source.start();
        this.currentMusic = source;
        this.currentMusicGain = gain;
        this.currentTrackName = displayName;
    }

    playTrackPreview() {
        // Play a short snippet of the theme as a 'track unlocked' preview
        if (!this.ctx || !this.samples['themeSong']) return;
        this.stopMusic();
        const source = this.ctx.createBufferSource();
        source.buffer = this.samples['themeSong'];
        source.loop = false;
        const gain = this.ctx.createGain();
        gain.gain.value = 0.5;
        // Fade out after 8 seconds
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime + 6);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 8);
        source.connect(gain);
        gain.connect(this.musicGain);
        source.start();
        source.stop(this.ctx.currentTime + 8);
        this.currentMusic = source;
    }

    toggleMusicMute() {
        this.musicMuted = !this.musicMuted;
        if (this.currentMusicGain) {
            this.currentMusicGain.gain.value = this.musicMuted ? 0 : 0.6;
        }
        return this.musicMuted;
    }

    isMusicMuted() {
        return this.musicMuted || false;
    }

    stopMusic() {
        if (this.currentMusic) {
            try { this.currentMusic.stop(); } catch (e) { }
            this.currentMusic = null;
            this.currentMusicGain = null;
        }
    }
}

window.AudioManager = AudioManager;
window.audioManager = new AudioManager();
