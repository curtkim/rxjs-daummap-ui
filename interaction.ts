import {fromEvent} from 'rxjs';
import {switchMap, map, takeUntil} from 'rxjs/operators';

export function createMouseDragObserable(ele : HTMLElement) {
    let mousedown$ = fromEvent(ele, 'mousedown');
    let mousemove$ = fromEvent(document, 'mousemove');
    let mouseup$ = fromEvent(document, 'mouseup');

    return mousedown$.pipe(
        switchMap((event: MouseEvent) => {
            let prevX = event.clientX;
            let prevY = event.clientY;

            return mousemove$.pipe(
                map((event: MouseEvent) => {
                    event.preventDefault();

                    let delta = {
                        dx: event.clientX - prevX,
                        dy: event.clientY - prevY
                    };
                    prevX = event.clientX;
                    prevY = event.clientY;

                    return delta;
                }),
                takeUntil(mouseup$)
            );
        })
    )
};