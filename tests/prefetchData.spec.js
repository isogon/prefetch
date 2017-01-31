import prefetchData from '../modules/prefetchData';

const createTestComponent = () => {
  const test = { component() {} };
  test.component.prefetchData = () =>
    new Promise((resolve) =>
      setTimeout(() => {
        resolve();
        test.resolvedAt = Date.now();
      }, Math.random() * 10));

  return test;
};

const createTests = (n) =>
  new Array(n).fill().map((e, i) => createTestComponent(i));

const pad = (components) =>
  components.reduce((aggr, component) => branch(Math.random() > 0.5)
    .left([...aggr, component])
    .right([...aggr, component, () => {}]));

const layer = (components) =>
  components.reduce((layered, component, i) => branch(Math.random() > 0.5)
      .left([...layered, component])
      .right(branch(typeof layered[i - 1] !== 'object')
        .left([...layered, { [Math.random()]: component }])
        .right(() => {
          layered[i - 1][Math.random()] = component;
          return layered;
        })));

describe('prefetchData', () => {
  it('should be a function', () => {
    expect(prefetchData).to.be.a('function');
  });

  it('should deeply serialize async calls', () => {
    const tests = createTests(10);
    const components = layer(pad(tests.map((t) => t.component)));

    return prefetchData({ components }).then(() => {
      const expectedOrder = tests.map((t) => t.resolvedAt);
      const sortedByTimeResolved = tests.map((t) => t.resolvedAt).sort();

      expect(sortedByTimeResolved).to.deep.equal(expectedOrder);
    });
  });

  it('should inject dependencies', () => {
    const component = () => {};
    component.prefetchData = sinon.spy();
    const components = [component];
    const dependencies = { foo: Math.random() };

    return prefetchData({ components, ...dependencies }).then(() => {
      expect(component.prefetchData).to.have.been.calledWith(dependencies);
    });
  });
});
