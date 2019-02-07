import { GameScene } from "../scenes/gameScene";
import { IActorsListItem, IPosition } from "../interfaces";
import Actor from "../components/actor";
import Helpers from "../helpers";
import { Player } from "../components/player";
import { Enemy } from "../components/enemy";

export class ActorsManager {
    private oGameScene  : GameScene;
    private aValidPos   : IPosition[];
    private aList       : IActorsListItem[];    

    constructor(gameScene: GameScene) {
        this.oGameScene = gameScene;
        this.aList = [
            {id: 1, dmg: 10, title: "Wizard", isPlayer: false}
        ];
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

    create(id: number, pos?: IPosition): Actor {
        let data: IActorsListItem;
        let actor: Actor;

        if (id == 0) {
            data = {id: id, isPlayer: true};
        } else {
            data = this.aList.find((e) => {
                if (e[0] == id || e.id == id) {
                    return true;
                }
                return false;
            })
        }

        if (data) {
            let _pos: IPosition;
            if (!pos) {
                while (this.aValidPos.length != this.oGameScene.aActorsList.length && !pos) {
                    _pos = this.aValidPos[Helpers.random(this.aValidPos.length)];
                    if (!this.oGameScene.oActorsMap.hasOwnProperty(_pos.x + "." + _pos.y)) {
                        pos = _pos;
                    }
                }
            } else {
                _pos = pos
            }
        }

        if (!pos) return;

        if (data.isPlayer) {
            actor = new Player(this.oGameScene, data, pos);
        } else {
            actor = new Enemy(this.oGameScene, data, pos);
        }

        if (!actor.bIsPlayer) {
            this.oGameScene.aActorsList.push(actor);
            this.oGameScene.oActorsMap[pos.x + "." + pos.y] = actor;
        }

        return actor;
    }
}