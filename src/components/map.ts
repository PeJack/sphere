import RotFovPreciseShadowcasting from 'rot-js/lib/fov/precise-shadowcasting';
import RotMapCellular from 'rot-js/lib/map/cellular';
import Astar from 'rot-js/lib/path/astar';

import { GameScene } from '../scenes/gameScene';
import PreciseShadowcasting from 'rot-js/lib/fov/precise-shadowcasting';
import Actor from './actor';
import { IPath } from '../interfaces';
import { Tilemaps } from 'phaser';

interface ITile extends Phaser.Tilemaps.Tile {
    isExplored?: boolean
}

export class Map {
    public oTiles               : number[][];

    private oGameScene          : GameScene;
    private oRotmap             : RotMapCellular;
    private oTilemap            : Phaser.Tilemaps.Tilemap;
    private nCols               : number;
    private nRows               : number;
    private oFov                : RotFovPreciseShadowcasting;
    private lightBlockCb        : any;
    private aLastDrawingTiles   : ITile[];
    private bIsFirstRender      : boolean;

    constructor(
        gameScene: GameScene, rotmap: RotMapCellular, 
        tilemap: Phaser.Tilemaps.Tilemap, 
        cols: number, rows: number)
    {
        this.oGameScene = gameScene;
        this.oRotmap = rotmap;
        this.oTilemap = tilemap;
        this.nRows = rows;
        this.nCols = cols;
        this.oTiles = JSON.parse(JSON.stringify(this.oRotmap._map));
        this.bIsFirstRender = true;
        this.aLastDrawingTiles = [];

        const self = this;    

        this.lightBlockCb = function (x: number, y: number): boolean {
            x = Math.round(x);
            y = Math.round(y);
            return typeof self.oTiles[x] === 'undefined' ||
                    typeof self.oTiles[x][y] === 'undefined' ||
                    self.oTiles[x][y] === 0;
        }
    }

    exist(x: number, y: number) : string {
        return (typeof this.oRotmap._map[x] !== 'undefined' && 
            typeof this.oRotmap._map[x][y] !== 'undefined' &&
            this.oRotmap._map[x][y] === 0
            ) ? '1' : '0'
    }

    light() : void {
        this.resetLight();
        this.oFov = new PreciseShadowcasting(this.lightBlockCb);
        this.computeLight();
    }

    resetLight() : void {
        let tile: ITile;

        if (!this.bIsFirstRender) {      
            this.aLastDrawingTiles.forEach(tile => {
                if (tile.isExplored) {
                    tile.alpha = 0.1;
                } else {
                    tile.alpha = 0;
                    tile.visible = false;
                }

                this.oGameScene.aActorsList.forEach(actor => {
                    if (actor.oPosition.x == tile.x && actor.oPosition.y == tile.y) {
                        // actor.oSprite.alpha = 0;
                        actor.bVisibleForPlayer = false;
                    }
                });

                if (this.oGameScene.oItemsMap.hasOwnProperty(tile.x + "." + tile.y)) {
                    this.oGameScene.oItemsMap[tile.x + "." + tile.y].alpha = 0;
                }                
            });
        }
        
        if (this.bIsFirstRender) {
            let x: number, y: number;            
            this.bIsFirstRender = false;

            for (x = 0; x < this.nCols; x++) {
                for (y = 0; y < this.nRows; y++) {
                    tile = this.getTileAt(x, y, this.oGameScene.oLayers.ground.layer);
                
                    if (tile) {
                        if (tile.isExplored) {
                            tile.visible = true;
                            tile.alpha = 0.1;
                        } else {
                            tile.alpha = 0;
                            tile.visible = false;
                        }
                    }

                    tile = this.getTileAt(x, y, this.oGameScene.oLayers.decoration.layer);
                
                    if (tile) {
                        if (tile.isExplored) {
                            tile.visible = true;
                            tile.alpha = 0.1;
                        } else {
                            tile.alpha = 0;
                            tile.visible = false;
                        }
                    }

                    this.oGameScene.aActorsList.forEach(actor => {
                        if (actor.oPosition.x == x && actor.oPosition.y == y) {
                            // actor.oSprite.alpha = 0;
                            actor.bVisibleForPlayer = false;
                        }
                    });

                    if (this.oGameScene.oItemsMap.hasOwnProperty(x + "." + y)) {
                        this.oGameScene.oItemsMap[x + "." + y].alpha = 0;
                    }
                }
            }
        }
    }

    computeLight() : void {
        this.resetLight();
        const self = this;

        this.oGameScene.oPlayer.oSprite.alpha = 1;
        this.aLastDrawingTiles = [];

        this.oFov.compute(this.oGameScene.oPlayer.oPosition.x, this.oGameScene.oPlayer.oPosition.y, 10, function (x, y, r, visibility) {
            let tile: ITile = self.getTileAt(x, y, self.oGameScene.oLayers.ground.layer); // self.oTilemap.getTileAt(x, y, false, self.oTilemap.layers[1]);
            
            if (tile) {
                tile.visible = true;
                tile.alpha = visibility;
                tile.isExplored = true;
                self.aLastDrawingTiles.push(tile);
            };

            tile = self.getTileAt(x, y, self.oGameScene.oLayers.decoration.layer); // self.oTilemap.getTileAt(x, y, false, self.oTilemap.layers[1]);
            if (tile) {
                tile.visible = true;
                tile.alpha = visibility;
                tile.isExplored = true;
                self.aLastDrawingTiles.push(tile);   
            };

            self.oGameScene.aActorsList.forEach(function(actor) {
                if (actor.oPosition.x == x && actor.oPosition.y == y) {
                    // actor.oSprite.alpha = visibility;
                    actor.bVisibleForPlayer = true;
                }
            });

            if (self.oGameScene.oItemsMap.hasOwnProperty(x + "." + y)) {
                self.oGameScene.oItemsMap[x + "." + y].alpha = visibility;
            };
        });
    }

    public computeVisibilityBetween(actor1: Actor, actor2: Actor) : boolean {
        let visible = false;

        this.oFov.compute(actor1.oPosition.x, actor1.oPosition.y, 10, function (x, y, r, visibility) {
            if (actor2.oPosition.x == x && actor2.oPosition.y == y) {
                visible = true;
            }
        });

        return visible;
    }

    public pathFinding(actor1: Actor, actor2: Actor) : IPath[] {
        const astar: Astar = new Astar(actor2.oPosition.x, actor2.oPosition.y, this.lightBlockCb);
        let path: {x: number, y: number}[] = [];
        
        astar.compute(actor1.oPosition.x, actor1.oPosition.y, function(x, y) {
            path.push({x: x, y: y});
        });

        return path;
    }

    public getTileAt(x: number, y: number, layer: Tilemaps.LayerData): Phaser.Tilemaps.Tile {
        if (this.IsInLayerBounds(x, y, layer)) {
            const tile = layer.data[y][x] || null;

            if (tile === null || tile.index === - 1) {
                return null;
            }
            return tile;
        } else {
            return null;
        }
    }

    public getTileInTilesArray(x: number, y: number): boolean {
        if (this.oTiles[x] && this.oTiles[x][y]) {
            return true;
        } else {
            return false;
        }
    }

    private IsInLayerBounds(x: number, y: number, layer: Tilemaps.LayerData): boolean {
        return (x >= 0 && x < layer.width && y >= 0 && y < layer.height);
    }

    public destroyTile(x: number, y: number, tilemap: Tilemaps.DynamicTilemapLayer) {
        this.oTiles[x][y] = 0;
        tilemap.removeTileAt(x, y);
        if (this.oRotmap._map[x] && this.oRotmap._map[x][y]) {
            this.oRotmap._map[x][y] = 0;
        }

        this.light();
    }
}