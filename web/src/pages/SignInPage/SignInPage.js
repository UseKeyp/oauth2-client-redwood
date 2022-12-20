import { useEffect } from 'react'

import { useAuth } from '@redwoodjs/auth'
import { useParams, navigate, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

import { saveRedirectTo } from 'src/providers/redirection'
import { useToast } from 'src/providers/toast'

const LoginPortal = () => {
  const { signUp, isAuthenticated, reauthenticate } = useAuth()

  const { error, redirectTo } = useParams()
  const { toast } = useToast()
  const [errorText, setErrorText] = React.useState('')
  const getErrorText = (error) => {
    if (error === 'expired') return `Session expired, please log in again.`
  }

  const onSubmitSignUp = async (type) => {
    let parsedType = type
    let login_provider = ''
    if (type.includes('KEYP')) {
      parsedType = 'OAUTH2_SERVER_REDWOOD'
      login_provider = `&login_provider=${type.split('KEYP_')[1]}`
    }
    const response = await signUp({ type: parsedType })
    if (response.url) {
      window.location = response.url + login_provider
    } else {
      toast.error('Something went wrong')
    }
  }

  useEffect(() => {
    if (redirectTo) {
      saveRedirectTo(redirectTo) && reauthenticate()
    }
  }, [redirectTo, reauthenticate])

  useEffect(() => {
    if (error) setErrorText(getErrorText(error))
  }, [error])

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.profile())
    }
  }, [isAuthenticated])

  const getButton = (type, text) => (
    <button
      onClick={() => onSubmitSignUp(type)}
      className="login-button mt-2"
      size="small"
    >
      <div className="flex justify-center align-center items-center m-1">
        <span className="mr-2">{text}</span>
      </div>
    </button>
  )

  return (
    <div className="flex justify-center">
      <div className="login-portal-container w-80 sm:w-96">
        <h1 className="text-2xl tracking-tight font-extrabold text-gray-900 sm:text-3xl md:text-4xl">
          <span className="block xl:inline">Oauth2 Client Redwood</span>
        </h1>
        <div className="mt-6">
          <div className="mb-2">
            <h2 className="text-base font-bold color-grey-light text-center">
              Sign in
            </h2>
          </div>
        </div>

        <div className="login-portal-container--button-wrapper ">
          {getButton('NODE_OIDC', 'oidc-provider')}
          <br />
          {getButton('OAUTH2_SERVER_REDWOOD', 'oauth2-server-redwood')}
          <br />
          {getButton('DISCORD', 'Discord')}
          <br />
          {process.env.SHOW_KEYP_PROVIDERS && (
            <>
              <h4 className="text-base font-bold color-grey-light text-center">
                Keyp Providers
              </h4>
              {getButton('KEYP_DISCORD', 'Discord')}
              {getButton('KEYP_NODE_OIDC', 'oidc-provider')}
              {getButton('KEYP_GOOGLE', 'Google')}
            </>
          )}
          {errorText && <div className="mt-2 rw-cell-error">{errorText}</div>}
        </div>
        <div className="w-full text-center"></div>
        <h4 className="mt-6">
          <a className="mr-2 text-blue" href="/">
            Terms of Service
          </a>
          ·
          <a className="ml-2 text-blue" href="/">
            Privacy Policy
          </a>
        </h4>
      </div>
    </div>
  )
}

const SignInPage = () => {
  return (
    <>
      <MetaTags title="Sign In" description="Join to start collecting." />
      <LoginPortal />
    </>
  )
}

export default SignInPage
