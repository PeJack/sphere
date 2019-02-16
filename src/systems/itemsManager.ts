import { GameScene } from "../scenes/gameScene";
import { IItem, IPosition } from "../interfaces";
import Actor from "../components/actor";
import Item from "../components/item";
import Helpers from "../helpers";

export class ItemsManager {
    private oGameScene  : GameScene;
    private aList       : IItem[];
    private aValidPos   : IPosition[];

    constructor(gameScene: GameScene) {
        this.oGameScene = gameScene;
        this.aList = this.oGameScene.sys.game.cache.json.get("items_list").items;
    }

    init(): void {
        this.aValidPos = [];
        for (let x = 0; x < this.oGameScene.oMapsManager.nCols; x++) {
            for (let y = 0; y < this.oGameScene.oMapsManager.nRows; y++) {
                if (!this.oGameScene.oMapsManager.oMap.oTiles[x][y]) {
                    this.aValidPos.push({x: x, y: y});
                }
            }
        }
    }
    
    create(id: number, pos?: IPosition, actor?: Actor): Item {
        let i: IItem, data: IItem, item: Item;
        i = this.aList.find((el: IItem)=> {
            if (el.id === id) {
                return true;
            }
            return false;
        })

        if (i) {
            data = i;
            let _pos: IPosition;
            if (!pos) {
                while (this.aValidPos.length != this.oGameScene.aItemsList.length && !pos) {
                    _pos = this.aValidPos[Helpers.random(this.aValidPos.length)];
                    if (!this.oGameScene.oItemsMap.hasOwnProperty(_pos.x + "." + _pos.y)) {
                        pos = this.oGameScene.posToCoord(_pos);
                    }
                }
            } else {
                _pos = this.oGameScene.getPosition(pos);
            }

            if (!pos) return;
            
            item = new Item(this.oGameScene, data, pos, actor);
            item.oLastPos = {
                x: _pos.x, y: _pos.y
            };

            this.oGameScene.oItemsMap[_pos.x + "." + _pos.y] = item;
        }

        return item;
    }
}