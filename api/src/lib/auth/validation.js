import { AuthenticationError } from '@redwoodjs/graphql-server'

import { KEYP } from 'src/lib/oAuth/providers/keyp'

const APPROVED_LOGIN_PROVIDERS = [KEYP]

export const validateLoginRequest = ({ type }) => {
  if (!APPROVED_LOGIN_PROVIDERS.includes(type)) {
    throw new AuthenticationError(
      `OAuth provider "${type}" not available for login.`
    )
  }
}
