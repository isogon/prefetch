import React from 'react';
import { mount } from 'enzyme';
import entries from 'lodash/entries';

import { inject } from '../modules/Prefetcher';

const prefetchData = sinon.stub().returns(Promise.resolve());
const RouterContext = sinon.stub().returns(null);
const store = {};
const defaultProps = {
  prefetchedOnServer: true,
  location: { pathname: 'pathname' },
  render(props) {
    return <RouterContext {...props} />;
  },
};

const createTested = (props, spies) => {
  const ReduxPrefetcher = inject({ prefetchData, RouterContext });

  entries(spies).forEach(([key, value]) => {
    ReduxPrefetcher.prototype[key] = value;
  });

  return mount(
    <ReduxPrefetcher {...defaultProps} {...props} />,
    { context: { store } }
  );
};


describe('ReduxPrefetcher', () => {
  afterEach(() => {
    prefetchData.reset();
    RouterContext.reset();
  });

  describe('when prefetching data', () => {
    let wrapper;
    const promise = Promise.resolve();
    const nextProps = {
      foo: Math.random(),
      location: { pathname: Math.random() },
    };

    beforeEach(() => {
      prefetchData.returns(promise);
      wrapper = createTested();
      wrapper.setState({ isLoaded: true });

      // trigger a prefetch
      wrapper.setProps(nextProps);
    });

    it('sets [state] isLoaded to false', () => {
      expect(wrapper.state('isLoaded')).to.equal(false);
    });

    it('calls prefetchData with props and store', () => {
      const ctx = wrapper.context();
      expect(prefetchData).calledOnce.and.calledWith({
        ...defaultProps,
        ...nextProps,
        store: ctx.store,
      });
    });

    describe('when prefetch is complete', () => {
      beforeEach(() => promise);

      it('sets [state] propsToShow to expected props', () => {
        expect(wrapper.state('propsToShow')).to.deep.equal({
          ...defaultProps,
          ...nextProps,
        });
      });

      it('sets [state] isLoaded to true', () => {
        expect(wrapper.state('isLoaded')).to.equal(true);
      });
    });

    describe('when route changes during prefetch and the first prefetch resolves last', () => {
      const newRoute = () => ({ location: { pathname: Math.random() } });
      const lastRoute = { location: { pathname: Math.random() } };

      const slowPromise = new Promise((r) => setTimeout(r, 100));
      const fastPromise = Promise.resolve();

      beforeEach(() => {
        prefetchData.returns(slowPromise);
        wrapper.setProps({ ...nextProps, ...newRoute() });

        prefetchData.returns(Promise.resolve());
        wrapper.setProps({ ...nextProps, ...lastRoute });

        return fastPromise;
      });

      it('does not change state', () => {
        const expectedFinalState = wrapper.state();

        return slowPromise.then(() => {
          expect(wrapper.state()).to.equal(expectedFinalState);
        });
      });
    });
  });

  describe('when route changes', () => {
    let wrapper;
    const spy = sinon.spy();

    beforeEach(() => {
      wrapper = createTested(defaultProps, { prefetchData: spy });
      spy.reset();
    });

    it('prefetches', () => {
      const location = { pathname: Math.random() };
      const nextProps = { ...defaultProps, location };
      wrapper.setProps(nextProps);
      expect(spy).calledOnce.and.calledWith(nextProps);
    });
  });

  describe('when [state] propsToShow is set to a non null value', () => {
    let wrapper;
    const propsToShow = { foo: Math.random() };

    beforeEach(() => {
      wrapper = createTested();
      RouterContext.reset();
      wrapper.setState({ propsToShow });
    });

    it('renders the RouterContext', () => {
      expect(RouterContext).calledOnce.and.calledWith(propsToShow);
    });
  });

  describe('when [prop] prefetchedOnServer is true', () => {
    const props = { prefetchedOnServer: true };
    const spy = sinon.spy();
    let wrapper;

    beforeEach(() => {
      spy.reset();
      wrapper = createTested(props, { prefetchData: spy });
    });

    it('does not prefetches data', () => {
      expect(spy).to.not.have.been.called;
    });

    it('renders the RouterContext with [state] propsToShow', () => {
      const { propsToShow } = wrapper.state();
      expect(RouterContext).calledOnce.and.calledWith(propsToShow);
    });
  });

  describe('when [prop] prefetchedOnServer is false', () => {
    const spy = sinon.spy();
    const props = { prefetchedOnServer: false };
    let wrapper;

    beforeEach(() => {
      spy.reset();
      wrapper = createTested(props, { prefetchData: spy });
    });

    it('prefetches data', () => {
      expect(spy).calledOnce.and.calledWith(wrapper.props());
    });

    it('sets [state] isLoaded to false', () => {
      expect(wrapper.state('isLoaded')).to.equal(false);
    });

    it('sets [state] propsToShow to null', () => {
      expect(wrapper.state('propsToShow')).to.equal(null);
    });
  });

  it('only updates view when [state] propsToShow changes', () => {
    const spy = sinon.stub().returns(null);
    const wrapper = createTested(defaultProps, { render: spy });

    expect(spy).to.have.been.calledOnce;
    spy.reset();

    let propsToShow = { foo: Math.random() };

    wrapper.setState({ propsToShow });
    expect(spy, 'when propsToShow changes').to.have.been.calledOnce;
    spy.reset();

    wrapper.setState({ propsToShow });
    expect(spy, 'when propsToShow is identical').not.to.have.been.called;
    spy.reset();

    wrapper.setProps({ foo: 'bar' });
    expect(spy, 'when a [prop] is updated').not.to.have.been.called;
    spy.reset();

    wrapper.setState({ isLoaded: true });
    expect(spy, 'when [state] is updated').not.to.have.been.called;
    spy.reset();

    propsToShow = { foo: Math.random() };
    wrapper.setState({ propsToShow });
    expect(spy, 'when props to show changes').to.have.been.calledOnce;
    spy.reset();
  });
});
