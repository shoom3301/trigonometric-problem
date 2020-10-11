export type Point = {
    x: number,
    y: number
}

export type PointOnCircle = {
    x: number,
    y: number,
    projectionX: number,
    projectionY: number,
    degree: number,
    radian: number,
    highlighted?: boolean,
    includedDotsCount?: number
}

export type Degree = number

export type Radian = number
