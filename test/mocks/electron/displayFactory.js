
const displayFactory = function (taskbarPosition) {
  switch (taskbarPosition) {
    case 'left':
      return {
        bounds: { x: 0, y: 0, width: 1440, height: 900 },
        workArea: { x: 23, y: 0, width: 1417, height: 900 },
      };
    case 'right':
      return {
        bounds: { x: 0, y: 0, width: 1440, height: 900 },
        workArea: { x: 0, y: 0, width: 1417, height: 900 },
      };
    case 'bottom':
      return {
        bounds: { x: 0, y: 0, width: 1440, height: 900 },
        workArea: { x: 0, y: 0, width: 1440, height: 877 },
      };
    case 'top':
    default:
      return {
        bounds: { x: 0, y: 0, width: 1440, height: 900 },
        workArea: { x: 0, y: 23, width: 1440, height: 877 },
      };
  }
};

module.exports = displayFactory;
