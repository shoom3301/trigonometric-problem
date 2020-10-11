import { Degree, Point, PointOnCircle, Radian } from './model'
import { degreeToRadian } from './utils'

const offset = 150

function X(n: number, additionalOffset = 0): number {
    return n + (offset /2) + additionalOffset
}

function Y(n: number, additionalOffset = 0): number {
    return n + (offset /2) + additionalOffset
}

export function renderUpdate(
    startAngle: Degree,
    endAngle: Degree,
    trees: PointOnCircle[],
    center: Point,
    size: number) {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    const context = canvas.getContext('2d')

    context.canvas.width = size + offset
    context.canvas.height = size + offset
    context.clearRect(0, 0, canvas.width, canvas.height)

    drawForest(context, trees, size, center)
    drawCameraView(context, startAngle, endAngle, center, size)
}

function drawForest(context: CanvasRenderingContext2D, points: PointOnCircle[], size: number, center: Point) {
    const countInTheBestView = points.reduce((acc, point) => {
        if (point.includedDotsCount > acc) acc = point.includedDotsCount

        return acc;
    }, 0);

    drawSceneCircle(context, center, size)

    points.forEach(point => {
        drawPointProjection(context, center, point, countInTheBestView)
        drawPoint(context, point)
    })
}

function drawPoint(context: CanvasRenderingContext2D, point: PointOnCircle) {
    context.beginPath()
    context.arc(X(point.x), Y(point.y),3,0, 2 * Math.PI)
    context.fillStyle = '#ff0000'
    context.fill()
}

function drawPointProjection(
    context: CanvasRenderingContext2D,
    center: Point,
    point: PointOnCircle,
    countInTheBestView: number) {
    context.beginPath()
    context.moveTo(X(center.x), Y(center.y))
    context.lineTo(X(point.projectionX), Y(point.projectionY))
    if (countInTheBestView === point.includedDotsCount) {
        context.strokeStyle = '#df23ff'
    } else {
        context.strokeStyle = point.highlighted ? '#ff0000' : '#00ff00'
    }
    context.stroke()

    context.font = '9px serif'
    context.fillStyle = '#000'
    const text = `${point.degree}`
    context.fillText(text, X(point.projectionX, 10), Y(point.projectionY, 10))
}

function drawSceneCircle(context: CanvasRenderingContext2D, center: Point, size: number) {
    context.beginPath()
    context.arc(X(center.x), Y(center.y), size / 2, 0, 2 * Math.PI)
    context.strokeStyle = '#000'
    context.stroke()
}

function drawCameraView(
    context: CanvasRenderingContext2D,
    startAngle: Degree,
    endAngle: Degree,
    center: Point,
    size: number) {
    const {x, y} = center
    const radius = size / 2
    const leftAngle = degreeToRadian(startAngle)
    const rightAngle = degreeToRadian(endAngle)
    const leftSidePoint: Point = {
        x: x + radius * Math.cos(leftAngle),
        y: y + radius * Math.sin(leftAngle)
    }
    const rightSidePoint: Point = {
        x: x + radius * Math.cos(rightAngle),
        y: y + radius * Math.sin(rightAngle)
    }

    drawLeftCameraViewSide(context, center, leftSidePoint)
    drawRightCameraViewSide(context, center, rightSidePoint)
    drawCameraViewField(context, center, size, leftAngle, rightAngle)
}

function drawLeftCameraViewSide(context: CanvasRenderingContext2D, center: Point, end: Point) {
    context.beginPath()
    context.moveTo(X(center.x), Y(center.y))
    context.lineTo(X(end.x), Y(end.y))
    context.lineWidth = 3
    context.strokeStyle = '#428adb'
    context.stroke()
    context.lineWidth = 1
}

function drawRightCameraViewSide(context: CanvasRenderingContext2D, center: Point, end: Point) {
    context.beginPath()
    context.moveTo(X(center.x), Y(center.y))
    context.lineTo(X(end.x), Y(end.y))
    context.strokeStyle = '#428adb'
    context.stroke()
}

function drawCameraViewField(
    context: CanvasRenderingContext2D,
    center: Point,
    size: number,
    leftAngle: Radian,
    rightAngle: Radian) {
    const radius = size

    context.beginPath()
    context.moveTo(X(center.x), Y(center.y))
    context.arc(X(center.x), Y(center.y), radius, leftAngle, rightAngle)
    context.closePath()
    context.fillStyle = 'rgba(82,214,255,0.4)'
    context.fill()
    context.fillStyle = '#000'
}
