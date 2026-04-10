import { applyTool, drawGrid, getCellFromEvent, renderMap, resizeCanvas, clearCanvas } from "./features/canvasManager.js";
import { readGridSize } from "./features/sizeControls.js";
import { createAppState } from "./state/appState.js";
import { parseMapData, resizeMapData, syncMapJson } from "./state/mapData.js";
import { dom } from "./ui/dom.js";
import loadTileButton from "./tiles/tileLoader.js";
import loadTile from "./tiles/tileManager.js";

const state = createAppState();
window.mapBuilderState = state;

let isMouseDown = false;

async function initialize() {
    state.baseField = await loadTile("tiles.png", 15, 18, dom.tileContainer, state);

    loadTileButton(state.baseField, dom.tileContainer, (selectedTile) => {
        state.currentTile = selectedTile;
    });

    bindCanvasEvents();
    bindLayerButtons();
    bindAddRemoveLayerButton();
    bindBackgroundButtons();
    bindToolButtons();
    bindSizeControls();
    bindExportButtons();
    bindImportButton();

    dom.changeSizeButton.click();
}

function bindCanvasEvents() {
    dom.canvas.addEventListener("mousedown", (event) => {
        if (event.button !== 0) return;
        isMouseDown = true;
        const position = getCellFromEvent(event, state.currentSize);
        applyTool(dom.context, state, position);
    });
    dom.canvas.addEventListener("mousemove", (event) => {
        if (!isMouseDown) return;
        const position = getCellFromEvent(event, state.currentSize);
        applyTool(dom.context, state, position);
    });
    dom.canvas.addEventListener("mouseup", () => {
        isMouseDown = false;
    });
}

function bindLayerButtons() {
    dom.layersButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            dom.layersButtons.forEach((toolButton) => toolButton.classList.remove("active"));
            event.currentTarget.classList.add("active");
            state.currentLayer = event.currentTarget.dataset.id;
        });
    });
}

function bindAddRemoveLayerButton() {
    dom.addLayerButton.addEventListener("click", () => {
        const newHighestLayer = state.highestLayer + 1;

        const newLayerButton = document.createElement("button");
        newLayerButton.textContent = newHighestLayer;
        newLayerButton.id = "button-layer" + newHighestLayer;
        newLayerButton.setAttribute("data-id", newHighestLayer);
        newLayerButton.addEventListener("click", (event) => {
            dom.layersButtons.forEach((toolButton) => toolButton.classList.remove("active"));
            event.currentTarget.classList.add("active");
            state.currentLayer = event.currentTarget.dataset.id;
        });
        dom.layerButtonsContainer.appendChild(newLayerButton);
        dom.layersButtons = document.querySelectorAll(".layers button");

        state.highestLayer = newHighestLayer;
        state.mapData.cells.push(Array.from({ length: state.currentSize.height }, () =>
            Array(state.currentSize.width).fill(null)
        ));
    });

    dom.removeLayerButton.addEventListener("click", () => {
        if (state.highestLayer > 1) {
            if (state.currentLayer == state.highestLayer) {
                state.currentLayer = state.currentLayer - 1;
                dom.layersButtons.forEach((toolButton) => toolButton.classList.remove("active"));
                const layerButton = document.getElementById("button-layer" + state.currentLayer);
                layerButton.classList.add("active");
            }
            const highestLayerButton = document.getElementById("button-layer" + state.highestLayer);
            highestLayerButton.remove();
            state.highestLayer = state.highestLayer - 1;
        }
    });
}

function bindBackgroundButtons() {
    dom.backgroundButton.addEventListener("click", () => {
        dom.backgroundInput.click();
    });

    dom.backgroundInput.addEventListener("change", async (event) => {
        const [file] = event.currentTarget.files;

        if (!file) {
            return;
        }

        try {
            const image = await createImageBitmap(file);
            const stepX = image.width / state.currentSize.width;
            const stepY = image.height / state.currentSize.height;

            state.background = Array.from({ length: state.currentSize.height }, () =>
                Array(state.currentSize.width).fill(null)
            )
            for (let y = 0; y < state.currentSize.height; y++) {
                for (let x = 0; x < state.currentSize.width; x++) {
                    console.log(file);
                    state.background[y][x] = await createImageBitmap(image, stepX * x, stepY * y, stepX, stepY);
                }
            }

            clearCanvas(dom.context, state.currentSize, state.background)
            renderMap(dom.context, state);
        } catch (error) {
            window.alert(error.message);
        } finally {
            event.currentTarget.value = "";
        }
    });
}

function bindToolButtons() {
    dom.toolButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            dom.toolButtons.forEach((toolButton) => toolButton.classList.remove("active"));
            event.currentTarget.classList.add("active");
            state.currentTool = event.currentTarget.dataset.id;
        });
    });
}

function bindSizeControls() {
    dom.changeSizeButton.addEventListener("click", () => {
        state.currentSize = readGridSize(dom.widthInput, dom.heightInput);
        state.mapData = resizeMapData(state.currentSize.width, state.currentSize.height);
        syncMapJson(state);
        resizeCanvas(dom.canvas, state.currentSize);
        drawGrid(dom.context, state);
    });
}

function bindExportButtons() {
    dom.exportJsonButton.addEventListener("click", () => {
        const fileContent = new Blob([state.mapJson], { type: "application/json" });
        const downloadUrl = URL.createObjectURL(fileContent);
        const link = document.createElement("a");

        link.href = downloadUrl;
        link.download = "map.json";
        link.click();

        URL.revokeObjectURL(downloadUrl);
    });

    dom.exportImageButton.addEventListener("click", () => {
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = dom.canvas.width;
        exportCanvas.height = dom.canvas.height;

        const exportContext = exportCanvas.getContext("2d");
        renderMap(exportContext, state, { showGrid: false });

        const link = document.createElement("a");
        link.href = exportCanvas.toDataURL("image/png");
        link.download = "map.png";
        link.click();
    });
}

function bindImportButton() {
    dom.importJsonButton.addEventListener("click", () => {
        dom.importJsonFileInput.click();
    });

    dom.importJsonFileInput.addEventListener("change", async (event) => {
        const [file] = event.currentTarget.files;

        if (!file) {
            return;
        }

        try {
            const fileContent = await file.text();
            const importedMapData = parseMapData(fileContent);

            state.mapData = importedMapData;
            console.log(importedMapData)
            state.currentSize = {
                width: importedMapData.width,
                height: importedMapData.height,
            };

            dom.widthInput.value = state.currentSize.width;
            dom.heightInput.value = state.currentSize.height;

            syncMapJson(state);
            resizeCanvas(dom.canvas, state.currentSize);
            renderMap(dom.context, state);
        } catch (error) {
            window.alert(error.message);
        } finally {
            event.currentTarget.value = "";
        }
    });
}

initialize();
