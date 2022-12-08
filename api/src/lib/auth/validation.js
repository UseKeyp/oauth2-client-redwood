import { AuthenticationError } from '@redwoodjs/graphql-server'

import { DISCORD } from 'src/lib/oAuth/providers/discord'
import { KEYP } from 'src/lib/oAuth/providers/keyp'

const APPROVED_LOGIN_PROVIDERS = [KEYP, DISCORD]

export const validateLoginRequest = ({ type }) => {
  if (!APPROVED_LOGIN_PROVIDERS.includes(type)) {
    throw new AuthenticationError(
      `OAuth provider "${type}" not available for login.`
    )
  }
}
