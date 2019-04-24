import {Coordinate, Envelope} from './envelope';

const TILE_SIZE = 256;

function createEnvelope(center: Coordinate, zoom: number, windowWidth: number, windowHeight: number): Envelope {
    const ratio = Math.pow(2, zoom - 3);

    const width = windowWidth * ratio;
    const hegith = windowHeight * ratio;

    return { minX: center.x - width / 2, minY: center.y - hegith / 2, maxX: center.x + width / 2, maxY: center.y + hegith / 2 };
}

let backgroundImages = [];

export function render(center: Coordinate, zoom: number, devicePixelRatio: number, ctx: CanvasRenderingContext2D) {

    const WINDOW_WIDTH = window.innerWidth;
    const WINDOW_HEIGHT = window.innerHeight;    

    const mapEnv = createEnvelope(center, zoom, WINDOW_WIDTH, WINDOW_HEIGHT);

    const level = Math.round(zoom);
    const RATIO = Math.pow(2, zoom - 3);                             // 1px이 몇m인가?
    const TILE_MAP_UNIT = Math.pow(2, level-3) * TILE_SIZE;          // 타일의 폭은 몇m인가?
    const TILE_PIXEL_UNIT = Math.pow(2, level - zoom) * TILE_SIZE;   // 타일의 pixel상 크기
    
    function map2pixelX(x: number): number {
        return (x - mapEnv.minX) / RATIO;
    };
    function map2pixelY(y: number): number {
        return WINDOW_HEIGHT - (y - mapEnv.minY) / RATIO;
    };

    const map2tileX = (x:number)=> Math.floor((x+30000) / TILE_MAP_UNIT)
    const map2tileY = (x:number)=> Math.floor((x+60000) / TILE_MAP_UNIT)
    const tile2mapX = (x:number)=> x*TILE_MAP_UNIT-30000
    const tile2mapY = (y:number)=> y*TILE_MAP_UNIT-60000

    const tileEnv : Envelope = {
        minX: map2tileX(mapEnv.minX),
        minY: map2tileY(mapEnv.minY),
        maxX: map2tileX(mapEnv.maxX),
        maxY: map2tileY(mapEnv.maxY),
    };

    const tileLeftPx = map2pixelX(tile2mapX(tileEnv.minX));
    const tileBottomPx = map2pixelY(tile2mapY(tileEnv.minY));

    // cache image
    for(let row = tileEnv.minY; row <= tileEnv.maxY; row++){
        if(!backgroundImages[row])
            backgroundImages[row] = new Array();

        for(let col = tileEnv.minX; col <= tileEnv.maxX; col++){
            if(!backgroundImages[row][col]) {
                backgroundImages[row][col] = new Image();
                backgroundImages[row][col].src = `https://map2.daumcdn.net/map_2d_hd/1902usc/L${level}/${row}/${col}.png`
                //console.log(`load https://map2.daumcdn.net/map_2d_hd/1902usc/L${level}/${row}/${col}.png`)
            }
        }
    }
    console.log(`zoom=${zoom}, level=${level}, ratio=${RATIO}, mapUnit=${TILE_MAP_UNIT}, pixelUnit=${TILE_PIXEL_UNIT}, mapEnv=${JSON.stringify(mapEnv)}, tileEnv=${JSON.stringify(tileEnv)}`);
        
    ctx.save();
    ctx.scale(devicePixelRatio, devicePixelRatio);

    for(let row = tileEnv.minY; row <= tileEnv.maxY; row++){
        for(let col = tileEnv.minX; col <= tileEnv.maxX; col++){
            const x = (col - tileEnv.minX)*TILE_PIXEL_UNIT+ tileLeftPx;
            const y = tileBottomPx - (row - tileEnv.minY +1)*TILE_PIXEL_UNIT;
            const image = new Image();
            ctx.drawImage(backgroundImages[row][col], x, y, TILE_PIXEL_UNIT, TILE_PIXEL_UNIT);
        }
    }

    ctx.restore();
};