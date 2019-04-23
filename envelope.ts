export interface Coordinate {
    x: number;
    y: number;
}

export interface Envelope {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
};

export function envelopeContains(env : Envelope, pt: Coordinate) {
    return pt.x >= env.minX && pt.x < env.maxX 
        && pt.y >= env.minY && pt.y < env.maxY;
}