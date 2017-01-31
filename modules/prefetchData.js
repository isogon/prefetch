import values from 'lodash/values';

export default function prefetchData({ components = [], ...rest }) {
  return components.reduce((promise, component) => {
    if (typeof component === 'object') {
      return promise.then(() => prefetchData({ components: values(component), ...rest }));
    }

    if (component && component.prefetchData) {
      return promise.then(() => component.prefetchData(rest));
    }

    return promise;
  }, Promise.resolve());
}
