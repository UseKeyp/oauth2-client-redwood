import { routes, Link } from '@redwoodjs/router'

const DefaultLayout = ({ children, background }) => {
  return (
    <div className={background ? background : 'chess-background'}>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <div className="max-w-7xl mx-4 sm:mx-auto px-0 sm:px-4 sm:max-w-screen">
            <header className="relative mb-8 mt-4">
              {' '}
              <Link to={routes.home()}>Home</Link>
              <br />
              <Link to={routes.signin()}>Sign In</Link>
            </header>
            <div className="mx-4 min-h-screen mb-15 md:mb-0">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DefaultLayout
