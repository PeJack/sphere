import { IPoint } from "./interfaces";

class Helpers {
  private oSpriteOffset : object;
  private oDirection    : object;

  constructor() {
      this.oSpriteOffset = {
          strike1: 360,
          strike2: 362,
          strike3: 364,
          accelerate: 366,
          blueBlast: 369,
          purpleBlast: 373,
          acceleration: 377,
          superCharged: 378,
          alert: 379,
          callHelp: 380,
          xpBubble: 381,
          sleep: 382,
          immune: 383,
          magicMissile: 390,
          lightningBolt: 398,
          smallSparks: 400,
          sparks: 404,
          fireBall: 408,
          iceBall: 420,
          normalArrow: 428,
          arrowHit: 432,
          fire: 0,
          ice: 2,
          shield: 4,
          ice2: 6,
          poof: 8,
          explosionPoof: 10,
          orangePoof: 12,
          greyPoof: 14,
          superCharge: 16,
          iceBlock: 20,
          fireBlock: 22,
          explodingStone: 24,
          crossCut: 28,
          splode: 30,
          blueBall: 32,
          blueSparkle: 36
      };

      this.oDirection = {
          up: 0,
          down: 4,
          left: 6,        
          right: 2
      };

  }

  random (max: number, min?: number): number {
      min = min || 0;
      return Math.floor(Math.random() * (max - min) + min);
  }

  pointInCircle (x: number, y: number, cx: number, cy: number, radius: number): boolean {
      let distancesquared = (x - cx) * (x - cx) + (y - cy) * (y - cy);
      return distancesquared <= radius * radius;
  }

  lerp(start: number, end: number, t: number): number {
      return start + t * (end-start);
  }

  lerpPoint(p0: IPoint, p1: IPoint, t: number): IPoint {
      return <IPoint>{
          x: this.lerp(p0.x, p1.x, t),
          y: this.lerp(p0.y, p1.y, t)
    }
  }

  find(array: any[], key: any, value: any): boolean {
      return array.find(function(arr) {
          if (arr[key] == value) {
              return true; 
          }
      })
  }

  romanize (num: number): string {
      if (!+num)
          return;
      let digits = String(+num).split(""),
          key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
                 "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
                 "","I","II","III","IV","V","VI","VII","VIII","IX"],
          roman = "",
          i = 3;
      while (i--)
          roman = (key[+digits.pop() + (i * 10)] || "") + roman;
          
      return Array(+digits.join("") + 1).join("M") + roman;
  }
}

export default new Helpers;