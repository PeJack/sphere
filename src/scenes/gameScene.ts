
import Inventory from "../components/inventory";
import Actor from "../components/actor";
import { MapsManager } from "../systems/mapsManager";
import { Player } from "../components/player";
import Item from "../components/item";
import { IPosition, IGameObject, IPath } from "../interfaces";
import { ButtonHandler } from "../systems/buttonHandler";
import { EffectsManager } from "../systems/effectsManager";

interface layers {
    effects   : Phaser.GameObjects.Group,
    items     : Phaser.GameObjects.Group,
    hud       : Phaser.GameObjects.Group,
    actors    : Phaser.GameObjects.Group,
    ground    : Phaser.Tilemaps.StaticTilemapLayer,
    decoration: Phaser.Tilemaps.StaticTilemapLayer
}

export class GameScene extends Phaser.Scene {
    public oLayers          : layers;
    public bRunning         : boolean;
    public bPositionUpdated : boolean;
    public nVisionRadius    : number;
    public nTileSize        : number;

    public aItemsList       : Item[];
    public oItemsMap        : Map<string, Item>;
    
    public aActorsList      : Actor[];
    public oActorsMap       : Map<string, Actor>;

    public oMapsManager     : MapsManager;
    public oPlayer          : Player;
    public oButtonHandler   : ButtonHandler;
    public oEffectsManager  : EffectsManager;

    constructor() {
      super({
        key: "GameScene"
      });
    }

    preload() : void {
    }

    posToCoord(position: IPath) {
        return {
          x: position.x * this.nTileSize + this.nTileSize / 2,
          y: position.y * this.nTileSize + this.nTileSize / 2
        }
    }

    public getPosition(obj: any): IPosition {
      return {
        x: Math.round((obj.x - this.nTileSize / 2) / this.nTileSize),
        y: Math.round((obj.y - this.nTileSize / 2 - (obj.off || 0)) / this.nTileSize),
        worldX: (obj.worldX - this.nTileSize / 2) / this.nTileSize,
        worldY: (obj.worldY - this.nTileSize / 2 - (obj.off || 0)) / this.nTileSize
      }
    }
}
