import { navigate, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

import { useRedirection } from 'src/providers/redirection'

const Redirect = ({ type }) => {
  const { errorMessage, successMessage, isLoading } = useRedirection()
  if (isLoading)
    return (
      <div className="min-w-full min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )

  let callToAction
  if (['chess', 'node_oidc', 'discord'].includes(type)) {
    if (successMessage) {
      callToAction = (
        <button
          to={routes.profile()}
          className="text-s mt-6"
          size="large"
          color="green"
        >
          See Profile
        </button>
      )
    } else {
      callToAction = (
        <button
          onClick={() => navigate(routes.signin())}
          className="text-s mt-6"
          size="large"
          color="green"
        >
          Try again
        </button>
      )
    }
  }
  return (
    <div className="flex flex-col min-h-screen chess-background">
      <div className="flex flex-grow flex-col w-full justify-center align-center items-center">
        <div className="redirect-container w-80 sm:w-96">
          <div className="redirect-contents w-full">
            <div
              className={`flex align-center bg-black p-4 rounded-lg border-2 border-${
                successMessage ? `green` : `[#FFBB0D]`
              }`}
            >
              <h3>{type}</h3>
            </div>
            <div className="mt-6 tracking-tight">
              {successMessage}
              {typeof errorMessage === 'string' ? (
                <>
                  <h2 className="mt-6 tracking-tight">
                    Oops - there was an issue
                  </h2>
                  <h3 className="mt-8 font-bold text-errorYellow">
                    {errorMessage.substring(0, 200)}
                  </h3>
                </>
              ) : null}
            </div>
            {callToAction || (
              <p className="mt-8 ">You will be redirected shortly</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const RedirectPage = ({ type, error }) => {
  return (
    <>
      <MetaTags title="Redirect" />
      <Redirect type={type} error={error} />
    </>
  )
}

export default RedirectPage
