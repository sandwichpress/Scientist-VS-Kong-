/**
 * SaveManager.js - LocalStorage save system
 * Auto-saves on level complete, tracks progress, settings, high scores
 */

// Album tracklist - 20 tracks across 4 worlds
// Replace each placeholder with the real song name when ready
const ALBUM_TRACKS = {
    1: 'Tip of the Day',
    2: 'Level 2, Location 2',
    3: 'Level 3, Location 3',
    4: 'Level 4, Location 4',
    5: 'Level 5, Location 5',
    6: 'Level 6, Location 6',
    7: 'Level 7, Location 7',
    8: 'Level 8, Location 8',
    9: 'Level 9, Location 9',
    10: 'Level 10, Location 10',
    11: 'Level 11, Location 11',
    12: 'Level 12, Location 12',
    13: 'Level 13, Location 13',
    14: 'Level 14, Location 14',
    15: 'Level 15, Location 15',
    16: 'Level 16, Location 16',
    17: 'Level 17, Location 17',
    18: 'Level 18, Location 18',
    19: 'Level 19, Location 19',
    20: 'Level 20, Location 20',
};
window.ALBUM_TRACKS = ALBUM_TRACKS;

class SaveManager {
    constructor() {
        this.saveKey = 'dubkong_save';
        this.data = this.load();
    }

    getDefault() {
        return {
            levelsUnlocked: 1,
            levelScores: {},
            levelStars: {},
            totalScore: 0,
            settings: {
                sfxVolume: 0.7,
                musicVolume: 0.5,
                controlOpacity: 0.6,
                controlScale: 1.0,
                batterySaver: false,
                oneHanded: false,
                hapticFeedback: true,
            },
            character: 'jackKong',
            totalVinyls: 0,
            unlockedTracks: [],
            recordPlayerUnlocked: false,
            selectedTrack: null,
            musicMuted: false,
            achievements: [],
            playTime: 0,
        };
    }

    load() {
        try {
            const saved = localStorage.getItem(this.saveKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge with defaults to handle new fields
                return { ...this.getDefault(), ...parsed };
            }
        } catch (e) {
            console.warn('Failed to load save:', e);
        }
        return this.getDefault();
    }

    save() {
        try {
            localStorage.setItem(this.saveKey, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Failed to save:', e);
        }
    }

    completeLevel(levelNum, score, stars, vinyls) {
        if (levelNum >= this.data.levelsUnlocked) {
            this.data.levelsUnlocked = Math.min(levelNum + 1, 20);
        }

        const prevScore = this.data.levelScores[levelNum] || 0;
        if (score > prevScore) {
            this.data.levelScores[levelNum] = score;
        }

        const prevStars = this.data.levelStars[levelNum] || 0;
        if (stars > prevStars) {
            this.data.levelStars[levelNum] = stars;
        }

        this.data.totalVinyls += vinyls;

        // Unlock the track for this level
        const trackName = ALBUM_TRACKS[levelNum];
        if (trackName && !this.data.unlockedTracks.includes(trackName)) {
            this.data.unlockedTracks.push(trackName);
        }

        // Unlock record player on first level completion
        const firstUnlock = !this.data.recordPlayerUnlocked && levelNum === 1;
        if (levelNum === 1) {
            this.data.recordPlayerUnlocked = true;
            if (!this.data.selectedTrack && trackName) {
                this.data.selectedTrack = trackName;
            }
        }

        this.data.totalScore = Object.values(this.data.levelScores).reduce((a, b) => a + b, 0);
        this.save();
        return { trackName, firstUnlock }; // Return track info for display
    }

    getTrackForLevel(levelNum) {
        return ALBUM_TRACKS[levelNum] || null;
    }

    isTrackUnlocked(levelNum) {
        const track = ALBUM_TRACKS[levelNum];
        return track && this.data.unlockedTracks.includes(track);
    }

    getUnlockedTracks() {
        return this.data.unlockedTracks || [];
    }

    selectTrack(trackName) {
        if (this.data.unlockedTracks.includes(trackName)) {
            this.data.selectedTrack = trackName;
            this.save();
        }
    }

    toggleMusicMute() {
        this.data.musicMuted = !this.data.musicMuted;
        this.save();
        return this.data.musicMuted;
    }

    isLevelUnlocked(levelNum) {
        return levelNum <= this.data.levelsUnlocked;
    }

    getLevelScore(levelNum) {
        return this.data.levelScores[levelNum] || 0;
    }

    getLevelStars(levelNum) {
        return this.data.levelStars[levelNum] || 0;
    }

    updateSettings(settings) {
        this.data.settings = { ...this.data.settings, ...settings };
        this.save();
    }

    resetProgress() {
        this.data = this.getDefault();
        this.save();
    }
}

window.SaveManager = SaveManager;
window.saveManager = new SaveManager();
