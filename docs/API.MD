API
============

## `Prefetcher`
It delays route transition until all promises returned by prefetch methods of components defined within corresponding route are resolved or rejected.

#### Props
##### `components` (required)*

A list of react components (not component instances) corresponding to the current route. Usually provided by by `<Router>` or `match` from `react-router`.

##### `params` (required)*

Router params. Usually provided by `<Router>` or `match` from `react-router`.

##### `render` (required)*

Function that accepts props and uses them to render components. It defaults to:

##### `prefetchedOnServer`

Boolean that flags whether or not the data was prefetched on the server. Required for universal/isomorphic apps.

```js
const render = (props) => <RouterContext {...props} />
```

you can also use `applyRouterMiddleware`:

```js
// on the client
const render = applyRouterMiddleware(useScroll())
```

## `prefetch` decorator

```js
prefetch(actionCreator)
```

This function is used to decorate your container components that are connected to the router. It provides parameters for you to use in generating actions that you want dispatched before the route resolves.

```js
@asyncConnect(({ params }) => ({
  type: 'GET_TODO',
  payload: fetch(`/api/todos/${params.todo}`),
})
@connect((state, ownProps) => ({
  todo: state.todos.find(({ id }) => id === ownProps.params.id),
})
export default class Todo extends Component {
  // ...
}
```

`actionCreator` is a callback function which should return actions you want to dispatch. In order for prefetch to work, these actions must eventually return a promise (via whatever middleware you are using). The example above would work with [`redux-proimse`](https://github.com/acdlite/redux-promise)

#### On the server
The `actionCreator` callback will be called with whatever options you pass to it with `prefetchData`.

#### On the client
The `actionCreator` callback will be called with whatever props you pass to `<Prefetcher>` plus a reference to the store.

Given you use something like this:
```js
// on the server
prefetchData({ ...renderProps, store }).then(() => {
  // etc...
});

// on the client
const component = (
  <Router
    render={(props) => <ReduxAsyncConnect {...props} prefetchedOnServer />}
    history={history}
    routes={getRoutes(store)}
  />
);
```

Then the options would include the following keys
* **store** - Includes methods `dispatch` and `getState`
* **params** - The route params
* **matchContext**
* **router**
* **history**
* **location**
* **routes**


## `prefetchData`

Used to prefetch data on the server before rendering components.

### Arguments
*  **`options`** - Object containing all `renderProps` (typically provided by `match` from `react-router`) and your `redux` store.
