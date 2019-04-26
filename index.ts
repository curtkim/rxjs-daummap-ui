import { fromEvent, merge } from 'rxjs';
import {map, scan, tap, pluck, filter} from 'rxjs/operators';
import {createMouseDragObserable} from './interaction';
import {Coordinate, Envelope} from './envelope';
import {Map} from './map';

function render(center: Coordinate, zoom: number, devicePixelRatio: number, ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const map = new Map(center, zoom, devicePixelRatio, ctx);
    map.drawBackground();

    ctx.restore();
}

function getCanvas(w: number, h: number, devicePixelRatio: number) {
    const c = document.createElement('canvas')
    c.width = w * devicePixelRatio;
    c.height = h * devicePixelRatio;
    c.style.width = w+"px";
    c.style.height = h+"px";    
    document.body.appendChild(c);
    return c;
}
const devicePixelRatio = window.devicePixelRatio || 1;
const canvas = getCanvas(window.innerWidth, window.innerHeight, devicePixelRatio);
const ctx = canvas.getContext('2d');

const mousedrag$ = createMouseDragObserable(canvas);

const zoom$ = fromEvent(document, 'keyup').pipe(
    pluck('code'),
    map(key => {
        switch(key) {
            case 'Equal':
                return {zoom:-1};
            case 'Minus':
                return {zoom:1};
            default:
                return undefined;
        }
    }),
    filter(delta => delta != undefined)
);

const wheel$ = fromEvent(document, 'wheel').pipe(
    tap((wheelEvent : WheelEvent) => {wheelEvent.stopImmediatePropagation()}),
    map((wheelEvent : WheelEvent) => {return {dz: wheelEvent.deltaY*0.05};})
);

function applyDelta([center, zoom], delta: any) {
    const dx = delta.dx || 0;
    const dy = delta.dy || 0;
    const dz = delta.dz || 0;
    const ratio = Math.pow(2, zoom - 3);
    let newZoom = zoom + dz;
    if( delta.zoom)
        newZoom = Math.round(newZoom + delta.zoom);
    return [{x: center.x - dx * ratio, y: center.y + dy * ratio}, newZoom];
}

merge(mousedrag$, zoom$, wheel$).pipe(
    scan(applyDelta, [{x: 202443, y: 444249}, 4]),
    tap(([center, zoom]) => {
        render(center, zoom, devicePixelRatio, ctx);
    })
).subscribe();

//fromEvent(document, 'click').subscribe(console.log)