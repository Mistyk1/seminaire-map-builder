import config from "../core/config.js";
import { floodFillCells, setCell, syncMapJson } from "../state/mapData.js";

function getCanvasDimensions(context) {
    return {
        width: context.canvas.width,
        height: context.canvas.height,
    };
}

export function resizeCanvas(canvas, size) {
    const cellSize = Math.floor(
        Math.min(
            config.maxCanvasWidth / size.width,
            config.maxCanvasHeight / size.height,
        ),
    );

    canvas.width = cellSize * size.width;
    canvas.height = cellSize * size.height;
}

export function clearCanvas(context) {
    const { width, height } = getCanvasDimensions(context);

    context.fillStyle = "#000000";
    context.fillRect(0, 0, width, height);
}

export function drawGrid(context, state) {
    const canvasSize = getCanvasDimensions(context);
    const { width, height } = state.currentSize.width;
    const squareWidth = canvasSize.width / width;
    const squareHeight = canvasSize.height / height;

    clearCanvas(context, state.currentSize, state.background);

    context.strokeStyle = "#6080F0";
    context.beginPath();

    for (let x = 1; x < width; x += 1) {
        context.moveTo(x * squareWidth, 0);
        context.lineTo(x * squareWidth, canvasSize.height);
    }

    for (let y = 1; y < height; y += 1) {
        context.moveTo(0, y * squareHeight);
        context.lineTo(canvasSize.width, y * squareHeight);
    }

    context.stroke();
    context.closePath();
}

export function getCellFromEvent(event, size) {
    const canvas = event.currentTarget;
    const squareWidth = canvas.width / size.width;
    const squareHeight = canvas.height / size.height;

    return {
        x: Math.floor(event.offsetX / squareWidth),
        y: Math.floor(event.offsetY / squareHeight),
    };
}

export function drawTile(context, mapData, tileSet, background, size, x, y) {
    drawTileWithOptions(context, mapData, tileSet, background, size, x, y);
}

export function drawTileWithOptions(context, mapData, tileSet, background, size, x, y, options = {}) {
    if (!tileSet) {
        console.log("There is no tileset");
        return;
    }

    const { gap = 1 } = options;
    const canvasSize = getCanvasDimensions(context);
    const cellWidth = canvasSize.width / size.width;
    const cellHeight = canvasSize.height / size.height;
    const squareWidth = cellWidth - gap;
    const squareHeight = cellHeight - gap;
    const offsetX = x * cellWidth;
    const offsetY = y * cellHeight;

    if (background[y][x]){
        context.drawImage(
            background[y][x],
            offsetX,
            offsetY,
            squareWidth,
            squareHeight,
        );
    }
    mapData.cells.forEach((layer, z) => {
        if (layer[y][x]) {
            context.drawImage(
                tileSet.listItem[layer[y][x]],
                offsetX,
                offsetY,
                squareWidth,
                squareHeight,
            );
        }
    });
}

export function eraseTile(context, size, x, y) {
    const canvasSize = getCanvasDimensions(context);
    const cellWidth = canvasSize.width / size.width;
    const cellHeight = canvasSize.height / size.height;
    const squareWidth = cellWidth - 1;
    const squareHeight = cellHeight - 1;

    context.fillStyle = "#000000";
    context.fillRect(
        x * cellWidth,
        y * cellHeight,
        squareWidth,
        squareHeight,
    );
}

export function applyTool(context, state, position) {
    const { currentTool, currentTile, currentSize, baseField, currentLayer, mapData, background } = state;

    switch (currentTool) {
        case "fill": {
            const updatedCells = floodFillCells(state.mapData, position.x, position.y, currentLayer, currentTile);

            updatedCells.forEach((cell) => {
                drawTileWithOptions(context, mapData, baseField, state.background, currentSize, cell.x, cell.y);
            });

            syncMapJson(state);
            return;
        }
        case "erase":
            setCell(state.mapData, position.x, position.y, currentLayer, null);
            eraseTile(context, currentSize, position.x, position.y);
            drawTile(context, mapData, baseField, background, currentSize, position.x, position.y);
            syncMapJson(state);
            return;
        case "pen":
        default:
            setCell(state.mapData, position.x, position.y, currentLayer, currentTile);
            eraseTile(context, currentSize, position.x, position.y);
            drawTile(context, mapData, baseField, background, currentSize, position.x, position.y);
            syncMapJson(state);
    }
}

export function renderMap(context, state, options = {}) {
    const { showGrid = true } = options;

    if (showGrid) {
        drawGrid(context, state);
    } else {
        clearCanvas(context, state.currentSize, state);
    }

    state.mapData.cells[0].forEach((row, y) => {
        row.forEach((tileIndex, x) => {
            drawTileWithOptions(
                context,
                state.mapData,
                state.baseField,
                state.background,
                state.currentSize,
                x,
                y,
                { gap: showGrid ? 1 : 0 },
            );
        });
    });
}
