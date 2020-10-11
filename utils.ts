import { Degree, Point, PointOnCircle, Radian } from './model';

export function randomInt(min: number, max: number): number {
    return Math.round(min - 0.5 + Math.random() * (max - min + 1))
}

export function getVerticalAngleDegree(center: Point, point: Point): Degree {
    const isLeftSide = point.x < center.x
    const isTopSide = point.y < center.y
    const opposite = center.y - point.y
    const closest = center.x - point.x
    const hypotenuse = Math.hypot(opposite, closest)
    const sinOfAngleX = opposite / hypotenuse
    const angle = Math.asin(sinOfAngleX) * 180 / Math.PI
    const res = Math.round(isLeftSide ? angle + 180 : angle)

    if (isLeftSide && !isTopSide) return res
    if (!isLeftSide && isTopSide) return 360 - res

    return isTopSide ? res : -res
}

export function isPointIncludedInAngle(point: PointOnCircle, startAngle: Degree, endAngle: Degree): boolean {
    const start = startAngle
    const end = startAngle + endAngle

    if (end > 360 && point.degree <= start && point.degree <= end - 360) {
        return true;
    }

    return point.degree >= start && point.degree <= end
}

export function includedDotsCount(
    point: PointOnCircle,
    index: number,
    viewAngle: Degree,
    points: PointOnCircle[]): number {
    let includedCount = 0;

    for (let i=0; i < points.length; i++) {
        let nextIndex = i + index

        if (nextIndex > points.length - 1) {
            nextIndex = nextIndex - points.length
        }

        if (isPointIncludedInAngle(points[nextIndex], point.degree, viewAngle)) {
            includedCount++;
        }
    }

    return includedCount
}

export function degreeToRadian(degree: Degree): Radian {
    return degree * Math.PI / 180
}
