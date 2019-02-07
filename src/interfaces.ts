export interface IPosition {
    x       : number;
    y       : number;
    worldX? : number;
    worldY? : number;
}

export interface IGameObject {
    x       : number;
    y       : number;
    worldX  : number;
    worldY  : number;
    off     : number;
}

export interface IPath {
    x?      : number;
    y?      : number;
    worldX? : number;
    worldY? : number;
}

export interface IPoint {
    x: number, y: number
}

export interface ISpriteOffset {
    strike1         : number;
    strike2         : number;
    strike3         : number;
    accelerate      : number;
    blueBlast       : number;
    purpleBlast     : number;
    acceleration    : number;
    superCharged    : number;
    alert           : number;
    callHelp        : number;
    xpBubble        : number;
    sleep           : number;
    immune          : number;
    magicMissile    : number;
    lightningBolt   : number;
    smallSparks     : number;
    sparks          : number;
    fireBall        : number;
    iceBall         : number;
    normalArrow     : number;
    arrowHit        : number;
    fire            : number;
    ice             : number;
    shield          : number;
    ice2            : number;
    poof            : number;
    explosionPoof   : number;
    orangePoof      : number;
    greyPoof        : number;
    superCharge     : number;
    iceBlock        : number;
    fireBlock       : number;
    explodingStone  : number;
    crossCut        : number;
    splode          : number;
    blueBall        : number;
    blueSparkle     : number;
}

/**
  * Элемент массива items.
  * @param index0 id
  * @param index1 класс
  * @param index2 человеческое название
  * @param index3 название спрайта
  * @param index4 ?
  * @param index5 уровень
  * @param ...
  * @param index18 урон
  * @param ...
  * @param index37 перезарядка
  */
export interface IItem {
    0: number,
    1: string,
    2: string,
    3: string,
    4: number,
    5: number,
    18: number,
    37: number
}

export interface IActorsListItem {
    id: number,
    dmg?: number,
    title?: string,
    isPlayer: boolean
}
