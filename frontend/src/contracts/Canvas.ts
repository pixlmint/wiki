import * as d3 from "d3";
import {BaseType, Selection} from "d3";

export interface Vector {
    x: number,
    y: number,
}

export interface DrawingMode {
    name: String,
    icon: String,
    pointsTransformer: Function,
    appendObject: (stroke: PaintStroke, canvas: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) => Selection<SVGPathElement, PaintStroke, BaseType, unknown>,
}

export interface PaintStroke {
    points: PaintStrokePoint[],
    color: String,
    baseWeight: number,
    drawingMode: DrawingMode,
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
