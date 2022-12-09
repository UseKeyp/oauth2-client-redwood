import { AuthProvider as RedwoodAuthProvider } from '@redwoodjs/auth'
import { toast } from '@redwoodjs/web/toast'

import { getErrorResponse } from 'src/utils/helpers'

const logIn = async (attributes) => {
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
    const errorMessage = getErrorResponse(`${e}.`, 'login').error.message
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

class ExtendedRedwoodAuthProvider extends RedwoodAuthProvider {
  constructor(props) {
    super(props)
    this.rwClient.login = logIn
    this.rwClient.logout = logout
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
