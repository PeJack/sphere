import RotFovPreciseShadowcasting from 'rot-js/lib/fov/precise-shadowcasting';
import RotMapCellular from 'rot-js/lib/map/cellular';
import Astar from 'rot-js/lib/path/astar';

import { GameScene } from '../scenes/gameScene';
import PreciseShadowcasting from 'rot-js/lib/fov/precise-shadowcasting';
import Actor from './actor';
import { IPath } from '../interfaces';

interface ITile extends Phaser.Tilemaps.Tile {
    isExplored?: boolean
}

export class Map {
    private oGameScene : GameScene;
    private oRotmap    : RotMapCellular;
    private oTilemap   : Phaser.Tilemaps.Tilemap;
    private nCols      : number;
    private nRows      : number;
    public oTiles      : number[][];
    private oFov       : RotFovPreciseShadowcasting;

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
        let self = this;
    }

    lightBlockCb(x: number, y: number) : boolean {
        x = Math.round(x);
        y = Math.round(y);

        return typeof this.oTiles[x] === 'undefined' ||
            typeof this.oTiles[x][y] === 'undefined' ||
            this.oTiles[x][y] === 0;        
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

    }

    resetLight() : void {
        let tile: ITile;
        let x: number, y: number;

        for (x = 0; x < this.nCols; x++) {
            for (y = 0; y < this.nRows; y++) {
                tile = this.oTilemap.getTileAt(x, y, false, this.oTilemap.layers[0]);

                if (tile) {
                    if (tile.isExplored) {
                        tile.alpha = 0.1;
                    } else {
                        tile.alpha = 0;
                        tile.visible = false;
                    }
                }

                tile = this.oTilemap.getTileAt(x, y, false, this.oTilemap.layers[1]);
                
                if (tile) {
                    if (tile.isExplored) {
                        tile.alpha = 0.1;
                    } else {
                        tile.alpha = 0;
                        tile.visible = false;
                    }
                }

                this.oGameScene.aActorsList.forEach(actor => {
                    if (actor.oPosition.x == x && actor.oPosition.y == y) {
                        actor.oSprite.alpha = 0;
                        actor.bVisibleForPlayer = false;
                    }
                });

                if (this.oGameScene.oItemsMap.has(x + "." + y)) {
                    this.oGameScene.oItemsMap[x + "." + y].alpha = 0;
                }
            }
        }

    }

    computeLight() : void {
        this.resetLight();
        const self = this;

        this.oGameScene.oPlayer.oSprite.alpha = 1;

        this.oFov.compute(this.oGameScene.oPlayer.oPosition.x, this.oGameScene.oPlayer.oPosition.y, 10, function (x, y, r, visibility) {
            let tile: ITile = self.oTilemap.getTileAt(x, y, false, self.oTilemap.layers[0]);

            if (tile) {
                tile.alpha = visibility;
                tile.isExplored = true;
            };

            tile = self.oTilemap.getTileAt(x, y, false, self.oTilemap.layers[1]);
            if (tile) {
                tile.alpha = visibility;
                tile.isExplored = true;
            };

            self.oGameScene.aActorsList.forEach(function(actor) {
                if (actor.oPosition.x == x && actor.oPosition.y == y) {
                    actor.oSprite.alpha = visibility;
                    actor.bVisibleForPlayer = true;
                }
            });

            if (self.oGameScene.oItemsMap.has(x + "." + y)) {
                self.oGameScene.oItemsMap[x + "." + y].alpha = visibility;
            };
        });
    }

    public computeVisibilityBetween(actor1: Actor, actor2: Actor) : boolean {
        const self = this;
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
}