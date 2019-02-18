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
**/
export interface IItem {
    id: number,
    prefix: number,
    name: string,
    sprite: string,
    /** тип */
    type: string,
    /** слот в кукле (меню) персонажа */ 
    slot: number,
    rank: number,
    hp_per_use: number,
    mp_per_use: number,
    /** требуемый титул (воинский уровень) */
    req_title: number,
    /**  требуемая степень (магический уровень) */
    req_degree: number,
    /**  требуемая карма */
    req_karma: number,
    /**  требуемая специальность */
    req_spec: number,
    req_spec_lvl: number,
    /** требуемые характеристики */
    req_stats: IStats,
    /** рейтинг физической атаки */
    fa_atk: number,
    /** рейтинг магической атаки */
    ma_atk: number,
    mam_atk: number,
    /** разброс урона */
    dmg_spread: number,
    /** дает hp при использовании */
    hp_give: number,
    /** дает mp при использовании */
    mp_give: number,
    /** дает hp при использовании за тик (2 минуты) */
    hp_2m_give: number,
    /** дает mp  при использовании за тик (2 минуты) */
    mp_2m_give: number,
    /** физическая защита */
    f_def: number,
    /** магическая защита */
    m_def: number,
    /** бонус (не всегда положительный) к характеристикам */
    bonus_stats: IStats,
    /** бонус к максимальному hp */
    hp_bonus: number,
    /** бонус к максимальному mp */
    mp_bonus: number,
    /** бонус к физической атаке */
    fa_bonus: number,
    /** бонус к магической атаке */
    ma_bonus: number,
    /** задержка после использования в секундах */
    delay_sec: number,
    /** перезарядка способности */
    cooldown: number,
    /** дистанция применения */
    distance: number,
    /** дистанция разброса (aoe) */
    distance_aoe: number,
    /** иконка мутатора */
    mutator_icon: string,
    /** длительность действия мутатора */
    mutator_len: number,
    /** описание действия мутатора */
    mutator_desc: string 
}

export interface IStats {
    /** сила */
    str: number,
    /** ловкость */
    agi: number,
    /** меткость */
    dex: number,
    /** выносливость */
    vit: number,
    /** магия земли */
    earth: number,
    /** магия воздуха */
    air: number,
    /** магия воды */
    water: number,
    /** магия огня */
    fire: number 
}

export interface IActorsListItem {
    id: number,
    dmg?: number,
    title?: string,
    isPlayer: boolean,
    spriteOffset: number
}
