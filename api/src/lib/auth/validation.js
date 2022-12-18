import { AuthenticationError } from '@redwoodjs/graphql-server'

import { DISCORD } from 'src/lib/oAuth/providers/discord'
import { NODE_OIDC } from 'src/lib/oAuth/providers/node-oidc'
import { OAUTH2_SERVER_REDWOOD } from 'src/lib/oAuth/providers/oauth2-server-redwood'

const APPROVED_LOGIN_PROVIDERS = [DISCORD, NODE_OIDC, OAUTH2_SERVER_REDWOOD]

export const validateLoginRequest = ({ type }) => {
  if (!APPROVED_LOGIN_PROVIDERS.includes(type)) {
    throw new AuthenticationError(
      `OAuth provider "${type}" not available for login.`
    )
  }
}
