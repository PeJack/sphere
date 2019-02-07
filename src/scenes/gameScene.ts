
// import Inventory from "../components/inventory";
import Actor from "../components/actor";
import { MapsManager } from "../systems/mapsManager";
import { Player } from "../components/player";
import Item from "../components/item";
import { IPosition, IGameObject, IPath } from "../interfaces";
import { ButtonHandler } from "../systems/buttonHandler";
import { EffectsManager } from "../systems/effectsManager";
import { ActorsManager } from "../systems/actorsManager";
import { ItemsManager } from "../systems/itemsManager";
import { InputHandler } from "../systems/InputHandler";
import Helpers from "../helpers";

interface ILayers {
    effects   : Phaser.GameObjects.Group,
    items     : Phaser.GameObjects.Group,
    hud       : Phaser.GameObjects.Group,
    actors    : Phaser.GameObjects.Group,
    ground    : Phaser.Tilemaps.StaticTilemapLayer,
    decoration: Phaser.Tilemaps.StaticTilemapLayer
}

export class GameScene extends Phaser.Scene {
    public oLayers          : ILayers;
    public bRunning         : boolean;
    public bPositionUpdated : boolean;
    public nVisionRadius    : number;
    public nTileSize        : number;

    public aItemsList       : Item[];
    public oItemsMap        : Map<string, Item>;
    
    public aActorsList      : Actor[];
    public oActorsMap       : Map<string, Actor>;

    public oPlayer          : Player;

    public oMapsManager     : MapsManager;
    public oActorsManager   : ActorsManager;
    public oItemsManager    : ItemsManager;
    public oButtonHandler   : ButtonHandler;
    public oInputHandler    : InputHandler;
    public oEffectsManager  : EffectsManager;
    // public oInventory       : Inventory;

    constructor() {
        super({
            key: "GameScene"
        });
    }

    preload(): void {
        this.oLayers            = {} as ILayers;
        this.bRunning           = false;
        this.bPositionUpdated   = true;
        this.nVisionRadius      = 30;
        this.nTileSize          = 32;

        this.aActorsList        = [];
        this.oActorsMap         = {} as Map<string, Actor>; 
        this.aItemsList         = [];
        this.oItemsMap          = {} as Map<string, Item>;
    }

    create(): void {
        this.oMapsManager       = new MapsManager(this);
        this.oActorsManager     = new ActorsManager(this);
        this.oItemsManager      = new ItemsManager(this);
        this.oButtonHandler     = new ButtonHandler(this);
        this.oInputHandler      = new InputHandler(this);

        this.oMapsManager.init();

        this.oLayers.effects    = this.add.group();
        this.oLayers.items      = this.add.group();
        this.oLayers.hud        = this.add.group();
        this.oLayers.actors     = this.add.group();

        this.oEffectsManager    = new EffectsManager(this);
        
        this.oActorsManager.init();
        this.oItemsManager.init();
        
        this.run();
    }

    run(): void {
        this.oInputHandler.start();

        for (let i = 0; i < 50; i++) {
            this.oItemsManager.create(Helpers.random(201, 212));
        }

        this.oPlayer = this.oActorsManager.create(0);

        // for (let i = 1; i < 10; i++) {
        //     this.oActorsManager.create(Helpers.random(1,2));
        // }

        this.sys.cameras.main.startFollow(this.oPlayer.oSprite);

        this.oMapsManager.oMap.light();
    }

    update(): void {
        this.oInputHandler.update();

        if (this.bPositionUpdated) {
            this.bPositionUpdated = false;
            this.oMapsManager.oMap.computeLight();
        }

        this.aActorsList.forEach((actor: Actor) => {
            if (actor.constructor.name == "Enemy") {
                actor.aiAct()
            }
        })

        if (this.oPlayer.oWeapon) {
            this.oPlayer.oWeapon.update();
        }
    }

    posToCoord(position: IPath): IPosition {
        return {
            x: position.x * this.nTileSize + this.nTileSize / 2,
            y: position.y * this.nTileSize + this.nTileSize / 2
        }
    }

    public getPosition(obj: any): IPosition {
        return {
            x: Math.round((obj.x - this.nTileSize / 2) / this.nTileSize),
            y: Math.round((obj.y - this.nTileSize / 2) / this.nTileSize),
            worldX: (obj.worldX - this.nTileSize / 2) / this.nTileSize,
            worldY: (obj.worldY - this.nTileSize / 2) / this.nTileSize
      }
    }
}