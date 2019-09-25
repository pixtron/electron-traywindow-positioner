const { assert } = require('chai');
const sinon = require('sinon');

const positioner = require('../index.js');

const BrowserWindowMock = require('./mocks/electron/BrowserWindow.js');
const displayFactory = require('./mocks/electron/displayFactory.js');

const sandbox = sinon.createSandbox();
const unknownTrayBounds = { x: 0, y: 0, width: 0, height: 0 };

let getScreenStub;
let getDisplayStub;
let getPlatformStub;

beforeEach(() => {
  getScreenStub = {
    getCursorScreenPoint: sandbox.stub().returns({ x: 500, y: 10 }),
  };
  sandbox.stub(positioner, '_getScreen').returns(getScreenStub);
  getDisplayStub = sandbox.stub(positioner, '_getDisplay').returns(displayFactory('bottom'));
  getPlatformStub = sandbox.stub(positioner, '_getPlatform').returns('other');
});

afterEach(() => {
  sandbox.restore();
});

describe('positioner', () => {
  describe('.getTaskbarPosition', () => {
    it('should return top if taskbar is on top', () => {
      getDisplayStub.returns(displayFactory('top'));

      const result = positioner.getTaskbarPosition();
      assert.equal(result, 'top');
    });

    it('should return bottom if taskbar is on bottom', () => {
      const result = positioner.getTaskbarPosition();
      assert.equal(result, 'bottom');
    });

    it('should return left if taskbar is at left side', () => {
      getDisplayStub.returns(displayFactory('left'));

      const result = positioner.getTaskbarPosition();
      assert.equal(result, 'left');
    });

    it('should return right if taskbar is at right side', () => {
      getDisplayStub.returns(displayFactory('right'));

      const result = positioner.getTaskbarPosition();
      assert.equal(result, 'right');
    });
  });

  describe('.calculate', () => {
    it('should calculate the correct position when taskbar is on top', () => {
      getDisplayStub.returns(displayFactory('top'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 1240, y: 0, width: 20, height: 20 };

      const result = positioner.calculate(trayWindowBounds, trayBounds);

      assert.deepEqual(result, { x: 1150, y: 23 });
    });

    it('should calculate the correct position when taskbar is at bottom', () => {
      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 1240, y: 880, width: 20, height: 20 };

      const result = positioner.calculate(trayWindowBounds, trayBounds);

      assert.deepEqual(result, { x: 1150, y: 777 });
    });

    it('should calculate the correct position when taskbar is at left', () => {
      getDisplayStub.returns(displayFactory('left'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 1240, y: 780, width: 20, height: 20 };

      const result = positioner.calculate(trayWindowBounds, trayBounds);

      assert.deepEqual(result, { x: 23, y: 780 });
    });

    it('should calculate the correct position when taskbar is at right', () => {
      getDisplayStub.returns(displayFactory('right'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 1240, y: 780, width: 20, height: 20 };

      const result = positioner.calculate(trayWindowBounds, trayBounds);

      assert.deepEqual(result, { x: 1217, y: 780 });
    });

    it('should allow to change the y align', () => {
      getDisplayStub.returns(displayFactory('right'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 1240, y: 780, width: 20, height: 20 };

      const result = positioner.calculate(trayWindowBounds, trayBounds, { y: 'up' });

      assert.deepEqual(result, { x: 1217, y: 700 });
    });

    it('should allow to change the x align', () => {
      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 1240, y: 880, width: 20, height: 20 };

      const result = positioner.calculate(trayWindowBounds, trayBounds, { x: 'left' });

      assert.deepEqual(result, { x: 1060, y: 777 });
    });

    describe('on linux', () => {
      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };

      beforeEach(() => {
        getPlatformStub.returns('linux');
      });

      it('should use the cursor position to render the window vertically centered by default', () => {
        const result = positioner.calculate(trayWindowBounds, unknownTrayBounds);
        assert.equal(result.x, 400);
      });
      it('should use the cursor position to render the window vertically centered', () => {
        const result = positioner.calculate(trayWindowBounds, unknownTrayBounds, { x: 'center' });
        assert.equal(result.x, 400);
      });
      it('should use the cursor position to render the window vertically aligned left', () => {
        const result = positioner.calculate(trayWindowBounds, unknownTrayBounds, { x: 'left' });
        assert.equal(result.x, 300);
      });
      it('should use the cursor position to render the window vertically aligned right', () => {
        const result = positioner.calculate(trayWindowBounds, unknownTrayBounds, { x: 'right' });
        assert.equal(result.x, 500);
      });

      it('should use the cursor position to render the window on bottom by default', () => {
        const result = positioner.calculate(trayWindowBounds, unknownTrayBounds);
        assert.equal(result.y, 10);
      });
      it('should use the cursor position to render the window on bottom', () => {
        const result = positioner.calculate(trayWindowBounds, unknownTrayBounds, { y: 'bottom' });
        assert.equal(result.y, 10);
      });
      it('should use the cursor position to render the window on top', () => {
        getScreenStub.getCursorScreenPoint.returns({ x: 500, y: 600 });
        const result = positioner.calculate(trayWindowBounds, unknownTrayBounds, { y: 'top' });
        assert.equal(result.y, 500);
      });
    });
  });

  describe('._calculateXAlign', () => {
    it('should calculate the correct alignment if alignment is center', () => {
      getDisplayStub.returns(displayFactory('top'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 1240, y: 0, width: 20, height: 20 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'center');

      assert.equal(result, 1150);
    });

    it('should calculate the correct alignment if alignment is left', () => {
      getDisplayStub.returns(displayFactory('top'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 1240, y: 0, width: 20, height: 20 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'left');

      assert.equal(result, 1060);
    });

    it('should calculate the correct alignment if alignment is right', () => {
      getDisplayStub.returns(displayFactory('top'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 1240, y: 0, width: 20, height: 20 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'right');

      assert.equal(result, 1240);
    });

    it('should not calculate a position where window overlaps on right', () => {
      getDisplayStub.returns(displayFactory('top'));

      const trayWindowBounds = { x: 0, y: 0, width: 300, height: 100 };
      const trayBounds = { x: 1240, y: 0, width: 20, height: 20 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'right');

      assert.equal(result, 960);
    });

    it('should not calculate a position where window overlaps on left', () => {
      getDisplayStub.returns(displayFactory('top'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 20, y: 0, width: 20, height: 20 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'left');

      assert.equal(result, 20);
    });
  });

  describe('._calculateYAlign', () => {
    it('should calculate the correct alignment if alignment is down', () => {
      getDisplayStub.returns(displayFactory('right'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 20, y: 120, width: 20, height: 20 };

      const result = positioner._calculateYAlign(trayWindowBounds, trayBounds, 'down');

      assert.equal(result, 120);
    });

    it('should calculate the correct alignment if alignment is center', () => {
      getDisplayStub.returns(displayFactory('right'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 20, y: 120, width: 20, height: 20 };

      const result = positioner._calculateYAlign(trayWindowBounds, trayBounds, 'center');

      assert.equal(result, 80);
    });

    it('should calculate the correct alignment if alignment is up', () => {
      getDisplayStub.returns(displayFactory('right'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 20, y: 120, width: 20, height: 20 };

      const result = positioner._calculateYAlign(trayWindowBounds, trayBounds, 'up');

      assert.equal(result, 40);
    });

    it('should not calculate a position where window overlaps on top', () => {
      getDisplayStub.returns(displayFactory('right'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 160 };
      const trayBounds = { x: 20, y: 120, width: 20, height: 20 };

      const result = positioner._calculateYAlign(trayWindowBounds, trayBounds, 'up');

      assert.equal(result, 120);
    });

    it('should not calculate a position where window overlaps at bottom', () => {
      getDisplayStub.returns(displayFactory('right'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 20, y: 820, width: 20, height: 20 };

      const result = positioner._calculateYAlign(trayWindowBounds, trayBounds, 'down');

      assert.equal(result, 740);
    });
  });

  describe('.position', () => {
    it('should position the window correctly', () => {
      const trayWindow = sinon.createStubInstance(BrowserWindowMock);
      trayWindow.getBounds.returns({ x: 0, y: 0, width: 200, height: 100 });

      getDisplayStub.returns(displayFactory('top'));

      const trayBounds = { x: 1240, y: 5, width: 20, height: 20 };

      sandbox.spy(trayWindow.setPosition);
      positioner.position(trayWindow, trayBounds, { x: 'center', y: 'top' });

      assert(trayWindow.setPosition.calledOnce);
      assert(trayWindow.setPosition.calledWith(1150, 23, false));
    });
  });
});
