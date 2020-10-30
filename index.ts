import { enrichPoints, generatePoints } from './generation'
import { Degree, Point, PointOnCircle } from './model';
import { renderUpdate } from './render'
import { includedDotsCount, isPointIncludedInAngle } from 'utils';

function init() {
    const viewAngleInput = document.getElementById('view-angle') as HTMLInputElement
    const rotationAngleInput = document.getElementById('rotation-angle') as HTMLInputElement
    const scanToggleInput = document.getElementById('scan-toggle') as HTMLInputElement
    const pointsCountInput = document.getElementById('points-count') as HTMLInputElement
    const randomizeButton = document.getElementById('randomize') as HTMLButtonElement
    const rotationAngleValue = document.getElementById('rotation-angle-value') as HTMLSpanElement
    const viewAngleValue = document.getElementById('view-angle-value') as HTMLSpanElement
    const highlightedDotsValue = document.getElementById('highlighted-dots-value') as HTMLSpanElement
    const totalDotsValue = document.getElementById('total-dots-value') as HTMLSpanElement
    const scoreBoard = document.getElementById('scoreboard') as HTMLUListElement

    let scanTimer = null
    let startAngle: Degree = 0
    let endAngle: Degree = 30
    let size = 300
    let radius = size / 2
    let count = 10
    let center: Point = {x: size / 2, y: size / 2}
    let points = enrichPoints(generatePoints(size, count), center, radius)

    function updateCameraView() {
        points = points.map((point, index) => {
            return {
                ...point,
                highlighted: isPointIncludedInAngle(point, startAngle, endAngle),
                includedDotsCount: includedDotsCount(point, index, endAngle, points)
            }
        });

        rotationAngleValue.innerText = startAngle.toString()
        viewAngleValue.innerText = endAngle.toString()
        totalDotsValue.innerText = count.toString()
        highlightedDotsValue.innerText = points.filter(i => i.highlighted).length.toString()

        renderScoreBoard(points, scoreBoard)
        renderUpdate(startAngle, endAngle + startAngle, points, center, size)
    }

    function refreshView() {
        points = enrichPoints(generatePoints(size, count), center, radius)
        scanToggleInput.click()
        scanToggleInput.click()
        updateCameraView()
    }

    function renderScoreBoard(points: PointOnCircle[], scoreBoard: HTMLUListElement) {
        const countInTheBestView = points.reduce((acc, point) => {
            if (point.includedDotsCount > acc) acc = point.includedDotsCount

            return acc;
        }, 0);
        const list = points
            .sort((a, b) => a.includedDotsCount > b.includedDotsCount ? -1 : 1)
            .map(point => {
            const li = document.createElement('li')

            li.innerText = `Degree: ${point.degree}, observed trees: ${point.includedDotsCount}`

            if (countInTheBestView === point.includedDotsCount) {
                li.classList.add('best')
            }

            return li
        })

        scoreBoard.innerHTML = ''
        scoreBoard.append(...list)
    }

    viewAngleInput.value = endAngle.toString()
    rotationAngleInput.value = startAngle.toString()
    pointsCountInput.value = count.toString()

    viewAngleInput.addEventListener('input', () => {
        endAngle = parseInt(viewAngleInput.value)
        updateCameraView()
    })

    rotationAngleInput.addEventListener('input', () => {
        startAngle = parseInt(rotationAngleInput.value)
        updateCameraView()
    })

    pointsCountInput.addEventListener('input', () => {
        count = parseInt(pointsCountInput.value)
        refreshView()
    })

    randomizeButton.addEventListener('click', () => {
        refreshView()
    })

    scanToggleInput.addEventListener('click', () => {
        clearInterval(scanTimer)

        if (!scanToggleInput.checked) return

        let i = 0
        const sortedPoints = points.sort((a, b) => a.degree > b.degree ? 1 : -1)

        scanTimer = setInterval(() => {
            startAngle = sortedPoints[i].degree
            updateCameraView()

            i++
            if (i === sortedPoints.length) i = 0
        }, 1000)
    })

    updateCameraView()
}

init()
