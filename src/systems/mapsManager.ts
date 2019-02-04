import RotMapCellular from 'rot-js/lib/map/cellular';
import { GameScene } from '../scenes/game-scene';
import { Map } from '../components/map';
import { IPath } from '../interfaces';

export class MapsManager {
    private oGameScene : GameScene;
    private nCols      : number;
    private nRows      : number;
    private nTilesize  : number;
    private oMapData   : RotMapCellular;
    public oMap        : Map;

    constructor(gameScene: GameScene) {
        this.oGameScene = gameScene;

        this.nCols = 50;
        this.nRows = 50;
        this.nTilesize = this.oGameScene.nTileSize;

        this.oMapData = this.generaeteMap('Map', this.oGameScene.cache, this.nRows, this.nCols, this.nTilesize, this.nTilesize);
    } 

    public init(): void {
        const map = this.oGameScene.make.tilemap({key: "Map"});
        const mapTiles = map.addTilesetImage('forest-tiles', 'forest-tiles');

        this.oGameScene.oLayers.ground = map.createStaticLayer("ground", mapTiles, 0, 0);
        this.oGameScene.oLayers.decoration = map.createStaticLayer("decoration", mapTiles, 0, 0);

        this.oMap = new Map(this.oGameScene, this.oMapData, map, this.nCols, this.nRows);      
    }

    private generaeteMap(keyName: string, 
        _cache: Phaser.Cache.CacheManager, 
        width: number, height: number, 
        tileWidth: number, tileHeight: number
    ): RotMapCellular {
        const _map = new RotMapCellular(width, height);

        let tilemap = {
            layers: 
            [
                {
                    data: new Array(width * height),
                    height: height,
                    name: 'ground',
                    opacity: 1,
                    type: 'tilelayer',
                    visible: true,
                    width: width,
                    x: 0,
                    y: 0
                },
                {
                    data: [],
                    height: height,
                    name: 'decoration',
                    opacity: 1,
                    type: 'tilelayer',
                    visible: true,
                    width: width,
                    x: 0,
                    y: 0
                }
            
            ],
            orietation: 'orthogonal',
            properties: {},
            tileheight: tileHeight,
            tilesets: 
            [
                {
                    firstgid: 1,
                    image: 'assets/sprites/foresttiles_0.png',
                    imagewidth: 160,
                    imageheight: 224,
                    margin: 0,
                    name: 'forest-tiles',
                    properties: {},
                    spacing: 0,
                    tileheight: tileHeight,
                    tilewidth: tileWidth
                }
            ],
            tilewidth: tileWidth,
            version: 1,
            height: tileHeight,
            width: tileWidth
        };

        const GROUND_TILE = 35;
        let tilepos: number;
        
        _map.create(function (x, y, content) {
            tilemap.layers[0].data[y * width + x] = (content === 1) ? 0 : GROUND_TILE;
        });

        _cache.tilemap.add(keyName, tilemap);

        let _exist = function (x: number, y: number) {
            return (
                typeof _map._map[x] !== 'undefined' &&
                typeof _map._map[x][y] !== 'undefined' &&
                _map._map[x][y] === 0
            ) ? '1' : '0';
        };

        let cbSetBackground = function (tile: number) {
            return function () {
                tilemap.layers[0].data[tilepos] = GROUND_TILE;
                tilemap.layers[1].data[tilepos] = tile;
            }
        };

        let patternArray: {regex: RegExp, cb: Function}[] = [];
        let addPattern = function (pattern: string, cb: Function) {
            patternArray.push({
                regex: new RegExp(pattern.replace(/\*/g, '[0-1]')),
                cb: cb
            });
        };

        addPattern(
            '000' + '0*0' + '*1*',
            function (tilepos: number, x: number, y: number) {
                cbSetBackground(14)();
                if (y > 0) {
                    tilemap.layers[1].data[(y - 1) * width + x] = 9;
                }
            }
        );

        addPattern(
            '000' + '0*0' + '1*1',
            function (tilepos: number, x: number, y: number) {
                cbSetBackground(14)();
                if (y > 0) {
                    tilemap.layers[1].data[(y - 1) * width + x] = 9;
                }
            }
        );

        addPattern(
            '00*' + '0*0' + '001',
            function (tilepos: number, x: number, y: number) {
                cbSetBackground(6)();
                if (y > 0) {
                    tilemap.layers[1].data[(y - 1) * width + x] = 1;
                }
            }
        );

        addPattern(
            '00*' + '0*1' + '*11',
            function (tilepos: number, x: number, y: number) {
                cbSetBackground(15)();
                if (y > 0) {
                    tilemap.layers[1].data[(y - 1) * width + x] = 10;
                }
            }
        );

        addPattern(
            '00*' + '0*1' + '101',
            function (tilepos: number, x: number, y: number) {
                cbSetBackground(15)();
                if (y > 0) {
                    tilemap.layers[1].data[(y - 1) * width + x] = 10;
                }
            }
        );

        addPattern(
            '000' + '0*0' + '100',
            function (tilepos: number, x: number, y: number) { 
                cbSetBackground(7)();
                if (y > 0) {
                    tilemap.layers[1].data[(y - 1) * width + x] = 2;
                }
            }
        );

        addPattern(
            '00*' + '0*1' + '00*', 
            cbSetBackground(10)
        );

        addPattern(
            '*1*' + '0*0' + '000',
            cbSetBackground(4)
        );

        addPattern(
            '**1' + '0*0' + '000',
            cbSetBackground(11)
        );

        addPattern(
            '111' + '0**' + '001',
            cbSetBackground(5)
        );

        addPattern(
            '*00' + '1*0' + '*00',
            cbSetBackground(8)
        );

        addPattern(
            '*00' + '**0' + '11*',
            cbSetBackground(13)
        );

        addPattern(
            '*1*' + '1*0' + '*00',
            cbSetBackground(3)
        );

        addPattern(
            '1**' + '**0' + '*00',
            cbSetBackground(12)
        );

        addPattern(
            '**1' + '0**' + '00*',
            cbSetBackground(5)
        );

        addPattern(
            '001' + '0*0' + '111',
            cbSetBackground(15)
        );

        addPattern(
            '*00' + '1*0' + '1*1',
            cbSetBackground(13)
        );

        addPattern(
            '*1*' + '***' + '*1*',
            function () {
                tilemap.layers[0].data[tilepos] = GROUND_TILE;
                let f = [18, 23, 18];
                f = f[Math.floor(Math.random() * 3)][0];
                tilemap.layers[1].data[tilepos] = f;
            }
        );

        addPattern(
            '***' + '1*1' + '***',
            function () {
                tilemap.layers[0].data[tilepos] = GROUND_TILE;
                let f = [18, 23, 18];
                f = f[Math.floor(Math.random() * 3)][0];
                tilemap.layers[1].data[tilepos] = f;
            }
        );
        
        for (let y = 0; y < _map._height; y++) {
            for (let x = 0; x < _map._width; x++) {
                tilemap.layers[1].data.push(0);
                if (_map._map[x][y] === 0) {
                    continue;
                }

                tilepos = y * width + x;

                let direction: string = 
                    _exist(x - 1, y - 1) + _exist(x, y - 1) + _exist(x + 1, y - 1) +
                    _exist(x - 1, y) + '1' + _exist(x + 1, y) +
                    _exist(x - 1, y + 1) + _exist(x, y + 1) + _exist(x + 1, y + 1);
                
                for (let i = 0, len = patternArray.length; i < len; i++) {
                    if (patternArray[i].regex.test(direction)) {
                        patternArray[i].cb(tilepos, x, y);
                        break;
                    }
                }
            }
        }

        return _map;
    };

    public isWalkable(path: IPath) : boolean {
        path.x = Math.round(path.x);
        path.y = Math.round(path.y);

        return path.x >= 0 &&
            path.x < this.nRows &&
            path.y >= 0 &&
            path.y < this.nCols &&
            this.oMap.oTiles[path.x][path.y] === 0;
    }
}