import { degreeToRadian, getVerticalAngleDegree } from './utils'
import { Point, PointOnCircle } from './model'

export function generatePoints(size: number, count: number, treshold = 15): Point[] {
    const points: Point[] = []

    for (let i=0; i<count; i++) {
        let point = generatePoint(size)

        while (points.filter(({x, y}) => {
            return x > point.x - treshold
                && x < point.x + treshold
                && y > point.y - treshold
                && y < point.y + treshold
        }).length > 0) {
            point = generatePoint(size)
        }

        points.push(point)
    }

    return points
}

export function enrichPoints(trees: Point[], center: Point, radius: number): PointOnCircle[] {
    return trees.map(({x, y}) => {
        const degree = getVerticalAngleDegree(center, {x, y})
        const radian = degreeToRadian(degree)
        const projectionX = radius + radius * Math.cos(radian)
        const projectionY = radius + radius * Math.sin(radian)

        return {x, y, projectionX, projectionY, degree, radian}
    })
        .sort((a, b) => a.radian > b.radian ? 1 : -1)
}

function generatePoint(size: number): Point {
    return {x: randomInt(0, size), y: randomInt(0, size)}
}

function randomInt(min: number, max: number): number {
    return Math.round(min - 0.5 + Math.random() * (max - min + 1))
}
