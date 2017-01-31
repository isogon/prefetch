import prefetch from '../modules/prefetch';

const randomInt = () => Math.floor(Math.random() * 10);
const randomArray = () => new Array(randomInt()).fill(1).map(randomInt);
const testComponent = () => {};

describe('prefetch decorator', () => {
  const dispatch = sinon.stub();
  const actionCreator = sinon.stub();
  const prefetchData = prefetch(actionCreator)(testComponent).prefetchData;
  const deps = { store: { dispatch } };

  afterEach(() => {
    dispatch.reset();
    actionCreator.reset();
  });

  it('is a function', () => {
    expect(prefetch).to.be.a('function');
  });

  it('returns a closure', () => {
    expect(prefetch(actionCreator)).to.be.a('function');
  });

  it('complains if prefetch is not called with a function', () => {
    expect(prefetch).to.throw(/Prefetch decorator expects a function/);
  });

  describe('the returned closure', () => {
    it('takes a component and attaches the prefetchData method', () => {
      const wrapped = prefetch(actionCreator)(testComponent);
      expect(wrapped).to.contain.all.keys('prefetchData');
      expect(wrapped.prefetchData).to.be.a('function');
    });
  });

  describe('the prefetchData method', () => {
    it('injects depenencies', () => {
      prefetchData(deps);
      expect(actionCreator).calledOnce.and.calledWith(deps);
    });

    describe('when the injected action creator returns a single thing', () => {
      const toDispatch = Math.random();
      const dispatchValue = Math.random();

      beforeEach(() => {
        actionCreator.returns(toDispatch);
        dispatch.returns(dispatchValue);
      });

      it('dispatches the value of the actionCreator', () => {
        prefetchData(deps);

        expect(dispatch).calledOnce.and.calledWith(toDispatch);
      });

      it('returns a promise that resolves the value of dispatch', () => {
        expect(prefetchData(deps)).to.eventually.equal(dispatchValue);
      });
    });

    describe('when the injected action creator returns an array of things', () => {
      const toDispatch = randomArray();
      const dispatchValue = Math.random();

      beforeEach(() => {
        actionCreator.returns(toDispatch);
        dispatch.returns(dispatchValue);
      });

      it('dispatches each item in the array', () => {
        prefetchData(deps);

        expect(dispatch.callCount).to.equal(toDispatch.length);
        toDispatch.forEach((action, idx) => {
          expect(dispatch.getCall(idx).args[0]).to.equal(action);
        });
      });

      it('returns a promise that resolves to the value of each dispatch', () => {
        const expected = [...toDispatch].fill(dispatchValue);
        expect(prefetchData(deps)).to.eventually.deep.equal(expected);
      });
    });
  });
});
