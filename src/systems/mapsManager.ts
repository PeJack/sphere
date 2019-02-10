import RotMapCellular from 'rot-js/lib/map/cellular';
import { GameScene } from '../scenes/gameScene';
import { Map } from '../components/map';
import { IPath } from '../interfaces';

export class MapsManager {
    private oGameScene  : GameScene;
    private nTilesize   : number;
    private oMapData    : RotMapCellular;
    private oTilemap    : Phaser.Tilemaps.Tilemap;
    public oMap         : Map;
    public nCols        : number;   
    public nRows        : number;     

    constructor(gameScene: GameScene) {
        this.oGameScene = gameScene;

        this.nCols = 50;
        this.nRows = 50;
        this.nTilesize = this.oGameScene.nTileSize;

        this.generateMap(this.nRows, this.nCols, this.nTilesize, this.nTilesize);
    } 

    public init(): void {
        this.oMap = new Map(this.oGameScene, this.oMapData, this.oTilemap, this.nCols, this.nRows);      
    }

    private generateMap(
        width: number, height: number, 
        tileWidth: number, tileHeight: number
    ) {
        this.oMapData = new RotMapCellular(width, height);

        this.oMapData.randomize(0.5);
	    for (var i=0; i<10; i++) this.oMapData.create();	

        this.oTilemap = this.oGameScene.make.tilemap({
            data: this.oMapData._map,
            tileWidth: tileWidth,
            tileHeight: tileHeight,
            width: width,
            height: height,
        });

        const mapTiles = this.oTilemap.addTilesetImage("forest-tiles", null, tileWidth, tileHeight);
        
        // @ts-ignore
        this.oGameScene.oLayers.ground = this.oTilemap.createBlankDynamicLayer("ground", mapTiles);
        // @ts-ignore
        this.oGameScene.oLayers.decoration = this.oTilemap.createBlankDynamicLayer("decoration", mapTiles);        

        const GROUND_TILE = 34;
        let tilepos: {x: number, y: number};
        

        const self = this;        
        this.oMapData.create(function (x, y, v) {
            if (v === 1) {
                // self.oGameScene.oLayers.ground.putTileAt(0, x, y);
            } else {
                self.oGameScene.oLayers.ground.putTileAt(GROUND_TILE, x, y);                    
            }
        });

        // _cache.tilemap.add(keyName, tilemap);

        const _exist = function (x: number, y: number) {
            return (
                typeof self.oMapData._map[x] !== 'undefined' &&
                typeof self.oMapData._map[x][y] !== 'undefined' &&
                self.oMapData._map[x][y] === 0
            ) ? '1' : '0';
        };

        const cbSetBackground = function (tile: number) {
            return function () {
                self.oGameScene.oLayers.ground.putTileAt(GROUND_TILE, tilepos.x, tilepos.y);
                self.oGameScene.oLayers.decoration.putTileAt(tile, tilepos.x, tilepos.y);
            }
        };

        const patternArray: {regex: RegExp, cb: Function}[] = [];
        const addPattern = function (pattern: string, cb: Function) {
            patternArray.push({
                regex: new RegExp(pattern.replace(/\*/g, '[0-1]')),
                cb: cb
            });
        };

        // Стена спереди
        addPattern(
            '000' + 
            '0*0' + 
            '*1*',
            function (x: number, y: number) {
                cbSetBackground(14)();
                if (y > 0) {
                    self.oGameScene.oLayers.decoration.putTileAt(8, x, y);
                    // tilemap.layers[1].data[(y - 1) * width + x] = 9;
                }
            }
        );

        // Стена спереди
        addPattern(
            '000' + 
            '0*0' + 
            '1*1',
            function (x: number, y: number) {
                cbSetBackground(14)();
                if (y > 0) {
                    self.oGameScene.oLayers.decoration.putTileAt(8, x, y);
                    // tilemap.layers[1].data[(y - 1) * width + x] = 9;
                }
            }
        );

        // Стена слева
        addPattern(
            '00*' + 
            '0*0' + 
            '001',
            function (x: number, y: number) {
                cbSetBackground(6)();
                if (y > 0) {
                    self.oGameScene.oLayers.decoration.putTileAt(0, x, y);
                    // tilemap.layers[1].data[(y - 1) * width + x] = 1;
                }
            }
        );

        // Правый-нижний угол стены
        addPattern(
            '00*' + 
            '0*1' + 
            '*11',
            function (x: number, y: number) {
                cbSetBackground(15)();
                if (y > 0) {
                    self.oGameScene.oLayers.decoration.putTileAt(9, x, y);
                    // tilemap.layers[1].data[(y - 1) * width + x] = 10;
                }
            }
        );
        
        // Правый-нижний угол стены
        addPattern(
            '00*' + 
            '0*1' + 
            '101',
            function (x: number, y: number) {
                cbSetBackground(15)();
                if (y > 0) {
                    self.oGameScene.oLayers.decoration.putTileAt(9, x, y);
                    // tilemap.layers[1].data[(y - 1) * width + x] = 10;
                }
            }
        );
        
        // Центр с боку от левой-нижней стены
        addPattern(
            '000' + 
            '0*0' + 
            '100',
            function (x: number, y: number) { 
                cbSetBackground(7)();
                if (y > 0) {
                    self.oGameScene.oLayers.decoration.putTileAt(1, x, y - 1);
                    // tilemap.layers[1].data[(y - 1) * width + x] = 2;
                }
            }
        );
        
        // Стена справа
        addPattern(
            '00*' + 
            '0*1' + 
            '00*', 
            cbSetBackground(9)
        );

        // Стена сверху        
        addPattern(
            '*1*' + 
            '0*0' + 
            '000',
            cbSetBackground(3)
        );

        // Левый-нижний угол стены
        addPattern(
            '**1' + 
            '0*0' + 
            '000',
            cbSetBackground(10)
        );

        // Правый-верхий угол стены
        addPattern(
            '111' + 
            '0**' + 
            '001',
            cbSetBackground(4)
        );

        // Стена слева
        addPattern(
            '*00' + 
            '1*0' + 
            '*00',
            cbSetBackground(7)
        );

        // Левый-нижний угол стены
        addPattern(
            '*00' + 
            '**0' + 
            '11*',
            cbSetBackground(12)
        );

        // Левый-верхний угол стены
        addPattern(
            '*1*' + 
            '1*0' + 
            '*00',
            cbSetBackground(2)
        );

        // Правый-нижний угол стены
        addPattern(
            '1**' + 
            '**0' + 
            '*00',
            cbSetBackground(11)
        );

        // Правый-верхний угол стены
        addPattern(
            '**1' + 
            '0**' + 
            '00*',
            cbSetBackground(4)
        );

        // Правый-нижний угол стены
        addPattern(
            '001' + 
            '0*0' + 
            '111',
            cbSetBackground(14)
        );

        // Левый-нижний угол стены
        addPattern(
            '*00' + 
            '1*0' + 
            '1*1',
            cbSetBackground(12)
        );

        // 2 Последних паттерна - декорации (пни)
        // addPattern(
        //     '*1*' + 
        //     '***' + 
        //     '*1*',
        //     function () {
        //         self.oGameScene.oLayers.ground.putTileAt(GROUND_TILE, tilepos.x, tilepos.y);
        //         // tilemap.layers[0].data[tilepos] = GROUND_TILE;
        //         let f = [17, 22, 17][Math.floor(Math.random() * 3)][0];
        //         self.oGameScene.oLayers.decoration.putTileAt(f, tilepos.x, tilepos.y);
        //         // tilemap.layers[1].data[tilepos] = f;
        //     }
        // );

        // addPattern(
        //     '***' + 
        //     '1*1' + 
        //     '***',
        //     function () {
        //         self.oGameScene.oLayers.ground.putTileAt(GROUND_TILE, tilepos.x, tilepos.y);
        //         // tilemap.layers[0].data[tilepos] = GROUND_TILE;
        //         let f = [17, 22, 17][Math.floor(Math.random() * 3)][0];
        //         self.oGameScene.oLayers.decoration.putTileAt(f, tilepos.x, tilepos.y);
        //         // tilemap.layers[1].data[tilepos] = f;
        //     }
        // );

        for (let y = 0; y < this.oMapData._height; y++) {
            for (let x = 0; x < this.oMapData._width; x++) {
                // tilemap.layers[1].data.push(0);
                if (this.oMapData._map[x][y] === 0) {
                    continue;
                }
                
                tilepos = {x: x, y: y};

                // проверка на существование соседних объектов:
				// 1. Слева-сверху;
				// 2. Сверху;
				// 3. Справа сверху;
				// 4. Слева;
				// 5. Центр (сам объект, всегда '1');				
				// 6. Справа;
				// 7. Слева-снизу;
				// 8. Снизу;
				// 9. Справа-снизу;
                let direction: string = 
                    // 1                           // 2             // 3
                    _exist(x - 1, y - 1) + _exist(x, y - 1) + _exist(x + 1, y - 1) +
                    // 4               // 5        // 6
                    _exist(x - 1, y) + '1' + _exist(x + 1, y) +
                    // 7                           // 8             // 9
                    _exist(x - 1, y + 1) + _exist(x, y + 1) + _exist(x + 1, y + 1);
                
                for (let i = 0, len = patternArray.length; i < len; i++) {
                    if (patternArray[i].regex.test(direction)) {
                        patternArray[i].cb(x, y);
                        break;
                    }
                }
            }
        }
    };

    public isWalkable(path: IPath) : boolean {
        path.x = Math.round(path.x);
        path.y = Math.round(path.y);

        return this.oMap.oTiles[path.x][path.y] === 0;
    }
}