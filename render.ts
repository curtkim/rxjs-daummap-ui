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
    const RATIO = Math.pow(2, zoom - 3);
    const UNIT = RATIO * TILE_SIZE;
    
    function map2pixelX(x: number): number {
        return (x - mapEnv.minX) / RATIO;
    };
    function map2pixelY(y: number): number {
        return WINDOW_HEIGHT - (y - mapEnv.minY) / RATIO;
    };

    const map2tileX = (x:number)=> Math.floor((x+30000) / UNIT)
    const map2tileY = (x:number)=> Math.floor((x+60000) / UNIT)
    const tile2mapX = (x:number)=> x*UNIT-30000
    const tile2mapY = (y:number)=> y*UNIT-60000
    const COL_OFFSET = map2tileX(mapEnv.minX)
    const ROW_OFFSET = map2tileY(mapEnv.minY)
    const COL_SIZE = Math.ceil(WINDOW_WIDTH / TILE_SIZE)
    const ROW_SIZE = Math.ceil(WINDOW_HEIGHT / TILE_SIZE)

    const tileLeftPx = map2pixelX(tile2mapX(COL_OFFSET));
    const tileBottomPx = map2pixelY(tile2mapY(ROW_OFFSET));

    // cache image
    for(let row = ROW_OFFSET; row <= ROW_OFFSET + ROW_SIZE; row++){
        if(!backgroundImages[row])
            backgroundImages[row] = new Array();

        for(let col = COL_OFFSET; col <= COL_OFFSET + COL_SIZE; col++){
            if(!backgroundImages[row][col]) {
                backgroundImages[row][col] = new Image();
                backgroundImages[row][col].src = `https://map2.daumcdn.net/map_2d_hd/1902usc/L${level}/${row}/${col}.png`
                console.log(`load https://map2.daumcdn.net/map_2d_hd/1902usc/L${level}/${row}/${col}.png`)
            }
        }
    }
    //console.log(zoom, RATIO, UNIT, mapEnv);
        
    ctx.save();
    ctx.scale(devicePixelRatio, devicePixelRatio);

    for(let row = ROW_OFFSET; row <= ROW_OFFSET + ROW_SIZE; row++){
        for(let col = COL_OFFSET; col <= COL_OFFSET + COL_SIZE; col++){
            const x = (col - COL_OFFSET)*TILE_SIZE+ tileLeftPx;
            const y = tileBottomPx - (row - ROW_OFFSET +1)*TILE_SIZE;
            const image = new Image();
            ctx.drawImage(backgroundImages[row][col], x, y, TILE_SIZE, TILE_SIZE);
        }
    }

    ctx.restore();
};