/**
 * SpriteGenerator.js - 8-bit pixel art with poster tropical palette
 * Colors: gold #FFD700, hot pink #FF69B4, blue #4169E1, green #228B22,
 *         orange #FF8C00, coral #FF7F50, teal #008080
 */
class SpriteGenerator {
    constructor(scene) {
        this.scene = scene;

        // Poster palette
        this.colors = {
            gold: '#FFD700',
            hotPink: '#FF69B4',
            blue: '#4169E1',
            green: '#228B22',
            darkGreen: '#006400',
            orange: '#FF8C00',
            coral: '#FF7F50',
            teal: '#008080',
            red: '#CC0000',
            yellow: '#FFAA00',
            brown: '#8B4513',
            darkBrown: '#5C2D00',
            skin: '#D2691E',
            skinDark: '#8B4513',
            white: '#FFFFFF',
            black: '#000000',
            grey: '#888888',
            darkGrey: '#444444',
            lightBlue: '#87CEEB',
            purple: '#9932CC',
            chrome: '#C0C0C0',
        };
    }

    generateAll() {
        this.generateCharacters();
        this.generateEnemies();
        this.generateTiles();
        this.generateCollectibles();
        this.generateEffects();
        this.generateUI();
        this.generateWorldMap();
        this.generateTropical();
        this.generateNewEntities();
    }

    // Helper: draw pixel
    px(ctx, x, y, color, s = 1) {
        ctx.fillStyle = color;
        ctx.fillRect(x * s, y * s, s, s);
    }

    // Helper: create texture from canvas
    makeTexture(key, w, h, drawFn, frames = 1) {
        if (this.scene.textures.exists(key)) return;
        const canvas = document.createElement('canvas');
        const frameW = w;
        canvas.width = frameW * frames;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        const s = Math.max(1, Math.floor(w / 16)); // pixel scale

        for (let f = 0; f < frames; f++) {
            ctx.save();
            ctx.translate(f * frameW, 0);
            drawFn(ctx, s, f);
            ctx.restore();
        }

        this.scene.textures.addSpriteSheet(key, canvas, {
            frameWidth: frameW, frameHeight: h,
        });
    }

    // =====================
    // CHARACTERS
    // =====================
    generateCharacters() {
        this.generateJackKong();
        this.generateScientist();
        this.generatePortraits();
    }

    generateJackKong() {
        const C = this.colors;
        this.makeTexture('jack_kong', 32, 32, (ctx, s, frame) => {
            // Jack Kong: dreadlocks, green jersey (poster), brown skin
            const draw = (x, y, c) => this.px(ctx, x, y, c, s);

            // Head/hair (dreadlocks - brown/black)
            if (frame === 0 || frame === 2) {
                // Idle / Walk frame 3
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 2, C.black));
                [2, 3, 4, 5, 6, 7, 8, 9].forEach(x => draw(x, 3, C.darkBrown));
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 4, C.skin));
                draw(4, 4, C.white); draw(5, 4, C.black); // eyes
                draw(7, 4, C.white); draw(8, 4, C.black);
                [4, 5, 6, 7].forEach(x => draw(x, 5, C.skin));
                draw(5, 5, C.brown); draw(6, 5, C.brown); // mouth
                // Dreads hanging down
                draw(2, 5, C.darkBrown); draw(9, 5, C.darkBrown);
                draw(2, 6, C.darkBrown); draw(9, 6, C.darkBrown);
                draw(1, 7, C.darkBrown); draw(10, 7, C.darkBrown);
            } else if (frame === 1) {
                // Walk frame 2
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 2, C.black));
                [2, 3, 4, 5, 6, 7, 8, 9].forEach(x => draw(x, 3, C.darkBrown));
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 4, C.skin));
                draw(4, 4, C.white); draw(5, 4, C.black);
                draw(7, 4, C.white); draw(8, 4, C.black);
                [4, 5, 6, 7].forEach(x => draw(x, 5, C.skin));
                draw(2, 5, C.darkBrown); draw(9, 5, C.darkBrown);
                draw(1, 6, C.darkBrown); draw(10, 6, C.darkBrown);
            }

            // Body - GREEN jersey (from poster!)
            if (frame <= 2) {
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 6, C.green));
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 7, C.green));
                draw(3, 6, C.gold); draw(8, 6, C.gold); // jersey trim (yellow like poster)
                draw(3, 7, C.gold); draw(8, 7, C.gold);
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 8, C.green));
                // Arms
                draw(2, 7, C.skin); draw(9, 7, C.skin);
                if (frame === 1) {
                    draw(1, 7, C.skin); draw(10, 7, C.skin);
                }
            }

            // Legs
            if (frame === 0) {
                // Standing
                [4, 5].forEach(x => draw(x, 9, C.darkBrown));
                [6, 7].forEach(x => draw(x, 9, C.darkBrown));
                [4, 5].forEach(x => draw(x, 10, C.purple));
                [6, 7].forEach(x => draw(x, 10, C.purple));
            } else if (frame === 1) {
                // Walk 1
                [3, 4, 5].forEach(x => draw(x, 9, C.darkBrown));
                [7, 8].forEach(x => draw(x, 9, C.darkBrown));
                [3, 4].forEach(x => draw(x, 10, C.purple));
                [8, 9].forEach(x => draw(x, 10, C.purple));
            } else if (frame === 2) {
                // Walk 2
                [5, 6].forEach(x => draw(x, 9, C.darkBrown));
                [5, 6].forEach(x => draw(x, 10, C.purple));
            }

            // Frame 3: Jump
            if (frame === 3) {
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 1, C.black));
                [2, 3, 4, 5, 6, 7, 8, 9].forEach(x => draw(x, 2, C.darkBrown));
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 3, C.skin));
                draw(4, 3, C.white); draw(5, 3, C.black);
                draw(7, 3, C.white); draw(8, 3, C.black);
                [4, 5, 6, 7].forEach(x => draw(x, 4, C.skin));
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 5, C.green));
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 6, C.green));
                draw(3, 5, C.gold); draw(8, 5, C.gold);
                draw(1, 6, C.skin); draw(10, 6, C.skin); // Arms up
                draw(2, 5, C.skin); draw(9, 5, C.skin);
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 7, C.green));
                [3, 4].forEach(x => draw(x, 8, C.darkBrown));
                [7, 8].forEach(x => draw(x, 8, C.darkBrown));
                [2, 3].forEach(x => draw(x, 9, C.purple));
                [8, 9].forEach(x => draw(x, 9, C.purple));
            }

            // Frame 4: Attack
            if (frame === 4) {
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 2, C.black));
                [2, 3, 4, 5, 6, 7, 8, 9].forEach(x => draw(x, 3, C.darkBrown));
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 4, C.skin));
                draw(4, 4, C.white); draw(5, 4, C.black);
                draw(7, 4, C.white); draw(8, 4, C.black);
                [4, 5, 6, 7].forEach(x => draw(x, 5, C.skin));
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 6, C.green));
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 7, C.green));
                draw(3, 6, C.gold); draw(8, 6, C.gold);
                // Attack arm extended
                draw(9, 6, C.skin); draw(10, 6, C.skin);
                draw(11, 6, C.skin); draw(12, 6, C.gold); // soundwave hand
                draw(12, 5, C.gold); draw(12, 7, C.gold);
                [4, 5, 6, 7].forEach(x => draw(x, 8, C.darkBrown));
                [4, 5, 6, 7].forEach(x => draw(x, 9, C.purple));
            }

            // Frame 5: Climb
            if (frame === 5) {
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 2, C.black));
                [2, 3, 4, 5, 6, 7, 8, 9].forEach(x => draw(x, 3, C.darkBrown));
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 4, C.skin));
                draw(4, 4, C.white); draw(5, 4, C.black);
                draw(7, 4, C.white); draw(8, 4, C.black);
                [4, 5, 6, 7].forEach(x => draw(x, 5, C.skin));
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 6, C.green));
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 7, C.green));
                // Arms reaching up
                draw(2, 4, C.skin); draw(9, 4, C.skin);
                draw(2, 3, C.skin); draw(9, 3, C.skin);
                [4, 5, 6, 7].forEach(x => draw(x, 8, C.darkBrown));
                [4, 5].forEach(x => draw(x, 9, C.purple));
                [6, 7].forEach(x => draw(x, 9, C.purple));
            }
        }, 6);
    }

    generateScientist() {
        const C = this.colors;
        this.makeTexture('scientist', 32, 32, (ctx, s, frame) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, s);

            // The Scientist: afro, green jersey (poster), darker skin
            // Head/afro
            if (frame < 3 || frame >= 3) {
                const headY = frame === 3 ? 1 : 2;
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, headY - 1, C.black));
                [2, 3, 4, 5, 6, 7, 8, 9].forEach(x => draw(x, headY, C.black));
                [3, 4, 5, 6, 7, 8].forEach(x => draw(x, headY + 1, C.skinDark));
                draw(4, headY + 1, C.white); draw(5, headY + 1, C.black);
                draw(7, headY + 1, C.white); draw(8, headY + 1, C.black);
                [4, 5, 6, 7].forEach(x => draw(x, headY + 2, C.skinDark));
            }

            // Body - GREEN jersey + yellow trim (same as poster)
            const bodyY = frame === 3 ? 5 : 6;
            [3, 4, 5, 6, 7, 8].forEach(x => draw(x, bodyY, C.green));
            [3, 4, 5, 6, 7, 8].forEach(x => draw(x, bodyY + 1, C.green));
            draw(3, bodyY, C.gold); draw(8, bodyY, C.gold);
            draw(3, bodyY + 1, C.gold); draw(8, bodyY + 1, C.gold);
            [3, 4, 5, 6, 7, 8].forEach(x => draw(x, bodyY + 2, C.green));

            // Arms
            draw(2, bodyY + 1, C.skinDark); draw(9, bodyY + 1, C.skinDark);
            if (frame === 1) {
                draw(1, bodyY + 1, C.skinDark); draw(10, bodyY + 1, C.skinDark);
            }
            if (frame === 4) {
                draw(10, bodyY, C.skinDark); draw(11, bodyY, C.skinDark);
                draw(12, bodyY, C.teal); draw(12, bodyY - 1, C.teal);
                draw(12, bodyY + 1, C.teal);
            }
            if (frame === 5) {
                draw(2, bodyY - 2, C.skinDark); draw(9, bodyY - 2, C.skinDark);
                draw(2, bodyY - 1, C.skinDark); draw(9, bodyY - 1, C.skinDark);
            }

            // Legs
            const legY = bodyY + 3;
            if (frame === 0 || frame >= 3) {
                [4, 5].forEach(x => draw(x, legY, C.darkBrown));
                [6, 7].forEach(x => draw(x, legY, C.darkBrown));
                [4, 5].forEach(x => draw(x, legY + 1, C.darkGrey));
                [6, 7].forEach(x => draw(x, legY + 1, C.darkGrey));
            } else if (frame === 1) {
                [3, 4, 5].forEach(x => draw(x, legY, C.darkBrown));
                [7, 8].forEach(x => draw(x, legY, C.darkBrown));
                [3, 4].forEach(x => draw(x, legY + 1, C.darkGrey));
                [8, 9].forEach(x => draw(x, legY + 1, C.darkGrey));
            } else if (frame === 2) {
                [5, 6].forEach(x => draw(x, legY, C.darkBrown));
                [5, 6].forEach(x => draw(x, legY + 1, C.darkGrey));
            }
        }, 6);
    }

    generatePortraits() {
        const C = this.colors;
        // Jack Kong portrait (for cutscenes)
        this.makeTexture('portrait_kong', 48, 48, (ctx, s) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, 3);
            // Hair/dreads
            for (let x = 3; x <= 12; x++) draw(x, 1, C.black);
            for (let x = 2; x <= 13; x++) draw(x, 2, C.darkBrown);
            for (let x = 1; x <= 14; x++) draw(x, 3, C.darkBrown);
            // Face
            for (let x = 3; x <= 12; x++) { draw(x, 4, C.skin); draw(x, 5, C.skin); }
            for (let x = 4; x <= 11; x++) draw(x, 6, C.skin);
            // Eyes
            draw(5, 4, C.white); draw(6, 4, C.black);
            draw(9, 4, C.white); draw(10, 4, C.black);
            // Mouth
            draw(7, 6, C.brown); draw(8, 6, C.brown);
            // Jersey
            for (let x = 3; x <= 12; x++) { draw(x, 7, C.green); draw(x, 8, C.green); }
            draw(3, 7, C.gold); draw(12, 7, C.gold);
            // Dreads hanging
            draw(1, 4, C.darkBrown); draw(14, 4, C.darkBrown);
            draw(1, 5, C.darkBrown); draw(14, 5, C.darkBrown);
            draw(0, 6, C.darkBrown); draw(15, 6, C.darkBrown);
        });

        // Scientist portrait
        this.makeTexture('portrait_scientist', 48, 48, (ctx, s) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, 3);
            // Afro
            for (let x = 2; x <= 13; x++) draw(x, 0, C.black);
            for (let x = 1; x <= 14; x++) { draw(x, 1, C.black); draw(x, 2, C.black); }
            // Face
            for (let x = 3; x <= 12; x++) { draw(x, 3, C.skinDark); draw(x, 4, C.skinDark); }
            for (let x = 4; x <= 11; x++) draw(x, 5, C.skinDark);
            // Eyes
            draw(5, 3, C.white); draw(6, 3, C.black);
            draw(9, 3, C.white); draw(10, 3, C.black);
            // Mouth
            draw(7, 5, C.brown); draw(8, 5, C.brown);
            // Jersey
            for (let x = 3; x <= 12; x++) { draw(x, 6, C.green); draw(x, 7, C.green); }
            draw(3, 6, C.gold); draw(12, 6, C.gold);
        });
    }

    // =====================
    // ENEMIES
    // =====================
    generateEnemies() {
        const C = this.colors;

        // Bad Vibes - purple blob
        this.makeTexture('enemy_badvibes', 32, 32, (ctx, s, frame) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, s);
            const offset = frame === 1 ? 1 : 0;
            [4, 5, 6, 7].forEach(x => draw(x, 3 + offset, C.purple));
            [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 4 + offset, C.purple));
            [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 5 + offset, '#7B2FBE'));
            [4, 5, 6, 7].forEach(x => draw(x, 6 + offset, '#7B2FBE'));
            draw(4, 4 + offset, C.white); draw(5, 4 + offset, C.red);
            draw(7, 4 + offset, C.white); draw(8, 4 + offset, C.red);
            [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 7 + offset, C.purple));
            draw(3, 8, C.purple); draw(8, 8, C.purple);
        }, 2);

        // Static enemy - yellow sparky
        this.makeTexture('enemy_static', 32, 32, (ctx, s, frame) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, s);
            [5, 6].forEach(x => draw(x, 2, C.gold));
            [4, 5, 6, 7].forEach(x => draw(x, 3, C.gold));
            [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 4, C.yellow));
            [3, 4, 5, 6, 7, 8].forEach(x => draw(x, 5, C.yellow));
            [4, 5, 6, 7].forEach(x => draw(x, 6, C.gold));
            draw(4, 4, C.black); draw(7, 4, C.black);
            // Sparks
            if (frame === 0) {
                draw(2, 3, C.gold); draw(9, 3, C.gold);
                draw(1, 2, C.yellow); draw(10, 2, C.yellow);
            } else {
                draw(2, 5, C.gold); draw(9, 5, C.gold);
                draw(1, 6, C.yellow); draw(10, 6, C.yellow);
            }
            [3, 4, 7, 8].forEach(x => draw(x, 7, C.gold));
        }, 2);

        // Boss
        this.makeTexture('enemy_boss', 64, 64, (ctx, s) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, 2);
            // Large corporate speaker boss
            for (let x = 8; x <= 24; x++) {
                for (let y = 4; y <= 28; y++) {
                    draw(x, y, C.darkGrey);
                }
            }
            // Speaker cone
            for (let x = 12; x <= 20; x++) {
                for (let y = 10; y <= 22; y++) {
                    const dist = Math.sqrt((x - 16) ** 2 + (y - 16) ** 2);
                    if (dist < 6) draw(x, y, C.chrome);
                    else if (dist < 8) draw(x, y, C.black);
                }
            }
            // Red eyes
            draw(12, 6, C.red); draw(13, 6, C.red);
            draw(19, 6, C.red); draw(20, 6, C.red);
            // Chrome trim
            for (let x = 8; x <= 24; x++) {
                draw(x, 4, C.chrome); draw(x, 28, C.chrome);
            }
        });
    }

    // =====================
    // TILES
    // =====================
    generateTiles() {
        const C = this.colors;

        // Girder (poster orange/coral)
        this.makeTexture('tile_girder', 32, 32, (ctx, s) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, s);
            for (let x = 0; x < 16; x++) {
                draw(x, 0, C.coral);
                for (let y = 1; y < 4; y++) draw(x, y, C.orange);
                draw(x, 4, C.coral);
                // Rivet details
                if (x % 4 === 1) { draw(x, 2, '#FF5500'); draw(x, 1, '#FFAA66'); }
            }
        });

        // Ladder (poster blue/teal)
        this.makeTexture('tile_ladder', 32, 32, (ctx, s) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, s);
            // Side rails
            for (let y = 0; y < 16; y++) {
                draw(4, y, C.teal);
                draw(11, y, C.teal);
            }
            // Rungs
            for (let r = 2; r < 16; r += 4) {
                for (let x = 5; x <= 10; x++) draw(x, r, C.lightBlue);
            }
        });

        // Brick
        this.makeTexture('tile_brick', 32, 32, (ctx, s) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, s);
            for (let y = 0; y < 16; y++) {
                for (let x = 0; x < 16; x++) {
                    const brickColor = (x + y * 3) % 7 === 0 ? C.darkBrown : C.brown;
                    draw(x, y, brickColor);
                }
            }
            // Mortar lines
            for (let x = 0; x < 16; x++) {
                draw(x, 4, C.darkGrey); draw(x, 8, C.darkGrey); draw(x, 12, C.darkGrey);
            }
            for (let y = 0; y < 16; y++) {
                const offset = (Math.floor(y / 4) % 2) * 4;
                draw(offset, y, C.darkGrey);
                draw(offset + 8, y, C.darkGrey);
            }
        });

        // One-way platform (thin, poster pink)
        this.makeTexture('tile_oneway', 32, 32, (ctx, s) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, s);
            for (let x = 0; x < 16; x++) {
                draw(x, 0, C.hotPink);
                draw(x, 1, '#CC5599');
            }
        });

        // Moving platform
        this.makeTexture('tile_platform_moving', 32, 32, (ctx, s) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, s);
            for (let x = 0; x < 16; x++) {
                draw(x, 0, C.gold);
                draw(x, 1, C.orange);
                draw(x, 2, '#CC6600');
            }
            // Arrow indicators
            draw(4, 1, C.white); draw(11, 1, C.white);
        });

        // Empty invisible tile (for triggers)
        this.makeTexture('tile_empty', 32, 32, (ctx) => { });
    }

    // =====================
    // COLLECTIBLES
    // =====================
    generateCollectibles() {
        const C = this.colors;

        // Vinyl (gold vinyl)
        this.makeTexture('collectible_vinyl', 24, 24, (ctx, s) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, 2);
            for (let x = 3; x <= 8; x++) {
                for (let y = 3; y <= 8; y++) {
                    const dist = Math.sqrt((x - 5.5) ** 2 + (y - 5.5) ** 2);
                    if (dist < 1) draw(x, y, C.gold);
                    else if (dist < 3) draw(x, y, C.black);
                    else if (dist < 3.5) draw(x, y, C.gold);
                }
            }
        });

        // Health pickup (heart)
        this.makeTexture('collectible_health', 16, 16, (ctx, s) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, 2);
            draw(1, 1, C.hotPink); draw(2, 1, C.hotPink);
            draw(4, 1, C.hotPink); draw(5, 1, C.hotPink);
            for (let x = 1; x <= 5; x++) draw(x, 2, C.hotPink);
            for (let x = 1; x <= 5; x++) draw(x, 3, C.red);
            for (let x = 2; x <= 4; x++) draw(x, 4, C.red);
            draw(3, 5, C.red);
        });

        // Star collectible (from poster — pink + green stars)
        this.makeTexture('collectible_star', 16, 16, (ctx, s) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, 2);
            draw(3, 0, C.hotPink);
            draw(2, 1, C.hotPink); draw(3, 1, C.gold); draw(4, 1, C.hotPink);
            for (let x = 0; x <= 6; x++) draw(x, 2, C.gold);
            draw(1, 3, C.gold); draw(2, 3, C.hotPink); draw(3, 3, C.gold);
            draw(4, 3, C.hotPink); draw(5, 3, C.gold);
            draw(1, 4, C.gold); draw(5, 4, C.gold);
        });
    }

    // =====================
    // EFFECTS
    // =====================
    generateEffects() {
        const C = this.colors;

        // Soundwave (teal wave)
        this.makeTexture('fx_soundwave', 16, 16, (ctx) => {
            ctx.fillStyle = C.teal;
            ctx.fillRect(2, 4, 12, 2);
            ctx.fillRect(4, 2, 8, 2);
            ctx.fillRect(4, 6, 8, 2);
            ctx.fillStyle = C.gold;
            ctx.fillRect(6, 3, 4, 4);
        });

        // Bass bomb (gold/pink rings)
        this.makeTexture('fx_bassbomb', 32, 32, (ctx) => {
            ctx.strokeStyle = C.gold;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(16, 16, 12, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = C.hotPink;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(16, 16, 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = C.gold;
            ctx.beginPath();
            ctx.arc(16, 16, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Reverb pulse
        this.makeTexture('fx_reverb', 32, 32, (ctx) => {
            ctx.strokeStyle = C.teal;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(16, 16, 12, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = C.lightBlue;
            ctx.beginPath();
            ctx.arc(16, 16, 6, 0, Math.PI * 2);
            ctx.stroke();
        });
    }

    // =====================
    // UI
    // =====================
    generateUI() {
        const C = this.colors;

        // Heart
        this.makeTexture('ui_heart', 16, 16, (ctx) => {
            const draw = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x * 2, y * 2, 2, 2); };
            draw(1, 1, C.red); draw(2, 1, C.red);
            draw(4, 1, C.red); draw(5, 1, C.red);
            for (let x = 1; x <= 5; x++) draw(x, 2, C.red);
            for (let x = 1; x <= 5; x++) draw(x, 3, C.red);
            for (let x = 2; x <= 4; x++) draw(x, 4, C.red);
            draw(3, 5, C.red);
        });

        // Heart empty
        this.makeTexture('ui_heart_empty', 16, 16, (ctx) => {
            const draw = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x * 2, y * 2, 2, 2); };
            draw(1, 1, C.darkGrey); draw(2, 1, C.darkGrey);
            draw(4, 1, C.darkGrey); draw(5, 1, C.darkGrey);
            for (let x = 1; x <= 5; x++) draw(x, 2, C.darkGrey);
            for (let x = 1; x <= 5; x++) draw(x, 3, C.darkGrey);
            for (let x = 2; x <= 4; x++) draw(x, 4, C.darkGrey);
            draw(3, 5, C.darkGrey);
        });

        // Vinyl icon
        this.makeTexture('ui_vinyl', 12, 12, (ctx) => {
            ctx.fillStyle = C.gold;
            ctx.beginPath();
            ctx.arc(6, 6, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = C.black;
            ctx.beginPath();
            ctx.arc(6, 6, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = C.gold;
            ctx.beginPath();
            ctx.arc(6, 6, 1, 0, Math.PI * 2);
            ctx.fill();
        });

        // Touch Control Sprites
        this.generateControls();
    }

    generateControls() {
        const C = this.colors;

        // ========================
        // D-PAD (120x120) - Cross shape with clear arrows
        // ========================
        this.makeTexture('ui_dpad', 120, 120, (ctx) => {
            const s = 120;
            const third = s / 3; // 40px per zone

            // Background cross shape
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            // Vertical bar
            ctx.fillRect(third, 0, third, s);
            // Horizontal bar
            ctx.fillRect(0, third, s, third);
            // Round the cross appearance
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.arc(s / 2, s / 2, s / 2 - 4, 0, Math.PI * 2);
            ctx.fill();

            // Center dot
            ctx.fillStyle = C.darkGrey;
            ctx.beginPath();
            ctx.arc(s / 2, s / 2, 8, 0, Math.PI * 2);
            ctx.fill();

            // Arrow styling
            ctx.fillStyle = C.gold;

            // UP arrow ▲
            ctx.beginPath();
            ctx.moveTo(s / 2, 8);
            ctx.lineTo(s / 2 + 12, 30);
            ctx.lineTo(s / 2 - 12, 30);
            ctx.closePath();
            ctx.fill();

            // DOWN arrow ▼
            ctx.beginPath();
            ctx.moveTo(s / 2, s - 8);
            ctx.lineTo(s / 2 + 12, s - 30);
            ctx.lineTo(s / 2 - 12, s - 30);
            ctx.closePath();
            ctx.fill();

            // LEFT arrow ◀
            ctx.beginPath();
            ctx.moveTo(8, s / 2);
            ctx.lineTo(30, s / 2 - 12);
            ctx.lineTo(30, s / 2 + 12);
            ctx.closePath();
            ctx.fill();

            // RIGHT arrow ▶
            ctx.beginPath();
            ctx.moveTo(s - 8, s / 2);
            ctx.lineTo(s - 30, s / 2 - 12);
            ctx.lineTo(s - 30, s / 2 + 12);
            ctx.closePath();
            ctx.fill();
        });

        // ========================
        // JUMP BUTTON (A) - Green with UP arrow
        // ========================
        this.makeTexture('ui_btn_a', 56, 56, (ctx) => {
            const s = 56;
            // Circle background
            ctx.fillStyle = 'rgba(34, 139, 34, 0.7)'; // green
            ctx.beginPath();
            ctx.arc(s / 2, s / 2, s / 2 - 2, 0, Math.PI * 2);
            ctx.fill();
            // Border
            ctx.strokeStyle = C.gold;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(s / 2, s / 2, s / 2 - 2, 0, Math.PI * 2);
            ctx.stroke();
            // UP arrow icon ▲
            ctx.fillStyle = C.gold;
            ctx.beginPath();
            ctx.moveTo(s / 2, 10);
            ctx.lineTo(s / 2 + 14, 34);
            ctx.lineTo(s / 2 - 14, 34);
            ctx.closePath();
            ctx.fill();
            // "JUMP" label
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('JUMP', s / 2, 46);
        });

        // ========================
        // ATTACK BUTTON (B) - Orange with soundwave/vinyl icon
        // ========================
        this.makeTexture('ui_btn_b', 56, 56, (ctx) => {
            const s = 56;
            // Circle background
            ctx.fillStyle = 'rgba(255, 140, 0, 0.7)'; // orange
            ctx.beginPath();
            ctx.arc(s / 2, s / 2, s / 2 - 2, 0, Math.PI * 2);
            ctx.fill();
            // Border
            ctx.strokeStyle = C.gold;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(s / 2, s / 2, s / 2 - 2, 0, Math.PI * 2);
            ctx.stroke();
            // Soundwave icon (3 arcs)
            ctx.strokeStyle = C.gold;
            ctx.lineWidth = 2;
            for (let r = 6; r <= 14; r += 4) {
                ctx.beginPath();
                ctx.arc(s / 2 - 4, s / 2 - 4, r, -0.6, 0.6);
                ctx.stroke();
            }
            // "DUB" label
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('DUB', s / 2, 46);
        });

        // ========================
        // SPECIAL BUTTON (C) - Pink/teal with star icon
        // ========================
        this.makeTexture('ui_btn_c', 56, 56, (ctx) => {
            const s = 56;
            // Circle background
            ctx.fillStyle = 'rgba(255, 105, 180, 0.7)'; // hot pink
            ctx.beginPath();
            ctx.arc(s / 2, s / 2, s / 2 - 2, 0, Math.PI * 2);
            ctx.fill();
            // Border
            ctx.strokeStyle = C.gold;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(s / 2, s / 2, s / 2 - 2, 0, Math.PI * 2);
            ctx.stroke();
            // Star icon
            ctx.fillStyle = C.gold;
            const cx = s / 2, cy = s / 2 - 4;
            const spikes = 5, outerR = 12, innerR = 5;
            ctx.beginPath();
            for (let i = 0; i < spikes * 2; i++) {
                const r = i % 2 === 0 ? outerR : innerR;
                const angle = (i * Math.PI / spikes) - Math.PI / 2;
                const px = cx + Math.cos(angle) * r;
                const py = cy + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            // "BASS" label
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('BASS', s / 2, 46);
        });
    }

    // =====================
    // WORLD MAP TILES
    // =====================
    generateWorldMap() {
        const C = this.colors;

        // Map path
        this.makeTexture('map_path', 16, 16, (ctx) => {
            ctx.fillStyle = '#DEB887';
            ctx.fillRect(0, 0, 16, 16);
            ctx.fillStyle = '#D2B48C';
            ctx.fillRect(2, 2, 12, 12);
        });

        // Map node (level dot)
        this.makeTexture('map_node', 20, 20, (ctx) => {
            ctx.fillStyle = C.gold;
            ctx.beginPath();
            ctx.arc(10, 10, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = C.orange;
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Map node locked
        this.makeTexture('map_node_locked', 20, 20, (ctx) => {
            ctx.fillStyle = C.darkGrey;
            ctx.beginPath();
            ctx.arc(10, 10, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Water tile
        this.makeTexture('map_water', 16, 16, (ctx) => {
            ctx.fillStyle = C.blue;
            ctx.fillRect(0, 0, 16, 16);
            ctx.fillStyle = '#5179F1';
            ctx.fillRect(0, 4, 16, 2);
            ctx.fillRect(4, 10, 16, 2);
        });

        // Land tile
        this.makeTexture('map_land', 16, 16, (ctx) => {
            ctx.fillStyle = C.green;
            ctx.fillRect(0, 0, 16, 16);
            ctx.fillStyle = C.darkGreen;
            ctx.fillRect(2, 2, 4, 4);
            ctx.fillRect(10, 8, 4, 4);
        });
    }

    // =====================
    // TROPICAL SPRITES (from poster)
    // =====================
    generateTropical() {
        const C = this.colors;

        // Palm tree
        this.makeTexture('deco_palm', 32, 48, (ctx) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, 2);
            // Trunk
            for (let y = 10; y <= 22; y++) {
                draw(7, y, C.brown); draw(8, y, C.brown);
                if (y % 3 === 0) draw(7, y, C.darkBrown);
            }
            // Fronds
            for (let x = 2; x <= 13; x++) draw(x, 4, C.green);
            for (let x = 3; x <= 12; x++) draw(x, 3, C.green);
            for (let x = 4; x <= 11; x++) draw(x, 2, C.darkGreen);
            for (let x = 1; x <= 6; x++) draw(x, 5, C.green);
            for (let x = 9; x <= 14; x++) draw(x, 5, C.green);
            draw(0, 6, C.green); draw(1, 6, C.green);
            draw(14, 6, C.green); draw(15, 6, C.green);
            // Coconuts
            draw(6, 5, C.darkBrown); draw(9, 5, C.darkBrown);
        });

        // Dolphin (pink like poster!)
        this.makeTexture('deco_dolphin', 32, 16, (ctx) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, 2);
            // Body
            [5, 6, 7, 8, 9, 10].forEach(x => draw(x, 3, C.hotPink));
            [4, 5, 6, 7, 8, 9, 10, 11].forEach(x => draw(x, 4, C.hotPink));
            [3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach(x => draw(x, 5, '#FF85C8'));
            [5, 6, 7, 8, 9, 10].forEach(x => draw(x, 6, '#FF85C8'));
            // Snout
            draw(12, 4, C.hotPink); draw(13, 4, C.hotPink);
            // Eye
            draw(10, 4, C.black);
            // Tail
            draw(2, 3, C.hotPink); draw(1, 2, C.hotPink);
            draw(3, 3, C.hotPink); draw(2, 6, C.hotPink);
            draw(1, 7, C.hotPink);
            // Fin
            draw(7, 2, C.hotPink); draw(8, 1, C.hotPink);
        });

        // Tropical fish (from poster - orange/yellow)
        this.makeTexture('deco_fish', 16, 16, (ctx) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, 2);
            draw(3, 2, C.orange); draw(4, 2, C.orange);
            [2, 3, 4, 5].forEach(x => draw(x, 3, C.orange));
            [2, 3, 4, 5].forEach(x => draw(x, 4, C.yellow));
            draw(3, 5, C.orange); draw(4, 5, C.orange);
            draw(5, 3, C.black); // eye
            draw(1, 3, C.coral); draw(1, 4, C.coral); // tail
            draw(0, 2, C.orange); draw(0, 5, C.orange);
        });

        // Starfish (poster pink)
        this.makeTexture('deco_starfish', 16, 16, (ctx) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, 2);
            draw(3, 0, C.hotPink);
            draw(2, 1, C.coral); draw(3, 1, C.hotPink); draw(4, 1, C.coral);
            for (let x = 0; x <= 6; x++) draw(x, 2, C.hotPink);
            draw(1, 3, C.coral); draw(3, 3, C.coral); draw(5, 3, C.coral);
            draw(0, 4, C.hotPink); draw(6, 4, C.hotPink);
        });

        // Coral
        this.makeTexture('deco_coral', 32, 32, (ctx) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, 2);
            // Coral branches
            draw(4, 10, C.coral); draw(5, 10, C.coral);
            draw(4, 9, C.coral); draw(5, 9, '#FF9966');
            draw(3, 8, C.coral); draw(6, 8, C.coral);
            draw(3, 7, '#FF9966'); draw(6, 7, '#FF9966');
            draw(2, 6, C.coral); draw(7, 6, C.coral);
            draw(10, 10, C.hotPink); draw(11, 10, C.hotPink);
            draw(10, 9, C.hotPink); draw(11, 9, '#FF85C8');
            draw(9, 8, C.hotPink); draw(12, 8, C.hotPink);
        });
    }

    // =====================
    // NEW ENTITY SPRITES
    // =====================
    generateNewEntities() {
        const C = this.colors;

        // Barrel launcher
        this.makeTexture('barrel_launcher', 32, 32, (ctx, s) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, s);
            // Barrel shape
            for (let x = 3; x <= 12; x++) {
                draw(x, 2, C.darkBrown);
                for (let y = 3; y <= 12; y++) draw(x, y, C.brown);
                draw(x, 13, C.darkBrown);
            }
            // Metal bands
            for (let x = 3; x <= 12; x++) {
                draw(x, 4, C.chrome); draw(x, 11, C.chrome);
            }
            // Arrow (indicates launch direction)
            draw(7, 3, C.gold); draw(8, 3, C.gold);
            draw(6, 4, C.gold); draw(9, 4, C.gold);
        });

        // Checkpoint speaker
        this.makeTexture('checkpoint_speaker', 24, 32, (ctx, s) => {
            const draw = (x, y, c) => this.px(ctx, x, y, c, 2);
            // Speaker cabinet
            for (let x = 1; x <= 10; x++) {
                for (let y = 2; y <= 14; y++) {
                    draw(x, y, C.darkGrey);
                }
            }
            // Speaker cone
            for (let x = 3; x <= 8; x++) {
                for (let y = 5; y <= 11; y++) {
                    draw(x, y, C.black);
                }
            }
            // Center
            draw(5, 8, C.chrome); draw(6, 8, C.chrome);
            draw(5, 7, C.chrome); draw(6, 7, C.chrome);
            // Top detail
            for (let x = 1; x <= 10; x++) draw(x, 2, C.chrome);
            for (let x = 1; x <= 10; x++) draw(x, 14, C.chrome);
        });
    }
}

window.SpriteGenerator = SpriteGenerator;
