import {Coordinate, Envelope} from './envelope';

const TILE_SIZE = 256;

function createEnvelope(center: Coordinate, zoom: number, windowWidth: number, windowHeight: number): Envelope {
    const ratio = Math.pow(2, zoom - 3);

    const width = windowWidth * ratio;
    const hegith = windowHeight * ratio;

    return { minX: center.x - width / 2, minY: center.y - hegith / 2, maxX: center.x + width / 2, maxY: center.y + hegith / 2 };
}

const backgroundImages = [];

export class Map {
    
    center: Coordinate;
    zoom: number;
    ctx: CanvasRenderingContext2D;
    devicePixelRatio: number;

    mapEnv: Envelope;

    constructor(center: Coordinate, zoom: number, devicePixelRatio: number, ctx: CanvasRenderingContext2D) {
        this.center = center;
        this.zoom = zoom;
        this.devicePixelRatio = devicePixelRatio;
        this.ctx = ctx;     
        
        this._updateMapEnv();
    }

    setCenter(pt : Coordinate) {
        this.center = pt;
        this._updateMapEnv();
    };
    setZoom(zoom: number){
        this.zoom = zoom;
        this._updateMapEnv();
    }
    _updateMapEnv() {
        this.mapEnv = createEnvelope(this.center, this.zoom, this.windowWidth(), this.windowHeight());
    }

    // 1px이 몇m인가?
    ratio(): number {
        return Math.pow(2, this.zoom - 3);
    }
    windowWidth(): number {
        return this.ctx.canvas.clientWidth;
    }
    windowHeight(): number {
        return this.ctx.canvas.clientHeight;
    }
    map2pixelX(x: number): number {
        return (x - this.mapEnv.minX) / this.ratio();
    };
    map2pixelY(y: number): number {
        return this.windowHeight() - (y - this.mapEnv.minY) / this.ratio();
    };

    drawBackground() {
        const windowWidth = this.ctx.canvas.clientWidth;
        const windowHeight = this.ctx.canvas.clientHeight;
    
        const level = Math.round(this.zoom);
        const tileMapUnit = Math.pow(2, level-3) * TILE_SIZE;          // 타일의 폭은 몇m인가?
        const tilePixelUnit = Math.pow(2, level - this.zoom) * TILE_SIZE;   // 타일의 pixel상 크기
        
        const map2tileX = (x:number)=> Math.floor((x+30000) / tileMapUnit)
        const map2tileY = (x:number)=> Math.floor((x+60000) / tileMapUnit)
        const tile2mapX = (x:number)=> x*tileMapUnit-30000
        const tile2mapY = (y:number)=> y*tileMapUnit-60000
    
        const tileEnv : Envelope = {
            minX: map2tileX(this.mapEnv.minX),
            minY: map2tileY(this.mapEnv.minY),
            maxX: map2tileX(this.mapEnv.maxX),
            maxY: map2tileY(this.mapEnv.maxY),
        };
    
        const tileLeftPx = this.map2pixelX(tile2mapX(tileEnv.minX));
        const tileBottomPx = this.map2pixelY(tile2mapY(tileEnv.minY));
    
        // cache image
        for(let row = tileEnv.minY; row <= tileEnv.maxY; row++){
            if(!backgroundImages[row])
                backgroundImages[row] = new Array();
    
            for(let col = tileEnv.minX; col <= tileEnv.maxX; col++){
                if(!backgroundImages[row][col]) {
                    backgroundImages[row][col] = new Image();
                    const idx = col % 4;
                    backgroundImages[row][col].src = `https://map${idx}.daumcdn.net/map_2d_hd/1902usc/L${level}/${row}/${col}.png`
                }
            }
        }
        // console.log(`zoom=${zoom}, level=${level}, devicePixelRatio=${devicePixelRatio}, ratio=${RATIO}, mapUnit=${TILE_MAP_UNIT}, pixelUnit=${TILE_PIXEL_UNIT}, 
        //     mapEnv=${JSON.stringify(mapEnv)}, tileEnv=${JSON.stringify(tileEnv)}`);
            
        //this.ctx.save();
        //this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    
        for(let row = tileEnv.minY; row <= tileEnv.maxY; row++){
            for(let col = tileEnv.minX; col <= tileEnv.maxX; col++){
                const x = (col - tileEnv.minX)*tilePixelUnit+ tileLeftPx;
                const y = tileBottomPx - (row - tileEnv.minY +1)*tilePixelUnit;
                const image = new Image();
                this.ctx.drawImage(backgroundImages[row][col], x, y, tilePixelUnit, tilePixelUnit);
            }
        }
    
        //this.ctx.restore();        
    }
};
