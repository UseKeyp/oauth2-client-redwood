import { AuthenticationError } from '@redwoodjs/graphql-server'

import { DISCORD } from 'src/lib/oAuth/providers/discord'
import { NODE_OIDC } from 'src/lib/oAuth/providers/node-oidc'

const APPROVED_LOGIN_PROVIDERS = [DISCORD, NODE_OIDC]

export const validateLoginRequest = ({ type }) => {
  if (!APPROVED_LOGIN_PROVIDERS.includes(type)) {
    throw new AuthenticationError(
      `OAuth provider "${type}" not available for login.`
    )
  }
}
