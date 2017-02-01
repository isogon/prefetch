Prefetch for React Router and Redux
============
[![npm version](https://img.shields.io/npm/v/@isogon/prefetch.svg?style=flat-square)](https://www.npmjs.com/package/prefetch)
[![Build Status](https://travis-ci.org/isogon/prefetch.svg?branch=master)](https://travis-ci.org/isogon/prefetch)

Decorator and provider for handling async actions before route rendering in React.

```
yarn install prefetch
```

## Notice

Prefetch is inspired by [redux-connect](https://github.com/makeomatic/redux-connect)

## Usage

Prefetch is designed to work in combination with [redux](https://github.com/reactjs/redux) and [react-router](https://github.com/ReactTraining/react-router)


### Setup

```js
import { Prefetcher }  from 'redux-prefetcher';
```

All you have to do is render `Router` with Prefetcher middleware

```js
render((
  <Provider store={store}>
    <Router
      render={(props) => <Prefetcher {...props}/>}
      history={browserHistory}
    >
      <Route path="/" component={App}/>
    </Router>
  </Provider>
), el)
```
Prefetcher will watch for route changes, when they happen it will look for components used in that route that are wrapped with prefetch. If it finds any, it will block the display of those components until their prefetch actions are complete.

### Example


```js
```

#### Using [redux-promise](https://github.com/acdlite/redux-promise)

Create an action and prefetch will dispatch them for you. Prefetch will dispatch whatever you return. Either your promise middleware or your Thunk needs to finally return a promise.

[`redux-promise`](https://github.com/acdlite/redux-promise) returns promises by default so it works well with prefetch.

```js
import { connect } from 'react-redux';
import { prefetch } from 'redux-prefetcher';

@prefetch(() => ({
  type: 'GET_LUNCH',
  payload: Promise.resolve({
    name: 'Fish Tacos',
    from: 'The Fish Taco Store'
  })
}))
@connect((state) => ({
  lunch: state.lunch
}))
function App({ lunch }) {
  return (
    <h4>Lunch Time!</h4>
    <div>Looks like you are having {lunch.name} from {lunch.from}</div>
  );
}
```

If you want to use [`redux-thunk`](https://github.com/gaearon/redux-thunk), make sure to return a reference to your promise so that `prefetch` knows when your thunk is complete. That could look something like this.

```js
...

@prefetch(() => (dispatch) => Promise.resolve(dispatch({
  type: 'GET_LUNCH',
  payload: {
    name: 'Fish Tacos',
    from: 'The Fish Taco Store'
  }
}));

...

```

### Server Side rendering

Ideally you want to do all this asynchronous stuff on the server and preload all that data into state. There are only three things you need to do to get this to work.

1. Use the `prefetchData` helper method in your server code, It expects an object containing all `renderProps` and your `redux` store.
2. Use Prefetcher instead of `RoutingContext` and pass it `renderProps`
3. Set the `prefetchedOnServer` flag on both the client and server.


```js
import { renderToString } from 'react-dom/server'
import { match, RoutingContext } from 'react-router'
import { Prefetcher, prefetchData } from 'redux-prefetcher';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import serialize from 'serialize-javascript';


import lunchReducer from './lunchReducer';

app.get('*', (req, res) => {
  const store = createStore(combineReducers({ lunch: lunchReducer }));

  match({ routes, location: req.url }, (err, redirect, renderProps) => {

    // 1. load data
    prefetchData({ ...renderProps, store }).then(() => {

      // 2. use `Prefetcher` instead of `RoutingContext` and pass it `renderProps`
      const appHTML = renderToString(
        <Provider store={store} key="provider">
          <Prefetcher {...renderProps} prefetchedOnServer />
        </Provider>
      )

      // 3. render the Redux initial data into the server markup
      const html = createPage(appHTML, store)
      res.send(html)
    })
  })
})

function createPage(html, store) {
  return `
    <!doctype html>
    <html>
      <body>
        <div id="app">${html}</div>

        <!-- its a Redux initial data -->
        <script dangerouslySetInnerHTML={{__html: `window.__data=${serialize(store.getState())};`}} charSet="UTF-8"/>
      </body>
    </html>
  `
}

// on the client
const component = (
  <Provider store={store}>
    <Router
      render={(props) => <Prefetcher {...props} prefetchedOnServer />}
      history={history}
      children={routes}
    />
  </Provider>
);
```

## [API](/docs/API.MD)

## Notes

### Usage with `applyRouterMiddleware`

```js
// on the client
const render = applyRouterMiddleware(useScroll());
<Router
  render={(props) => <Prefetcher {...props} {render} />}
  history={history}
  routes={getRoutes(store)}
/>
```

Basically what you do is instead of using render method like:

```js
const render = props => <RouterContext {...props} />;
```

you use

```js
const render = applyRouterMiddleware(...middleware);
```


## Collaboration
You're welcome to PR, and we appreciate any questions or issues, please [open an issue](https://github.com/isogon/redux-prefetcher/issues)!
