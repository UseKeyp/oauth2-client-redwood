import { OAuthProvider } from 'src/providers/oAuth'
import { RedirectionProvider } from 'src/providers/redirection'
import { ToastProvider } from 'src/providers/toast'

const AllContextProviders = ({ children }) => {
  // Add additional context providers here
  // This will be automatically injected in to the App and Storybook

  return (
    <>
      <ToastProvider>
        <OAuthProvider>
          <RedirectionProvider>{children}</RedirectionProvider>
        </OAuthProvider>
      </ToastProvider>
    </>
  )
}

export default AllContextProviders
