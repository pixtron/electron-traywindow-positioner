/* eslint-disable class-methods-use-this */

const displayFactory = require('./displayFactory.js');

class ScreenMock {
  getDisplayNearestPoint() {
    return displayFactory('top', 'primary');
  }
}

module.exports = ScreenMock;
