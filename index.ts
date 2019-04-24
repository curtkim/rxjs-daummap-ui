import { fromEvent, merge } from 'rxjs';
import {map, scan, tap, pluck, filter} from 'rxjs/operators';
import {createMouseDragObserable} from './interaction';
import {Coordinate, Envelope} from './envelope';
import {render} from './render';


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
                return {dz:-1};
            case 'Minus':
                return {dz:1};
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
    return [{x: center.x - dx * ratio, y: center.y + dy * ratio}, zoom+dz];
}

merge(mousedrag$, zoom$, wheel$).pipe(
    scan(applyDelta, [{x: 202443, y: 444249}, 4]),
    tap(([center, zoom]) => {
        render(center, zoom, devicePixelRatio, ctx);
    })
).subscribe();

//fromEvent(document, 'click').subscribe(console.log)