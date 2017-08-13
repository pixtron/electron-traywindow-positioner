# electron-traywindow-positioner

Helps to position a electron window as a custom tray menu window.
On Windows and OSX the tray bar location is calculated and the window is  
positioned based on the tray bar location.

On linux the position is calculated based on the current cursor position, because `Tray.getBounds()`
always returns a `Rectangle` with all values set to zero.

## Installation

```
npm install --save electron-traywindow-positioner
```

## Usage

```
const positioner = require('electron-traywindow-positioner');

positioner.position(trayWindow, trayBounds);
```

* `trayWindow` must be an instance of a [`BrowserWindow`](https://github.com/electron/electron/blob/master/docs/api/browser-window.md#wingetbounds).
* `trayBounds` must be an instance  of [`Rectangle`](https://github.com/electron/electron/blob/master/docs/api/structures/rectangle.md) returned from [`tray.getBounds()`](https://github.com/electron/electron/blob/master/docs/api/tray.md#traygetbounds-macos-windows)

### Only calculate the postion without positioning the window

```
const positioner = require('electron-traywindow-positioner');

positioner.calculate(windowBounds, trayBounds);

```

* `windowBounds` must be an instance of [`Rectangle`](https://github.com/electron/electron/blob/master/docs/api/structures/rectangle.md) returned from [`BrowserWindow.getBounds()`]().
* `trayBounds` must be an instance  of [`Rectangle`](https://github.com/electron/electron/blob/master/docs/api/structures/rectangle.md)  returned from [`tray.getBounds()`](https://github.com/electron/electron/blob/master/docs/api/tray.md#traygetbounds-macos-windows)



### Custom alignment

```
const alignment = {x: 'left', y: 'up'};

const positioner = require('electron-traywindow-positioner');

positioner.position(trayWindow, trayBounds, alignment);

// or

positioner.calculate(windowBounds, trayBounds, alignment);
```

* `alignmet.x` alignment on x axis relative to tray icon when tray bar is top or bottom.
The value can be one of `left`, `center` or `right`, default is `center`.

* `alignmet.y` alignment on y axis relative to tray icon when tray bar is left or right.
The value can be one of `up`, `middle` or `down`, default is `down`.
