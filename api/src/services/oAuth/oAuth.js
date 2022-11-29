import {
  oAuthUrl as getOAuthUrl,
  processCodeGrant,
  processRevoke,
} from 'src/lib/oAuth'

export const oAuthUrl = ({ type }) => getOAuthUrl(type)

export const codeGrant = ({ state, code, type, accountId }) =>
  processCodeGrant({ state, code, type, accountId })

export const revokeOAuth = ({ type }) => processRevoke(type)
