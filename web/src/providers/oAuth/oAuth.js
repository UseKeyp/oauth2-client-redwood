import { useMutation } from '@apollo/client'

import { isBrowser } from '@redwoodjs/prerender/browserUtils'

import { useToast } from 'src/providers/toast'
import popupLoadingHtml from 'src/utils/popupLoadingHtml'

import {
  OAUTH_URL_MUTATION,
  OAUTH_CODE_GRANT_MUTATION,
  OAUTH_REVOKE_MUTATION,
} from './graphql'

const OAuthContext = React.createContext({
  isLoading: true,
})

const OAuthProvider = ({ children }) => {
  const { toast } = useToast()
  const [state, setState] = React.useState({})

  const [oAuthUrlMutation] = useMutation(OAUTH_URL_MUTATION)
  const [codeGrantMutation] = useMutation(OAUTH_CODE_GRANT_MUTATION)
  const [revokeMutation] = useMutation(OAUTH_REVOKE_MUTATION)

  const getOAuthUrl = async (type) => {
    try {
      if (!type) throw 'No type provided'
      setState({ isLoading: true })
      const { data, error } = await oAuthUrlMutation({
        variables: { type },
      })
      if (error) throw error
      setState({})
      return data.oAuthUrl
    } catch (e) {
      const errorMessage = `getOAuthUrl() Error fetching ${type}. ${e?.message}`
      return setState({ error: errorMessage, isLoading: false })
    }
  }
  const openOAuthUrl = async (type) => {
    let myWindow
    try {
      if (isBrowser) {
        myWindow = window.open(
          '',
          '_blank',
          'width=600,height=1000,toolbar=yes,location=yes,directories=yes,status=yes,menubar=yes,scrollbars=yes,copyhistory=yes,resizable=yes'
        )
        myWindow.document.write(popupLoadingHtml)
        const oAuthUrl = await getOAuthUrl(type)
        myWindow.location = oAuthUrl.url
      }
    } catch (e) {
      setState({ error: e?.message, isLoading: false })
      myWindow.document.write(
        `<h3>Oops! An error occured<br/><br/>Sending you back...</h3><p>${e?.message}</p>`
      )
      setTimeout(() => {
        myWindow.close()
      }, 3000)
    }
  }
  const revokeOAuth = async (type) => {
    try {
      const { error } = await revokeMutation({
        variables: { type },
      })
      if (error) throw error
      return true
    } catch (e) {
      toast.error(e?.message)
      setState({ error: e?.message, isLoading: false })
      return false
    }
  }

  const submitCodeGrant = async ({ code, grantState, type, accountId }) => {
    try {
      const { data } = await codeGrantMutation({
        variables: {
          type: type.toUpperCase(),
          code,
          state: grantState,
          accountId,
        },
      })
      const { codeGrant } = data
      console.log(codeGrant)
      if (codeGrant.status === 'SUCCESS') {
        setState({ isLoading: false })
        return {
          data: codeGrant,
          successMessage: 'Great - connection complete!',
        }
      } else {
        const errorMessage = 'Something went wrong'
        setState({ isLoading: false, error: errorMessage })
        return { error: errorMessage }
      }
    } catch (error) {
      setState({ isLoading: false, error: error.message })
      return { error: error.message }
    }
  }

  return (
    <OAuthContext.Provider
      value={{
        isLoading: state.isLoading,
        error: state.error,
        getOAuthUrl,
        openOAuthUrl,
        submitCodeGrant,
        revokeOAuth,
      }}
    >
      {children}
    </OAuthContext.Provider>
  )
}

const useOAuth = () => React.useContext(OAuthContext)

export { OAuthProvider, useOAuth }
