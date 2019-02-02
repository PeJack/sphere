import Inventory from "../components/inventory";
import Actor from "../components/actor";
import { mapsManager } from "../systems/mapsManager";
import { player } from "../components/player";

interface layers {
    effects   : Phaser.GameObjects.Group,
    items     : Phaser.GameObjects.Group,
    hud       : Phaser.GameObjects.Group,
    actors    : Phaser.GameObjects.Group,
    ground    : Phaser.Tilemaps.StaticTilemapLayer,
    decoration: Phaser.Tilemaps.StaticTilemapLayer
}

interface position {
    x : number, y : number,
    worldX : number, worldY : number
}

interface obj {
    x : number, y : number
}

export class GameScene extends Phaser.Scene {
    public oLayers          : layers;
    public bRunning         : boolean;
    public bPositionUpdated : boolean;
    public nVisionRadius    : number;
    public nTileSize        : number;
    public oItemsMap        : Map<string, Item>;
    
    public aActorsList      : Actor[];
    public oActorsMap       : Map<string, Actor>;

    public oMapsManager     : mapsManager;
    public oPlayer          : player;


    preload() : void {
    }

    posToCoord(obj : obj) {
        return {
          x: obj.x * this.nTileSize + this.nTileSize / 2,
          y: obj.y * this.nTileSize + this.nTileSize / 2
        }
    }

    public getPosition(obj): position {
      return {
        x: Math.round((obj.x - this.nTileSize / 2) / this.nTileSize),
        y: Math.round((obj.y - this.nTileSize / 2 - (obj.off || 0)) / this.nTileSize),
        worldX: (obj.worldX - this.nTileSize / 2) / this.nTileSize,
        worldY: (obj.worldY - this.nTileSize / 2 - (obj.off || 0)) / this.nTileSize
      }
    }
}