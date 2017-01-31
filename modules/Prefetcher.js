import React, { PropTypes, Component } from 'react';
import RouterContext from 'react-router/lib/RouterContext';

import prefetchData from './prefetchData';

// eslint-disable-next-line no-shadow
export const inject = ({ RouterContext, prefetchData }) =>
  class Prefetcher extends Component {
    static propTypes = {
      prefetchedOnServer: PropTypes.bool,
      location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
      render: PropTypes.func.isRequired,
    };

    static contextTypes = {
      store: PropTypes.object.isRequired,
    };

    static defaultProps = {
      render(props) {
        return <RouterContext {...props} />;
      },
    }

    constructor(props, context) {
      super(props, context);

      this.state = {
        propsToShow: props.prefetchedOnServer ? props : null,
        isLoaded: props.prefetchedOnServer, // check if first load is on the server
      };

      this.latestPrefetch = null;
    }

    componentDidMount() {
      if (!this.state.isLoaded) {
        this.prefetchData(this.props);
      }
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.location.pathname !== nextProps.location.pathname) {
        this.prefetchData(nextProps);
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
      return this.state.propsToShow !== nextState.propsToShow;
    }

    componentWillUnmount() {
      this.latestPrefetch = null;
    }

    prefetchData(props) {
      this.setState({ isLoaded: false });

      const prefetch = prefetchData({ ...props, store: this.context.store });
      this.latestPrefetch = prefetch;

      // Wait until the last triggered prefetch is resolved before updating state.
      // This prevents a potential race condition when a user who is navigating quickly ends up
      // on a new route before a previous routes prefetch as resolved.
      prefetch.then(() => {
        if (prefetch === this.latestPrefetch) {
          this.setState({ propsToShow: props, isLoaded: true });
        }
      });
    }

    render() {
      const { propsToShow } = this.state;
      return propsToShow && this.props.render(propsToShow);
    }
  };

export default inject({ RouterContext, prefetchData });
