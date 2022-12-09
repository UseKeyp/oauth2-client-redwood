# React Context in RedwoodJS

> A simple and scalable pattern for using React Context in RedwoodJS and the associated Storybook setup.

If you're reading this, it means you're quickly progressing in your knowledge of RedwoodJS, so congrats! Let's go deeper into uncharted territory, fellow pioneer.

The purpose of React Context is to provide a local store of variables in your app. However, if you're planning to use Storybook (duh!), then you'll need to do a bit of extra leg-work for Context to work there too.

Nothing here is "new" in the world of React development, but rather opinions and organization that will hopefully save you (and my future self) 30 minutes of time. Comments and suggestions are always welcome.

- Just getting started with Storybook & mocking? Start here [RW Docs - Introduction to Storybook](https://learn.redwoodjs.com/docs/tutorial2/introduction-to-storybook)
- Looking to mock `currentUser` instead? See [RW Docs - Mocking currentUser for Storybook](https://learn.redwoodjs.com/docs/tutorial2/role-based-authorization-control-rbac/#mocking-currentuser-for-storybook)

## Create the Context

For each "chunk" of your app, create a new context file. This pattern is recommended in the Storybook Docs.

> "We recommend dividing context containers up over specific pages or views in your app" [Storybook Docs - Context mocking](https://storybook.js.org/docs/react/workflows/build-pages-with-storybook)

In the simplified example here, I have a "Games" component which will have several children that all rely on the same variables from context. I'll create a single context for this chunk called `GamesContext`.

```js
// web/src/providers/context/GamesContext.js
const GamesContext = React.createContext()

const GamesContextProvider = ({ children }) => {
  const [state, setState] = React.useState({})
  return (
    <GamesContext.Provider value={[state, setState]}>
      {children}
    </GamesContext.Provider>
  )
}

export { GamesContext, GamesContextProvider }
```

Now, we need a way to add the provider(s) to our Redwood app. Rather than clutter `App.js` each time we create a new context, lets create a single component to wrap up all the contexts we need, like so:

```js
// web/src/providers/context/index.js
import { GamesContextProvider } from './GamesContext'

const AllContextProviders = ({ children }) => {
  // Add additional context providers here
  return <GamesContextProvider>{children}</GamesContextProvider>
}

export default AllContextProviders
```

Doing it this way makes it easy to update as our app grows, and we start needing additional context provider.

## Add Context to App & Storybook

Now lets inject our context providers into the app:

```js
// web/src/App.js
import AllContextProviders from 'src/providers/context'
// ...

const App = () => (
  <FatalErrorBoundary page={FatalErrorPage}>
    <RedwoodProvider titleTemplate="%PageTitle | %AppTitle">
      <RedwoodApolloProvider>
        <AllContextProviders>
          <Routes />
        </AllContextProviders>
      </RedwoodApolloProvider>
    </RedwoodProvider>
  </FatalErrorBoundary>
)
```

We also need include all context providers in each Storybook story as well. Eventually we will override some of these, but its important to have a "fallback" provider, otherwise our stories will break!

```js
// web/config/storybook.preview.js
import React from 'react'
import AllContextProviders from '../src/providers/context'

export const decorators = [
  (Story) => (
    <AllContextProviders>
      <Story />
    </AllContextProviders>
  ),
]
```

## Using Context

Now you can use the context in your components:

```js
// web/src/components/Games/Games.js
import { GamesContext } from 'src/providers/context/GamesContext'

const MINTING = 'minting'

const Games = () => {
  const [context, setContext] = React.useContext(GamesContext)
  const { mintingStatus } = context

  const onMint = () => {
    setContext({ ...context, mintingStatus: MINTING })
  }

  if (mintingStatus === MINTING) return <>Minting in progress...</>
  return <button onClick={onMint}>Mint!</button>
}

export default Games
```

## Writing Stories

Finally, we can create stories, while providing our own context.

- The `beforeMint` story renders properly with `mintStatus` as `undefined`, since we are using the "fallback" context provider in `storybook.preview.js`.
- In the `minting` story, we "override" the context provider, and can set `mintingStatus` as desired.

```js
import Games from './Games'

import { GamesContext } from 'src/providers/context/GamesContext'
const MINTING = 'minting'

export const beforeMint = () => {
  return <Games />
}

export const minting = () => {
  return (
    <GamesContext.Provider value={[{ mintingStatus: MINTING }, () => {}]}>
      <Games />
    </GamesContext.Provider>
  )
}

export default { title: 'Components/Games' }
```

Great you've got stories using context now!

If we want our story to be able to use `setContext`, we'll need to pass a real function instead of the placeholder.

```js
export const minting = () => {
  const [mockContext, setMockContext] = React.useState({
    mintingStatus: MINTING,
  })
  return (
    <GamesContext.Provider
      value={[{ mintingStatus: mockContext.mintingStatus }, setMockContext]}
    >
      <Games />
    </GamesContext.Provider>
  )
}
```

Here we have a mock function to allow updating context. This should be enough to get you started in the right direction! Good luck fellow Redwood pioneers!

-pi0neerpat
