import config from "../core/config.js";
import { createEmptyMapData, serializeMapData } from "./mapData.js";

export function createAppState() {
    const mapData = createEmptyMapData(config.defaultWidth, config.defaultHeight);

    return {
        baseField: null,
        currentTile: null,
        currentLayer: 1,
        highestLayer: 1,
        background,
        currentTool: "pen",
        currentSize: {
            width: config.defaultWidth,
            height: config.defaultHeight,
        },
        mapData,
        mapJson: serializeMapData(mapData),
    };
}
