export interface Vector {
    x: number,
    y: number,

}

export interface PaintStroke {
    points: PaintStrokePoint[],
    color: String,
    baseWeight: number,
}

export interface PaintStrokePoint {
    x: number,
    y: number,
    speed: number,
    pressure?: number,
}

export interface Drawing {
    svg: String,
    data: {
        paths: PaintStroke[],
        meta: {
            height: number,
            width: number,
        },
    },
}
