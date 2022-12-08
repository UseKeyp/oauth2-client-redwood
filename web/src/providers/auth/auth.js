import { AuthProvider as RedwoodAuthProvider } from '@redwoodjs/auth'
import { toast } from '@redwoodjs/web/toast'

import { getErrorResponse } from 'src/utils/helpers'

export const logIn = async (attributes) => {
  console.log(attributes)
  try {
    /* eslint-disable-next-line no-undef */
    const { type, code, state } = attributes
    // eslint-disable-next-line no-undef
    const response = await fetch(global.RWJS_API_DBAUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state, type, method: 'login' }),
    })
    return await response.json()
  } catch (e) {
    /* eslint-disable-next-line no-console */
    const errorMessage = getErrorResponse(`${e}.`, 'logIn').error.message
    toast.error(errorMessage)
    /* eslint-disable-next-line no-console */
    console.log(errorMessage)
  }
}

const logout = async () => {
  try {
    /* eslint-disable-next-line no-undef */
    await fetch(global.RWJS_API_DBAUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'logout' }),
    })
  } catch (e) {
    /* eslint-disable-next-line no-console */
    const errorMessage = getErrorResponse(`${e}.`, 'logout').error.message
    toast.error(errorMessage)
    /* eslint-disable-next-line no-console */
    console.log(errorMessage)
  }
}

const signUp = async ({ type }) => {
  try {
    /* eslint-disable-next-line no-undef */
    const response = await fetch(global.RWJS_API_DBAUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    if (response.url) {
      window.location = response.url
    } else {
      toast.error('Something went wrong')
    }
  } catch (e) {
    /* eslint-disable-next-line no-console */
    const errorMessage = getErrorResponse(`${e}.`, 'signUp').error.message
    toast.error(errorMessage)
    /* eslint-disable-next-line no-console */
    console.log(errorMessage)
  }
}
class ExtendedRedwoodAuthProvider extends RedwoodAuthProvider {
  constructor(props) {
    super(props)
    // NOTE: this no longer works. Needs fixing or removed in favor of eg:
    // import { logIn } from 'src/providers/auth'
    this.rwClient.logIn = logIn
    this.rwClient.logout = logout
    this.rwClient.signUp = signUp
  }
}

const AuthProvider = ({ children }) => {
  return (
    <ExtendedRedwoodAuthProvider
      type="dbAuth"
      config={{ fetchConfig: { credentials: 'include' } }}
    >
      {children}
    </ExtendedRedwoodAuthProvider>
  )
}

export default AuthProvider
