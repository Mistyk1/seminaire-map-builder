export function createEmptyMapData(width, height) {
    return {
        width,
        height,
        cells: Array.from({length: 1}, () =>
            Array.from({ length: height }, () =>
                Array(width).fill(null)
            )
        ),
    };
}

export function resizeMapData(width, height) {
    return createEmptyMapData(width, height);
}

export function getCell(mapData, x, y, layer) {
    if (!mapData.cells[layer] || !mapData.cells[layer][y] || mapData.cells[layer][y][x] === undefined) {
        return undefined;
    }

    return mapData.cells[layer][y][x];
}

export function setCell(mapData, x, y, layer, value) {
    layer = layer - 1;
    if (!mapData.cells[layer] || !mapData.cells[layer][y] || mapData.cells[layer][y][x] === undefined) {
        return;
    }

    mapData.cells[layer][y][x] = value;
}

export function floodFillCells(mapData, startX, startY, startLayer, nextValue) {
    const targetValue = getCell(mapData, startX, startY, startLayer);

    if (targetValue === undefined || targetValue === nextValue) {
        return [];
    }

    const pendingCells = [{ x: startX, y: startY, layer: startLayer }];
    const updatedCells = [];
    const visitedCells = new Set();

    while (pendingCells.length > 0) {
        const cell = pendingCells.pop();
        const cellKey = `${cell.x}:${cell.y}`;

        if (visitedCells.has(cellKey)) {
            continue;
        }

        visitedCells.add(cellKey);

        if (getCell(mapData, cell.x, cell.y, cell.layer) !== targetValue) {
            continue;
        }

        setCell(mapData, cell.x, cell.y, cell.layer, nextValue);
        updatedCells.push(cell);

        pendingCells.push({ x: cell.x + 1, y: cell.y, layer: cell.layer });
        pendingCells.push({ x: cell.x - 1, y: cell.y, layer: cell.layer });
        pendingCells.push({ x: cell.x, y: cell.y + 1, layer: cell.layer });
        pendingCells.push({ x: cell.x, y: cell.y - 1, layer: cell.layer });
    }

    return updatedCells;
}

export function serializeMapData(mapData) {
    return JSON.stringify(mapData, null, 2);
}

export function syncMapJson(state) {
    state.mapJson = serializeMapData(state.mapData);
}

export function parseMapData(jsonContent) {
    const parsedMap = JSON.parse(jsonContent);

    if (!Number.isInteger(parsedMap.width) || parsedMap.width <= 0) {
        throw new Error("Largeur invalide dans le JSON.");
    }

    if (!Number.isInteger(parsedMap.height) || parsedMap.height <= 0) {
        throw new Error("Hauteur invalide dans le JSON.");
    }

    if (!Array.isArray(parsedMap.cells) || parsedMap.cells[0].length !== parsedMap.height) {
        throw new Error("Structure de cellules invalide dans le JSON.");
    }

    parsedMap.cells.forEach((layer) => {
        layer.forEach((row) => {
            if (!Array.isArray(row) || row.length !== parsedMap.width) {
                throw new Error("Les lignes du JSON ne correspondent pas a la taille indiquee.");
            }

            row.forEach((cell) => {
                if (cell !== null && !Number.isInteger(cell)) {
                    throw new Error("Les cellules doivent contenir un index de tuile ou null.");
                }
            });
        });
    });

    return {
        width: parsedMap.width,
        height: parsedMap.height,
        cells: parsedMap.cells.map((layer) => [...layer]),
    };
}
