const displayFactory = function (taskbarPosition = 'top', screenId = 'primary') {
  const taskbarSize = 23;

  let bounds;
  let workArea;

  switch (screenId) {
    case 'sec-left':
      bounds = { x: -1440, y: 0, width: 1440, height: 900 };
      break;
    case 'sec-right':
      bounds = { x: 1440, y: 0, width: 1440, height: 900 };
      break;
    case 'primary':
    default:
      bounds = { x: 0, y: 0, width: 1440, height: 900 };
      break;
  }

  switch (taskbarPosition) {
    case 'left':
      workArea = {
        x: bounds.x + taskbarSize,
        y: 0,
        width: bounds.width - taskbarSize,
        height: bounds.height,
      };
      break;
    case 'right':
      workArea = {
        x: 0,
        y: 0,
        width: bounds.width - taskbarSize,
        height: bounds.height,
      };
      break;
    case 'bottom':
      workArea = {
        x: 0,
        y: 0,
        width: bounds.width,
        height: bounds.height - taskbarSize,
      };
      break;
    case 'top':
    default:
      workArea = {
        x: 0,
        y: bounds.y + taskbarSize,
        width: bounds.width,
        height: bounds.height - taskbarSize,
      };
      break;
  }

  return { bounds, workArea };
};

module.exports = displayFactory;
