import Inventory from "../components/inventory";

interface layers {
    effects   : Phaser.GameObjects.Group,
    items     : Phaser.GameObjects.Group,
    hud       : Phaser.GameObjects.Group,
    actors    : Phaser.GameObjects.Group
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
    public oItemsMap        : object;
    
    private nTilesize : number;


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
        x: Math.round((obj.x - this.nTilesize / 2) / this.nTilesize),
        y: Math.round((obj.y - this.nTilesize / 2 - (obj.off || 0)) / this.nTilesize),
        worldX: (obj.worldX - this.nTilesize / 2) / this.nTilesize,
        worldY: (obj.worldY - this.nTilesize / 2 - (obj.off || 0)) / this.nTilesize
      }
    }
}