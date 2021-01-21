define("model", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("utils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.degreeToRadian = exports.includedDotsCount = exports.isPointIncludedInAngle = exports.getVerticalAngleDegree = exports.randomInt = void 0;
    function randomInt(min, max) {
        return Math.round(min - 0.5 + Math.random() * (max - min + 1));
    }
    exports.randomInt = randomInt;
    function getVerticalAngleDegree(center, point) {
        const isLeftSide = point.x < center.x;
        const isTopSide = point.y < center.y;
        const opposite = center.y - point.y;
        const closest = center.x - point.x;
        const hypotenuse = Math.hypot(opposite, closest);
        const sinOfAngleX = opposite / hypotenuse;
        const angle = Math.asin(sinOfAngleX) * 180 / Math.PI;
        const res = Math.round(isLeftSide ? angle + 180 : angle);
        if (isLeftSide && !isTopSide)
            return res;
        if (!isLeftSide && isTopSide)
            return 360 - res;
        return isTopSide ? res : -res;
    }
    exports.getVerticalAngleDegree = getVerticalAngleDegree;
    function isPointIncludedInAngle(point, startAngle, endAngle) {
        const start = startAngle;
        const end = startAngle + endAngle;
        if (end > 360 && point.degree <= start && point.degree <= end - 360) {
            return true;
        }
        return point.degree >= start && point.degree <= end;
    }
    exports.isPointIncludedInAngle = isPointIncludedInAngle;
    function includedDotsCount(point, index, viewAngle, points) {
        let includedCount = 0;
        for (let i = 0; i < points.length; i++) {
            let nextIndex = i + index;
            if (nextIndex > points.length - 1) {
                nextIndex = nextIndex - points.length;
            }
            if (isPointIncludedInAngle(points[nextIndex], point.degree, viewAngle)) {
                includedCount++;
            }
        }
        return includedCount;
    }
    exports.includedDotsCount = includedDotsCount;
    function degreeToRadian(degree) {
        return degree * Math.PI / 180;
    }
    exports.degreeToRadian = degreeToRadian;
});
define("generation", ["require", "exports", "utils"], function (require, exports, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.enrichPoints = exports.generatePoints = void 0;
    function generatePoints(size, count, treshold = 15) {
        const points = [];
        for (let i = 0; i < count; i++) {
            let point = generatePoint(size);
            while (points.filter(({ x, y }) => {
                return x > point.x - treshold
                    && x < point.x + treshold
                    && y > point.y - treshold
                    && y < point.y + treshold;
            }).length > 0) {
                point = generatePoint(size);
            }
            points.push(point);
        }
        return points;
    }
    exports.generatePoints = generatePoints;
    function enrichPoints(trees, center, radius) {
        return trees.map(({ x, y }) => {
            const degree = utils_1.getVerticalAngleDegree(center, { x, y });
            const radian = utils_1.degreeToRadian(degree);
            const projectionX = radius + radius * Math.cos(radian);
            const projectionY = radius + radius * Math.sin(radian);
            return { x, y, projectionX, projectionY, degree, radian };
        })
            .sort((a, b) => a.radian > b.radian ? 1 : -1);
    }
    exports.enrichPoints = enrichPoints;
    function generatePoint(size) {
        return { x: randomInt(0, size), y: randomInt(0, size) };
    }
    function randomInt(min, max) {
        return Math.round(min - 0.5 + Math.random() * (max - min + 1));
    }
});
define("render", ["require", "exports", "utils"], function (require, exports, utils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderUpdate = void 0;
    const offset = 300;
    function X(n, additionalOffset = 0) {
        return n + (offset / 2) + additionalOffset;
    }
    function Y(n, additionalOffset = 0) {
        return n + (offset / 2) + additionalOffset;
    }
    function renderUpdate(startAngle, endAngle, trees, center, size) {
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');
        context.canvas.width = size + offset;
        context.canvas.height = size + offset;
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawForest(context, trees, size, center);
        drawCameraView(context, startAngle, endAngle, center, size);
    }
    exports.renderUpdate = renderUpdate;
    function drawForest(context, points, size, center) {
        const countInTheBestView = points.reduce((acc, point) => {
            if (point.includedDotsCount > acc)
                acc = point.includedDotsCount;
            return acc;
        }, 0);
        drawSceneCircle(context, center, size);
        points.forEach(point => {
            drawPointProjection(context, center, point, countInTheBestView);
            drawPoint(context, point);
        });
    }
    function drawPoint(context, point) {
        context.beginPath();
        context.arc(X(point.x), Y(point.y), 3, 0, 2 * Math.PI);
        context.fillStyle = '#ff0000';
        context.fill();
    }
    function drawPointProjection(context, center, point, countInTheBestView) {
        context.beginPath();
        context.moveTo(X(center.x), Y(center.y));
        context.lineTo(X(point.projectionX), Y(point.projectionY));
        if (countInTheBestView === point.includedDotsCount) {
            context.strokeStyle = '#df23ff';
        }
        else {
            context.strokeStyle = point.highlighted ? '#ff0000' : '#00ff00';
        }
        context.stroke();
        context.font = '9px serif';
        context.fillStyle = '#000';
        const text = `${point.degree}`;
        context.fillText(text, X(point.projectionX, 10), Y(point.projectionY, 10));
    }
    function drawSceneCircle(context, center, size) {
        context.beginPath();
        context.arc(X(center.x), Y(center.y), size / 2, 0, 2 * Math.PI);
        context.strokeStyle = '#000';
        context.stroke();
    }
    function drawCameraView(context, startAngle, endAngle, center, size) {
        const { x, y } = center;
        const radius = size / 2;
        const leftAngle = utils_2.degreeToRadian(startAngle);
        const rightAngle = utils_2.degreeToRadian(endAngle);
        const leftSidePoint = {
            x: x + radius * Math.cos(leftAngle),
            y: y + radius * Math.sin(leftAngle)
        };
        const rightSidePoint = {
            x: x + radius * Math.cos(rightAngle),
            y: y + radius * Math.sin(rightAngle)
        };
        drawLeftCameraViewSide(context, center, leftSidePoint);
        drawRightCameraViewSide(context, center, rightSidePoint);
        drawCameraViewField(context, center, size, leftAngle, rightAngle);
    }
    function drawLeftCameraViewSide(context, center, end) {
        context.beginPath();
        context.moveTo(X(center.x), Y(center.y));
        context.lineTo(X(end.x), Y(end.y));
        context.lineWidth = 3;
        context.strokeStyle = '#428adb';
        context.stroke();
        context.lineWidth = 1;
    }
    function drawRightCameraViewSide(context, center, end) {
        context.beginPath();
        context.moveTo(X(center.x), Y(center.y));
        context.lineTo(X(end.x), Y(end.y));
        context.strokeStyle = '#428adb';
        context.stroke();
    }
    function drawCameraViewField(context, center, size, leftAngle, rightAngle) {
        const radius = size;
        context.beginPath();
        context.moveTo(X(center.x), Y(center.y));
        context.arc(X(center.x), Y(center.y), radius, leftAngle, rightAngle);
        context.closePath();
        context.fillStyle = 'rgba(82,214,255,0.4)';
        context.fill();
        context.fillStyle = '#000';
    }
});
define("index", ["require", "exports", "generation", "render", "utils"], function (require, exports, generation_1, render_1, utils_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function init() {
        const viewAngleInput = document.getElementById('view-angle');
        const rotationAngleInput = document.getElementById('rotation-angle');
        const scanToggleInput = document.getElementById('scan-toggle');
        const pointsCountInput = document.getElementById('points-count');
        const randomizeButton = document.getElementById('randomize');
        const rotationAngleValue = document.getElementById('rotation-angle-value');
        const viewAngleValue = document.getElementById('view-angle-value');
        const highlightedDotsValue = document.getElementById('highlighted-dots-value');
        const totalDotsValue = document.getElementById('total-dots-value');
        const scoreBoard = document.getElementById('scoreboard');
        let scanTimer = null;
        let startAngle = 0;
        let endAngle = 30;
        let size = 300;
        let radius = size / 2;
        let count = 10;
        let center = { x: size / 2, y: size / 2 };
        let points = generation_1.enrichPoints(generation_1.generatePoints(size, count), center, radius);
        function updateCameraView() {
            points = points.map((point, index) => {
                return Object.assign(Object.assign({}, point), { highlighted: utils_3.isPointIncludedInAngle(point, startAngle, endAngle), includedDotsCount: utils_3.includedDotsCount(point, index, endAngle, points) });
            });
            rotationAngleValue.innerText = startAngle.toString();
            viewAngleValue.innerText = endAngle.toString();
            totalDotsValue.innerText = count.toString();
            highlightedDotsValue.innerText = points.filter(i => i.highlighted).length.toString();
            renderScoreBoard(points, scoreBoard);
            render_1.renderUpdate(startAngle, endAngle + startAngle, points, center, size);
        }
        function refreshView() {
            points = generation_1.enrichPoints(generation_1.generatePoints(size, count), center, radius);
            scanToggleInput.click();
            scanToggleInput.click();
            updateCameraView();
        }
        function renderScoreBoard(points, scoreBoard) {
            const countInTheBestView = points.reduce((acc, point) => {
                if (point.includedDotsCount > acc)
                    acc = point.includedDotsCount;
                return acc;
            }, 0);
            const list = points
                .sort((a, b) => a.includedDotsCount > b.includedDotsCount ? -1 : 1)
                .map(point => {
                const li = document.createElement('li');
                li.innerText = `Degree: ${point.degree}, dots count: ${point.includedDotsCount}`;
                if (countInTheBestView === point.includedDotsCount) {
                    li.classList.add('best');
                }
                return li;
            });
            scoreBoard.innerHTML = '';
            scoreBoard.append(...list);
        }
        viewAngleInput.value = endAngle.toString();
        rotationAngleInput.value = startAngle.toString();
        pointsCountInput.value = count.toString();
        viewAngleInput.addEventListener('input', () => {
            endAngle = parseInt(viewAngleInput.value);
            updateCameraView();
        });
        rotationAngleInput.addEventListener('input', () => {
            startAngle = parseInt(rotationAngleInput.value);
            updateCameraView();
        });
        pointsCountInput.addEventListener('input', () => {
            count = parseInt(pointsCountInput.value);
            refreshView();
        });
        randomizeButton.addEventListener('click', () => {
            refreshView();
        });
        scanToggleInput.addEventListener('click', () => {
            clearInterval(scanTimer);
            if (!scanToggleInput.checked)
                return;
            let i = 0;
            const sortedPoints = points.sort((a, b) => a.degree > b.degree ? 1 : -1);
            scanTimer = setInterval(() => {
                startAngle = sortedPoints[i].degree;
                updateCameraView();
                i++;
                if (i === sortedPoints.length)
                    i = 0;
            }, 1000);
        });
        updateCameraView();
    }
    init();
});
//# sourceMappingURL=out.js.map
