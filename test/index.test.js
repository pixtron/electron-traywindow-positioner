const { assert } = require('chai');
const sinon = require('sinon');

const positioner = require('../index.js');

const BrowserWindowMock = require('./mocks/electron/BrowserWindow.js');
const ScreenMock = require('./mocks/electron/ScreenMock.js');
const displayFactory = require('./mocks/electron/displayFactory.js');

const sandbox = sinon.createSandbox();

describe('positioner', () => {
  let getDisplayStub;

  beforeEach(() => {
    getDisplayStub = sandbox.stub(positioner, '_getDisplay').returns(displayFactory('bottom'));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('.getTaskbarPosition', () => {
    it('should return top if taskbar is on top', () => {
      getDisplayStub.returns(displayFactory('top'));

      const result = positioner.getTaskbarPosition();
      assert.equal(result, 'top');
    });

    it('should return bottom if taskbar is on bottom', () => {
      getDisplayStub.returns(displayFactory('bottom'));

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

    it('should return top if taskbar is at top on a secondary screen above primary screen', () => {
      getDisplayStub.returns({
        bounds: { x: 0, y: -768, width: 1024, height: 768 },
        workArea: { x: 0, y: -745, width: 1024, height: 745 },
      });

      const result = positioner.getTaskbarPosition();
      assert.equal(result, 'top');
    });

    it('should return top if taskbar is at top on a secondary screen right of and slightly above primary screen', () => {
      getDisplayStub.returns({
        bounds: { x: 1024, y: -73, width: 1024, height: 768 },
        workArea: { x: 1024, y: -50, width: 1024, height: 745 },
      });

      const result = positioner.getTaskbarPosition();
      assert.equal(result, 'top');
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
      getDisplayStub.returns(displayFactory('bottom'));

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
      getDisplayStub.returns(displayFactory('bottom'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 1240, y: 880, width: 20, height: 20 };

      const result = positioner.calculate(trayWindowBounds, trayBounds, { x: 'left' });

      assert.deepEqual(result, { x: 1060, y: 777 });
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

    it('should calculate the correct alignment if alignment is center on a screen left to secondary', () => {
      getDisplayStub.returns(displayFactory('top', 'sec-left'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: -200, y: 0, width: 20, height: 20 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'center');

      assert.equal(result, -290);
    });

    it('should calculate the correct alignment if alignment is center on a screen right to secondary', () => {
      getDisplayStub.returns(displayFactory('top', 'sec-right'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 2680, y: 0, width: 20, height: 20 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'center');

      assert.equal(result, 2590);
    });

    it('should calculate the correct alignment if alignment is left', () => {
      getDisplayStub.returns(displayFactory('top'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 1240, y: 0, width: 20, height: 20 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'left');

      assert.equal(result, 1060);
    });

    it('should calculate the correct alignment if alignment is left on a screen left to secondary', () => {
      getDisplayStub.returns(displayFactory('top', 'sec-left'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: -200, y: 0, width: 20, height: 20 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'left');

      assert.equal(result, -380);
    });

    it('should calculate the correct alignment if alignment is left on a screen right to secondary', () => {
      getDisplayStub.returns(displayFactory('top', 'sec-right'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 2680, y: 0, width: 20, height: 20 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'left');

      assert.equal(result, 2500);
    });

    it('should calculate the correct alignment if alignment is right', () => {
      getDisplayStub.returns(displayFactory('top'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 1240, y: 0, width: 20, height: 20 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'right');

      assert.equal(result, 1240);
    });

    it('should calculate the correct alignment if alignment is right on a screen left to secondary', () => {
      getDisplayStub.returns(displayFactory('top', 'sec-left'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: -200, y: 0, width: 20, height: 20 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'right');

      assert.equal(result, -200);
    });

    it('should calculate the correct alignment if alignment is right on a screen right to secondary', () => {
      getDisplayStub.returns(displayFactory('top', 'sec-right'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 2680, y: 0, width: 20, height: 20 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'right');

      assert.equal(result, 2680);
    });

    it('should not calculate a position where window overlaps on right', () => {
      getDisplayStub.returns(displayFactory('top'));

      const trayWindowBounds = { x: 0, y: 0, width: 300, height: 100 };
      const trayBounds = { x: 1240, y: 0, width: 20, height: 20 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'right');

      assert.equal(result, 960);
    });

    it('should not calculate a position where window overlaps on right on a screen left to secondary', () => {
      getDisplayStub.returns(displayFactory('top', 'sec-left'));

      const trayWindowBounds = { x: 0, y: 0, width: 300, height: 100 };
      const trayBounds = { x: -200, y: 0, width: 20, height: 20 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'right');

      assert.equal(result, -480);
    });

    it('should not calculate a position where window overlaps on right on a screen right to secondary', () => {
      getDisplayStub.returns(displayFactory('top', 'sec-right'));

      const trayWindowBounds = { x: 0, y: 0, width: 300, height: 100 };
      const trayBounds = { x: 2680, y: 0, width: 20, height: 20 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'right');

      assert.equal(result, 2400);
    });

    it('should not calculate a position where window overlaps on left', () => {
      getDisplayStub.returns(displayFactory('top'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 20, y: 0, width: 20, height: 20 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'left');

      assert.equal(result, 20);
    });

    it('should not calculate a position where window overlaps on left on a screen left to secondary', () => {
      getDisplayStub.returns(displayFactory('top', 'sec-left'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: -1420, y: 0, width: 20, height: 20 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'left');

      assert.equal(result, -1420);
    });

    it('should not calculate a position where window overlaps on left on a screen right to secondary', () => {
      getDisplayStub.returns(displayFactory('top', 'sec-right'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 1460, y: 0, width: 20, height: 20 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'left');

      assert.equal(result, 1460);
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

describe('positioner._getDisplay', () => {
  afterEach(() => {
    sandbox.restore();
  });

  it('should call screen.getDisplayNearestPoint with x/y Point from trayBounds', () => {
    const screen = sinon.createStubInstance(ScreenMock);
    const trayBounds = { x: 1240, y: 5, width: 20, height: 20 };

    sandbox.stub(positioner, '_getScreen').returns(screen);

    sandbox.spy(screen.getDisplayNearestPoint);
    positioner._getDisplay(trayBounds);
    assert(screen.getDisplayNearestPoint.calledOnce);
    assert(screen.getDisplayNearestPoint.calledWith({ x: 1240, y: 5 }));
  });
});
