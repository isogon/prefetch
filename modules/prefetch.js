import invariant from 'invariant';

export default function prefetch(actionCreator) {
  invariant(
    typeof actionCreator === 'function',
    'Prefetch decorator expects a function'
  );

  return (Component) => {
    Component.prefetchData = function injectOptions(options) {
      const { store: { dispatch } } = options;
      const toDispatch = actionCreator(options);

      if (Array.isArray(toDispatch)) {
        return Promise.all(toDispatch.map(dispatch));
      }

      return Promise.resolve(dispatch(toDispatch));
    };

    return Component;
  };
}
