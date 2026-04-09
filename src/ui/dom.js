const canvas = document.querySelector("canvas");

export const dom = {
    canvas,
    context: canvas.getContext("2d"),
    tileContainer: document.querySelector(".tuile"),
    layerButtonsContainer: document.querySelector(".layers"),
    layersButtons: document.querySelectorAll(".layers button"),
    addLayerButton: document.querySelector("#add-layer"),
    removeLayerButton: document.querySelector("#remove-layer"),
    backgroundButton: document.querySelector("#background"),
    backgroundInput: document.querySelector("#import-background"),
    toolButtons: document.querySelectorAll(".tools button"),
    widthInput: document.querySelector("#width"),
    heightInput: document.querySelector("#height"),
    changeSizeButton: document.querySelector("#change-size"),
    exportJsonButton: document.querySelector("#export-json"),
    exportImageButton: document.querySelector("#export-image"),
    importJsonButton: document.querySelector("#import-json"),
    importJsonFileInput: document.querySelector("#import-json-file"),
};
