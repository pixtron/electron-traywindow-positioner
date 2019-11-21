const { assert } = require('chai');
const sinon = require('sinon');

const positioner = require('../index.js');

const displayFactory = require('./mocks/electron/displayFactory.js');

const sandbox = sinon.createSandbox();

describe('positioner on linux', () => {
  let getDisplayStub;
  let getPlatformStub; // eslint-disable-line no-unused-vars
  let getCursorScreenPointStub;

  const unknownTrayBounds = { x: 0, y: 0, width: 0, height: 0 };

  beforeEach(() => {
    getCursorScreenPointStub = sandbox.stub().returns({ x: 500, y: 10 });
    sandbox.stub(positioner, '_getScreen').returns({
      getCursorScreenPoint: getCursorScreenPointStub,
    });

    getDisplayStub = sandbox.stub(positioner, '_getDisplay').returns(displayFactory('bottom'));
    getPlatformStub = sandbox.stub(positioner, '_getPlatform').returns('linux');
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
  });

  describe('.calculate', () => {
    it('should calculate the correct position when taskbar is on top', () => {
      getDisplayStub.returns(displayFactory('top'));
      getCursorScreenPointStub.returns({ x: 1240, y: 10 });

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };

      const result = positioner.calculate(trayWindowBounds, unknownTrayBounds);

      assert.deepEqual(result, { x: 1140, y: 23 });
    });

    it('should calculate the correct position when taskbar is at bottom', () => {
      getDisplayStub.returns(displayFactory('bottom'));
      getCursorScreenPointStub.returns({ x: 1240, y: 880 });

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };

      const result = positioner.calculate(trayWindowBounds, unknownTrayBounds);

      assert.deepEqual(result, { x: 1140, y: 777 });
    });

    it('should calculate the correct position when taskbar is at left', () => {
      getDisplayStub.returns(displayFactory('left'));
      getCursorScreenPointStub.returns({ x: 1240, y: 780 });

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };

      const result = positioner.calculate(trayWindowBounds, unknownTrayBounds);

      assert.deepEqual(result, { x: 23, y: 780 });
    });

    it('should calculate the correct position when taskbar is at right', () => {
      getDisplayStub.returns(displayFactory('right'));
      getCursorScreenPointStub.returns({ x: 1240, y: 780 });

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };

      const result = positioner.calculate(trayWindowBounds, unknownTrayBounds);

      assert.deepEqual(result, { x: 1217, y: 780 });
    });

    it('should allow to change the y align', () => {
      getDisplayStub.returns(displayFactory('right'));
      getCursorScreenPointStub.returns({ x: 1240, y: 780 });

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };

      const result = positioner.calculate(trayWindowBounds, unknownTrayBounds, { y: 'up' });

      assert.deepEqual(result, { x: 1217, y: 680 });
    });

    it('should allow to change the x align', () => {
      getDisplayStub.returns(displayFactory('bottom'));
      getCursorScreenPointStub.returns({ x: 1240, y: 880 });

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };

      const result = positioner.calculate(trayWindowBounds, unknownTrayBounds, { x: 'left' });

      assert.deepEqual(result, { x: 1040, y: 777 });
    });
  });

  describe('._calculateXAlign', () => {
    it('should calculate the correct alignment if alignment is center', () => {
      getDisplayStub.returns(displayFactory('top'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 1240, y: 10, width: 0, height: 0 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'center');

      assert.equal(result, 1140);
    });

    it('should calculate the correct alignment if alignment is left', () => {
      getDisplayStub.returns(displayFactory('top'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 1240, y: 0, width: 0, height: 0 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'left');

      assert.equal(result, 1040);
    });

    it('should calculate the correct alignment if alignment is right', () => {
      getDisplayStub.returns(displayFactory('top'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 1240, y: 0, width: 0, height: 0 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'right');

      assert.equal(result, 1240);
    });

    it('should not calculate a position where window overlaps on right', () => {
      getDisplayStub.returns(displayFactory('top'));

      const trayWindowBounds = { x: 0, y: 0, width: 300, height: 100 };
      const trayBounds = { x: 1240, y: 0, width: 0, height: 0 };

      const result = positioner._calculateXAlign(trayWindowBounds, trayBounds, 'right');

      assert.equal(result, 940);
    });

    it('should not calculate a position where window overlaps on left', () => {
      getDisplayStub.returns(displayFactory('top'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 20, y: 0, width: 0, height: 0 };

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
      const trayBounds = { x: 20, y: 120, width: 0, height: 0 };

      const result = positioner._calculateYAlign(trayWindowBounds, trayBounds, 'center');

      assert.equal(result, 70);
    });

    it('should calculate the correct alignment if alignment is up', () => {
      getDisplayStub.returns(displayFactory('right'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 20, y: 120, width: 0, height: 0 };

      const result = positioner._calculateYAlign(trayWindowBounds, trayBounds, 'up');

      assert.equal(result, 20);
    });

    it('should not calculate a position where window overlaps on top', () => {
      getDisplayStub.returns(displayFactory('right'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 160 };
      const trayBounds = { x: 20, y: 120, width: 0, height: 0 };

      const result = positioner._calculateYAlign(trayWindowBounds, trayBounds, 'up');

      assert.equal(result, 120);
    });

    it('should not calculate a position where window overlaps at bottom', () => {
      getDisplayStub.returns(displayFactory('right'));

      const trayWindowBounds = { x: 0, y: 0, width: 200, height: 100 };
      const trayBounds = { x: 20, y: 820, width: 0, height: 0 };

      const result = positioner._calculateYAlign(trayWindowBounds, trayBounds, 'down');

      assert.equal(result, 720);
    });
  });
});
