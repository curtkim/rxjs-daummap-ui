import {map, scan, tap} from 'rxjs/operators';
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

function applyDelta([center, zoom], delta: any) {
    const ratio = Math.pow(2, zoom - 3);
    return [{x: center.x - delta.dx * ratio, y: center.y + delta.dy * ratio}, zoom];
}

mousedrag$.pipe(
    scan(applyDelta, [{x: 202443, y: 444249}, 4]),
    tap(([center, zoom]) => {
        render(center, zoom, devicePixelRatio, ctx);
    })
).subscribe();
