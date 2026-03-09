/**
 * LevelManager.js - Side-scrolling levels, 4 worlds × 5 levels
 * Tile legend: 0=empty, 1=girder, 2=ladder, 3=brick, 4=one-way platform
 * P=spawn, E=exit, D=vinyl, B=bad vibes, S=static, F=boss, H=health
 * M=moving platform, K=barrel launcher, C=checkpoint
 */
class LevelManager {
    constructor(scene) {
        this.scene = scene;
        this.currentLevel = 1;
        this.tiles = [];
        this.ladders = [];
        this.enemies = [];
        this.collectibles = [];
        this.movingPlatforms = [];
        this.barrelLaunchers = [];
        this.checkpoints = [];
        this.spawnPoint = { x: 0, y: 0 };
        this.exitPoint = { x: 0, y: 0 };
        this.bossSpawn = null;
        this.tileSize = 32;
    }

    getLevelData(levelNum) {
        const levels = {};

        // ===== WORLD 1: THE COAST (levels 1-5) =====
        levels[1] = {
            name: 'COAST 1-1', subtitle: 'The shore',
            width: 50, map: [
                '00000000000000000000000000000000000000000000000000',
                '00000000000000000000000000000000000000000000000000',
                '00000000000000000000000000000000000000000000000000',
                '00000000000000000000000000000000000000000000000000',
                '00000000000000000000000000000000000000000000E00000',
                '00000000000044400000000000000000000000000011111000',
                '0000000004400000000000000000044000D0000000000000D0',
                '000000440000000000D00000000440004400000044000004400',
                '00004400000000000440000004400000000000044000000000',
                '0004000000000004400000044000000000000440000000B000',
                '00000000B00004400000044000C000000004400000D0004400',
                '000000044444000000044000044000000440000000444000D0',
                '0000440000000000044000000000000440000000000000B000',
                '000000000D0000044000000D000004400000000000000044H0',
                '00P000000044444000004400000440000000D00000000000B0',
                '1111111111111111111111111111111111111111111111111111',
            ],
            bgColor: '#0a0a2e',
        };

        levels[2] = {
            name: 'COAST 1-2', subtitle: 'Rising tide',
            width: 50, map: [
                '00000000000000000000000000000000000000000000000000',
                '00000000000000000000000000000000000000000000000000',
                '00000000000000000000000000000000000000000000E00000',
                '00000000000000000D000000000000000000000000111D0000',
                '0000000000000000440000000000000000000000000002000B',
                '000000000000044000B0000000000000000D000000000200D0',
                '0000000000044000044000000000C000004400000000020000',
                '00000000044000000000000000044000000000B000002D0000',
                '000D0004400000B000000000044000D000000044000020000D',
                '00440440000000440000000440000440000000000000200000',
                '000000000D000000000004400000000000D00000D004211100',
                '000000004400000000044000000000000440004400000000B0',
                '0000044000000D0004400000000D000000000000000000B000',
                '00044000000044444000000004400000000000000000000000',
                '00P000000000000000000044000000000000D0000000000000',
                '11111111111111111111111111111111111111111111111111',
            ],
            bgColor: '#0a1a2e',
        };

        levels[3] = {
            name: 'COAST 1-3', subtitle: 'Reef',
            width: 45, map: [
                '000000000000000000000000000000000000000000000',
                '000000000000000000000000000000000000000000000',
                '000000000000000000000000000000000000000E00000',
                '000000000000000000000000000000000000001111000',
                '00000000000000000000000D0000000000000000000D0',
                '0000000000000000000004400000C0000000440004400',
                '000000000000B000000440000004400000440000000B0',
                '00000000000044000440000000000000440000D0004400',
                '0000000000000000000000D0000004400000044000000D',
                '000000C000000000000004400004400000000000000440',
                '00000044000D0000004400000440000000B00000000000',
                '00004400044000004400000000000D0044000D000000B0',
                '000000000000004400000B00004400000000440000B000',
                '0000B000D000440000004400440000D000000000044H00',
                '00P000004444000000000000000004400000000000000B0',
                '111111111111111111111111111111111111111111111111',
            ],
            bgColor: '#0a1a3e',
        };

        levels[4] = {
            name: 'COAST 1-4', subtitle: 'Cliffs',
            width: 45, map: [
                '000000000000000000000000000000000000000000000',
                '000000000000000000000000000000000000000000000',
                '0000000000000000000000000000000000000E0000000',
                '000000000000000000000000000000D0000111100000',
                '00000000000000D000000000000004400000000000000',
                '000000000000044000000C0000044000000000000000D',
                '000000B00004400000004400044000000D00000000440',
                '00000044004400000000000440000B0044000000440000',
                '000000000000000D000004400000044000000440000000',
                '0000C000000000440004400M00000000004400000B0000',
                '000044000000000000440000000D00000440000004400D',
                '00440000000D0000440000B004400004400000000000B0',
                '00000000004400440000004400000440000D0000000000',
                '00000D000000000000000000000000000044000000B000',
                '0P0004444000000000000D000000000000000000044000',
                '111111111111111111111111111111111111111111111111',
            ],
            bgColor: '#0a0a4e',
        };

        levels[5] = {
            name: 'COAST 1-5', subtitle: 'Boss',
            width: 30, isBossLevel: true, map: [
                '000000000000000000000000000000',
                '000000000000F00000000000000000',
                '000000000000000000000000000000',
                '000000000000000000000000000000',
                '000011111111111111111100000000',
                '000000000000000000000000000000',
                '000000000000000000000000000000',
                '000000000000000000000000000000',
                '001100000000000000000000110000',
                '000000000000000000000000000000',
                '000000000000000000000000000000',
                '000000000000000000000000000000',
                '000000110000H00000110D00000000',
                '000000000000000000000000000000',
                '000000000000000000000000000000',
                '000000000000000000000000000000',
                '001100000000000000000000110000',
                '000000000000000000000000000000',
                '000000000000000000000000000000',
                '000000110000000000110D00000000',
                '000000000000000000000000000000',
                '0000000000P0000000000000000000',
                '111111111111111111111111111111',
            ],
            bgColor: '#0a1a0a',
        };

        // ===== WORLD 2: THE CITY (levels 6-10) =====
        levels[6] = {
            name: 'CITY 2-1', subtitle: 'Streets',
            width: 50, map: [
                '00000000000000000000000000000000000000000000000000',
                '00000000000000000000000000000000000000000000000000',
                '00000000000000000000000000000000000000000000E00000',
                '000000000000000000D0000000000000000000D00111110000',
                '00000000000000004400000000000000000004400002000000',
                '00000000000000440000S000000000C000044000000020000D',
                '0000000000D04400000044000000044000000000B000200440',
                '000000000440000B000000000004400000D000044002000000',
                '000000044000004400000000044000004400000000020D0000',
                '000000000000000000D000044000000000000000002000000B',
                '0000C00000B000000044044000D000B00000D00004211111H0',
                '0004400000440000000000000440004400044000000000000S',
                '0000000D00000000000D00000000000000000000D000000000',
                '000044400000000000440000D00000000000004400000B0000',
                '0P0000000000000000000044000000D00000000000000S0000',
                '11111111111111111111111111111111111111111111111111',
            ],
            bgColor: '#1a0a0a',
        };

        levels[7] = {
            name: 'CITY 2-2', subtitle: 'Tunnels',
            width: 50, map: [
                '00000000000000000000000000000000000000000000000000',
                '00000000000000000000000000000000000000000000000000',
                '000000000000000000000000000000000000000000E0000000',
                '000000000000000000000000000D00000000000011110D0000',
                '00000000000000000000C000044000000000000000000S0000',
                '0000000000D0000000004400000000000D0004400000044H00',
                '00000000044000B000000000D000000044000000000000000S',
                '00000004400004400000000440000440000B000000D0000040',
                '000000000000000000004400000000000044000004400B0000',
                '00000D000B0000000044000D000C000000000000000044000D',
                '0000440004400000440000440044000D000000D00000000S00',
                '000000000000004400000000000000440044000000000B0000',
                '0000S00D000044000D000B00000000000000000D0000000000',
                '000044000440000044000440000000000000044000000S0000',
                '0P0000000000000000000000000D000000000000000000000D',
                '11111111111111111111111111111111111111111111111111',
            ],
            bgColor: '#1a1a1a',
        };

        levels[8] = {
            name: 'CITY 2-3', subtitle: 'Rooftops',
            width: 45, map: [
                '000000000000000000000000000000000000000000000',
                '000000000000000000000000000000000000000000000',
                '00000000000000000000000000000000000E000000000',
                '000000000000000000000000000000000011110000000',
                '0000000000000000D000000C00000D0000000000000S',
                '00000000000000440000004400044000000000000440',
                '0000000S0000440000000000004400000D0000440000',
                '000000044044000D0B00000044000B004400440000B0',
                '0000000000000044000004400000044000000000D000',
                '000C000000D000000004400D0000000000000B004400',
                '0004400044000000044000440000D00000044000000S',
                '000000000000D004400000000004400044000000B0000',
                '00B0000000044440000S00000000000000000D0044H00',
                '0044000D000000000044000D00000000000044000000S',
                '0P000044000000000000044000000D000000000000000',
                '111111111111111111111111111111111111111111111111',
            ],
            bgColor: '#2a1a1a',
        };

        levels[9] = {
            name: 'CITY 2-4', subtitle: 'Underground',
            width: 45, map: [
                '000000000000000000000000000000000000000000000',
                '000000000000000000000000000000000000000000000',
                '0000000000000000000000000000000000E0000000000',
                '0000000000000000000000000000D00011111000D0000',
                '00000000000000D000000C000004400000020000440S0',
                '000000000000044000004400044000000000200000000B',
                '0000S00000044000000000004400000D000020D0000000',
                '00004400044000DS00000044000B004400002000000B00',
                '0000000000000440000440000004400000042111110000',
                '00C0000D0B000000044000D0000000000440000000000S',
                '00440044000000044000044000D000440000000B0000000',
                '0000000000D004400000000004400000D000044000S0000',
                '00S0000004440000S000000000000044000000000000000',
                '004400D000000000440D0000000000000D004400000B000',
                '0P0004400000000000044000000D000000000000D000S000',
                '111111111111111111111111111111111111111111111111',
            ],
            bgColor: '#0a0a0a',
        };

        levels[10] = {
            name: 'CITY 2-5', subtitle: 'Boss',
            width: 30, isBossLevel: true, map: [
                '000000000000000000000000000000',
                '000000000000F00000000000000000',
                '000000000000000000000000000000',
                '000000000000000000000000000000',
                '000033333333333333333300000000',
                '000000000000000000000000000000',
                '000000000000000000000000000000',
                '000000000000000000000000000000',
                '003300000000000000000000330000',
                '000000000000000000000000000000',
                '000000000000000000000000000000',
                '000000000000000000000000000000',
                '000000330000H00000330D00000000',
                '000000000000000000000000000000',
                '000000000000000000000000000000',
                '000000000000000000000000000000',
                '003300000000000000000000330000',
                '000000000000000000000000000000',
                '000000000000000000000000000000',
                '000000330000000000330D00000000',
                '000000000000000000000000000000',
                '0000000000P0000000000000000000',
                '333333333333333333333333333333',
            ],
            bgColor: '#1a0a0a',
        };

        // ===== WORLD 3: THE ISLAND (levels 11-15) =====
        for (let i = 11; i <= 15; i++) {
            levels[i] = this.generateLevel(i, 'island');
        }

        // ===== WORLD 4: THE FACTORY (levels 16-20) =====
        for (let i = 16; i <= 20; i++) {
            levels[i] = this.generateLevel(i, 'factory');
        }

        return levels[levelNum] || levels[1];
    }

    generateLevel(num, theme) {
        const w = 45 + Math.min(num - 10, 10);
        const h = 16;
        const map = [];

        for (let y = 0; y < h; y++) {
            map.push('0'.repeat(w));
        }

        // Bottom floor
        const floorTile = theme === 'factory' ? '3' : '1';
        map[h - 1] = floorTile.repeat(w);

        // Generate platforms
        const platformCount = 10 + Math.floor(num / 2);
        for (let i = 0; i < platformCount; i++) {
            const px = Phaser.Math.Between(5, w - 10);
            const py = Phaser.Math.Between(4, h - 3);
            const pLen = Phaser.Math.Between(3, 6);
            let row = map[py].split('');
            for (let x = px; x < Math.min(px + pLen, w); x++) {
                row[x] = i % 3 === 0 ? '4' : floorTile; // Mix one-way and solid
            }
            map[py] = row.join('');
        }

        // Add ladders at random positions
        const ladderCount = 3 + Math.floor(num / 3);
        for (let i = 0; i < ladderCount; i++) {
            const lx = Phaser.Math.Between(5, w - 5);
            const ly = Phaser.Math.Between(6, h - 3);
            for (let y = ly; y < Math.min(ly + 3, h - 1); y++) {
                let row = map[y].split('');
                row[lx] = '2';
                map[y] = row.join('');
            }
        }

        // Enemies
        const enemyCount = 3 + Math.floor(num / 2);
        for (let i = 0; i < enemyCount; i++) {
            const ex = Phaser.Math.Between(10, w - 5);
            const ey = Phaser.Math.Between(3, h - 3);
            let row = map[ey].split('');
            if (row[ex] === '0') {
                row[ex] = i % 2 === 0 ? 'B' : 'S';
                map[ey] = row.join('');
            }
        }

        // Collectibles
        const dubCount = 4 + Math.floor(num / 3);
        for (let i = 0; i < dubCount; i++) {
            const dx = Phaser.Math.Between(8, w - 5);
            const dy = Phaser.Math.Between(2, h - 3);
            let row = map[dy].split('');
            if (row[dx] === '0') {
                row[dx] = 'D';
                map[dy] = row.join('');
            }
        }

        // Checkpoints
        let cpRow = map[h - 3].split('');
        const cpx = Math.floor(w / 2);
        if (cpRow[cpx] === '0') { cpRow[cpx] = 'C'; map[h - 3] = cpRow.join(''); }

        // Health
        let hRow = map[h - 3].split('');
        const hx = Math.floor(w * 0.7);
        if (hRow[hx] === '0') { hRow[hx] = 'H'; map[h - 3] = hRow.join(''); }

        // Spawn
        let sRow = map[h - 2].split('');
        sRow[2] = 'P';
        map[h - 2] = sRow.join('');

        // Exit
        let eRow = map[4].split('');
        eRow[w - 5] = 'E';
        map[4] = eRow.join('');

        const isBoss = num % 5 === 0;
        if (isBoss) {
            let bRow = map[2].split('');
            bRow[Math.floor(w / 2)] = 'F';
            map[2] = bRow.join('');
        }

        const names = {
            island: [`ISLAND 3-${num - 10}`, 'Jungle'],
            factory: [`FACTORY 4-${num - 15}`, 'HQ'],
        };

        return {
            name: names[theme] ? names[theme][0] : `LEVEL ${num}`,
            subtitle: names[theme] ? names[theme][1] : '',
            width: w, map,
            bgColor: theme === 'factory' ? '#0a0a0a' : '#0a2a0a',
            isBossLevel: isBoss,
        };
    }

    loadLevel(levelNum) {
        this.currentLevel = levelNum;
        const data = this.getLevelData(levelNum);
        this.clearLevel();
        this.scene.cameras.main.setBackgroundColor(data.bgColor);
        // Store map data for getTileAt lookups
        this.mapData = data.map;
        this.mapWidth = data.width;
        this.parseTilemap(data);
        return data;
    }

    /**
     * Check if there's a solid tile at the given world coordinates.
     * Used by enemies for edge detection.
     */
    getTileAt(worldX, worldY) {
        const ts = this.tileSize;
        const tileX = Math.floor(worldX / ts);
        const tileY = Math.floor(worldY / ts);
        if (!this.mapData || tileY < 0 || tileY >= this.mapData.length ||
            tileX < 0 || tileX >= this.mapData[0].length) {
            return null; // Out of bounds = no tile
        }
        const char = this.mapData[tileY][tileX];
        // Solid tiles: '1' girder, '3' brick, '4' one-way platform
        const solidTiles = ['1', '3', '4'];
        return solidTiles.includes(char) ? char : null;
    }

    parseTilemap(data) {
        const { map, width } = data;
        const ts = this.tileSize;
        this.offsetX = 0;
        this.offsetY = 0;

        for (let y = 0; y < map.length; y++) {
            const row = map[y];
            for (let x = 0; x < row.length; x++) {
                const char = row[x];
                const worldX = this.offsetX + x * ts + ts / 2;
                const worldY = this.offsetY + y * ts + ts / 2;

                switch (char) {
                    case '1': this.createGirder(worldX, worldY); break;
                    case '2': this.createLadder(worldX, worldY); break;
                    case '3': this.createBrick(worldX, worldY); break;
                    case '4': this.createOneWay(worldX, worldY); break;
                    case 'P': this.spawnPoint = { x: worldX, y: worldY }; break;
                    case 'E':
                        this.exitPoint = { x: worldX, y: worldY };
                        this.createExit(worldX, worldY);
                        break;
                    case 'D': this.createVinyl(worldX, worldY); break;
                    case 'H': this.createHealthPickup(worldX, worldY); break;
                    case 'B': this.createBadVibes(worldX, worldY); break;
                    case 'S': this.createStaticEnemy(worldX, worldY); break;
                    case 'F': this.bossSpawn = { x: worldX, y: worldY }; break;
                    case 'M': this.createMovingPlatform(worldX, worldY, 'horizontal'); break;
                    case 'K': this.createBarrelLauncherTile(worldX, worldY); break;
                    case 'C': this.createCheckpoint(worldX, worldY); break;
                }
            }
        }

        const worldWidth = data.width * ts;
        const worldHeight = map.length * ts;
        this.scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        return { worldWidth, worldHeight };
    }

    createGirder(x, y) {
        const girder = this.scene.physics.add.staticSprite(x, y, 'tile_girder');
        girder.setDepth(10);
        girder.refreshBody();
        this.tiles.push(girder);
        if (this.scene.platforms) this.scene.platforms.add(girder);
    }

    createLadder(x, y) {
        const ladder = this.scene.physics.add.staticSprite(x, y, 'tile_ladder');
        ladder.setDepth(5);
        ladder.refreshBody();
        ladder.body.setSize(20, 32);
        this.ladders.push(ladder);
        if (this.scene.ladderGroup) this.scene.ladderGroup.add(ladder);
    }

    createBrick(x, y) {
        const brick = this.scene.physics.add.staticSprite(x, y, 'tile_brick');
        brick.setDepth(10);
        brick.refreshBody();
        this.tiles.push(brick);
        if (this.scene.platforms) this.scene.platforms.add(brick);
    }

    createOneWay(x, y) {
        const plat = this.scene.physics.add.staticSprite(x, y, 'tile_oneway');
        plat.setDepth(10);
        plat.body.setSize(32, 8);
        plat.body.setOffset(0, 0);
        plat.refreshBody();
        this.tiles.push(plat);
        if (this.scene.oneWayPlatforms) this.scene.oneWayPlatforms.add(plat);
    }

    createExit(x, y) {
        const exit = this.scene.add.rectangle(x, y, 32, 32, 0xFFD700, 0.3);
        exit.setDepth(15);
        exit.setStrokeStyle(2, 0xFFD700);
        this.scene.tweens.add({
            targets: exit, alpha: 0.1, scaleX: 1.2, scaleY: 1.2,
            duration: 800, yoyo: true, repeat: -1,
        });

        const exitZone = this.scene.physics.add.staticSprite(x, y, 'tile_empty');
        exitZone.setAlpha(0).setDepth(15);
        exitZone.body.setSize(32, 32);
        exitZone.refreshBody();

        this.scene.exitZone = exitZone;
        this.tiles.push(exit);
        this.tiles.push(exitZone);
    }

    createVinyl(x, y) {
        const plate = this.scene.physics.add.sprite(x, y, 'collectible_vinyl');
        plate.setDepth(20);
        plate.body.allowGravity = false;
        plate.body.immovable = true;
        this.scene.tweens.add({
            targets: plate, angle: 360, duration: 3000, repeat: -1,
        });
        this.scene.tweens.add({
            targets: plate, y: y - 5, duration: 1000,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
        this.collectibles.push(plate);
        if (this.scene.vinylsGroup) this.scene.vinylsGroup.add(plate);
    }

    createHealthPickup(x, y) {
        const hp = this.scene.physics.add.sprite(x, y, 'collectible_health');
        hp.setDepth(20);
        hp.body.allowGravity = false;
        hp.body.immovable = true;
        this.scene.tweens.add({
            targets: hp, y: y - 5, duration: 800,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
        this.collectibles.push(hp);
        if (this.scene.healthPickupsGroup) this.scene.healthPickupsGroup.add(hp);
    }

    createBadVibes(x, y) {
        const enemy = new BadVibes(this.scene, x, y);
        this.enemies.push(enemy);
        if (this.scene.enemySprites) this.scene.enemySprites.add(enemy.sprite);
    }

    createStaticEnemy(x, y) {
        const enemy = new StaticEnemy(this.scene, x, y);
        this.enemies.push(enemy);
        if (this.scene.enemySprites) this.scene.enemySprites.add(enemy.sprite);
    }

    createMovingPlatform(x, y, type) {
        const mp = new MovingPlatform(this.scene, x, y, type);
        this.movingPlatforms.push(mp);
        if (this.scene.movingPlatformSprites) {
            this.scene.movingPlatformSprites.add(mp.sprite);
        }
    }

    createBarrelLauncherTile(x, y) {
        const bl = new BarrelLauncher(this.scene, x, y, -45, 500);
        this.barrelLaunchers.push(bl);
    }

    createCheckpoint(x, y) {
        const cp = new Checkpoint(this.scene, x, y);
        this.checkpoints.push(cp);
        // NOTE: Overlap with player set up in GameScene.create() AFTER player is created
    }

    clearLevel() {
        this.tiles.forEach(t => { if (t && t.destroy) t.destroy(); });
        this.ladders.forEach(l => { if (l && l.destroy) l.destroy(); });
        this.enemies.forEach(e => { if (e && e.destroy) e.destroy(); });
        this.collectibles.forEach(c => { if (c && c.destroy) c.destroy(); });
        this.movingPlatforms.forEach(mp => { if (mp && mp.destroy) mp.destroy(); });
        this.barrelLaunchers.forEach(bl => { if (bl && bl.destroy) bl.destroy(); });
        this.checkpoints.forEach(cp => { if (cp && cp.destroy) cp.destroy(); });

        this.tiles = [];
        this.ladders = [];
        this.enemies = [];
        this.collectibles = [];
        this.movingPlatforms = [];
        this.barrelLaunchers = [];
        this.checkpoints = [];
        this.bossSpawn = null;
    }

    updateEnemies(time, delta) {
        this.enemies.forEach(enemy => {
            if (enemy.isAlive && enemy.update) enemy.update(time, delta);
        });
    }

    static getLevelNames() {
        const names = [];
        const worlds = [
            { prefix: 'Coast', count: 5 },
            { prefix: 'City', count: 5 },
            { prefix: 'Island', count: 5 },
            { prefix: 'Factory', count: 5 },
        ];
        let num = 1;
        worlds.forEach((w, wi) => {
            for (let i = 1; i <= w.count; i++) {
                names.push({
                    num, name: `${w.prefix} ${wi + 1}-${i}`,
                    location: w.prefix,
                });
                num++;
            }
        });
        return names;
    }
}

window.LevelManager = LevelManager;
