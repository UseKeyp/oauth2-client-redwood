// In this file, all Page components from 'src/pages` are auto-imported. Nested
// directories are supported, and should be uppercase. Each subdirectory will be
// prepended onto the component name.
//
// Examples:
//
// 'src/pages/HomePage/HomePage.js'         -> HomePage
// 'src/pages/Admin/BooksPage/BooksPage.js' -> AdminBooksPage

import { Router, Route, Set, Private } from '@redwoodjs/router'

import DefaultLayout from 'src/layouts/DefaultLayout'
import AllContextProviders from 'src/providers'

const Routes = () => {
  return (
    <Router>
      <AllContextProviders>
        <Set wrap={DefaultLayout}>
          <Route path="/" page={HomePage} name="home" />
          <Route path="/signin" page={SignInPage} name="signin" />
          <Route notfound page={NotFoundPage} />
          <Private unauthenticated="signin">
            <Route path="/profile" page={ProfilePage} name="profile" />
          </Private>
        </Set>
      </AllContextProviders>
    </Router>
  )
}

export default Routes
