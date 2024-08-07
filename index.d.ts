import { BrowserWindow, Point, Rectangle } from "electron";
// x align if tray bar is on top or bottom (default: center)
export type AlignX = "left" | "center" | "right";

// y align if tray bar is left or right (default: down)
export type AlignY = "up" | "center" | "down";

export type Alignment = {
    x: AlignX;
    y: AlignY;
};

declare const positioner: {
    /**
     * Calculates the position of the tray window
     *
     * @param {Rectangle} trayBounds - tray bounds from electron Tray
     * @return {string} - the position of the taskbar (top|right|bottom|left)
     */
    getTaskbarPosition(trayBounds: Rectangle): "left" | "right" | "bottom" | "top";

    /**
     * Calculates the position of the tray window
     *
     * @param {Rectangle} windowBounds - electron BrowserWindow bounds of tray window to position
     * @param {Rectangle} trayBounds - tray bounds from electron Tray
     * @param {Alignment} alignment - alignment of window to tray
     * @return {Point} - Calculated point {x, y} where the window should be positioned
     */
    calculate(windowBounds: Rectangle, trayBounds: Rectangle, alignment?: Alignment): Point;

    /**
     * Calculates the position of the tray window
     *
     * @param {BrowserWindow} window - window to position
     * @param {Rectangle} trayBounds - tray bounds from electron Tray
     * @param {Alignment} alignment - alignment of window to tray
     * @return {void}
     */
    position(window: BrowserWindow, trayBounds: Rectangle, alignment?: Alignment): void;
};

export default positioner;
