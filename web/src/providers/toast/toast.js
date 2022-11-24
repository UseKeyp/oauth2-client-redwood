import { Toaster, ToastBar, toast, useToasterStore } from '@redwoodjs/web/toast'

import LoadingDots from 'src/components/LoadingDots'

const ToastContext = React.createContext({
  mintStatus: null,
  mintError: null,
})

// https://react-hot-toast.com/docs/toaster

const ToastProvider = ({ children }) => {
  const { toasts } = useToasterStore()
  // const { toasts } = useToaster();
  // toast() - Text only, no icon shown
  // toast.success() - Checkmark icon with text
  // toast.error() - X icon with text
  // toast.loading() - Spinner icon, will show for 30 seconds by default, or until dismissed via toast.dismiss(toastId)
  // toast.promise() - Spinner icon, displays until the Promise resolves

  return (
    <ToastContext.Provider
      value={{
        toast,
        toasts,
      }}
    >
      <Toaster
        position="top-right"
        // containerStyle={{
        // bottom: 100,
        // }}
        toastOptions={{
          className: '',
          style: {
            // border: '1px solid #713200',
            // padding: '16px',
            color: '#000',
            fontSize: '14px',
          },
          success: { duration: 5000 },
          error: { duration: 10000 },
        }}
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <>
                <div className="mr-2">
                  {t.type === 'loading' ? <LoadingDots /> : icon}
                </div>
                {message}
                {t.type === 'loading' && (
                  <button className="ml-2" onClick={() => toast.dismiss(t.id)}>
                    X
                  </button>
                )}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>
      {children}
    </ToastContext.Provider>
  )
}

const useToast = () => React.useContext(ToastContext)

export { ToastProvider, useToast }
