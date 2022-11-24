import { verify as verifyJwt, decode as decodeJwt } from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'
import { promisify } from 'util'
import { AuthenticationError } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'
import productionJwks from 'src/lib/oAuth/jwks'
import {
  getChessBasicAuth,
  CHESS_OAUTH_URL,
} from 'src/lib/oAuth/providers/chess'
import { refreshDiscordTokens } from 'src/lib/oAuth/providers/discord'

export const getNewIdToken = async (userId) => {
  try {
    const { refreshToken } = await db.user.findUnique({
      where: { id: userId },
    })
    const { refreshToken: newRefreshToken, accessToken: newAccessToken } =
      await refreshDiscordTokens(refreshToken)
    await db.user.update({
      where: { id: userId },
      data: { refreshToken: newRefreshToken, accessToken: newAccessToken },
    })
    return newAccessToken
  } catch (e) {
    /* eslint-disable-next-line no-console */
    console.log(e)
    throw new AuthenticationError('getNewIdToken() Unable to refresh session')
  }
}

// NOTE: below is unused from Chess
const getKey = async (header) => {
  const client = jwksClient({
    jwksUri: `${CHESS_OAUTH_URL}/certs`,
    requestHeaders: { Authorization: `Basic ${getChessBasicAuth()}` },
    timeout: 30000, // Defaults to 30s
    getKeysInterceptor: () => productionJwks, // Checks production keys vefore jwksUri
  })
  const getPubKey = promisify(client.getSigningKey)
  const key = await getPubKey(header.kid)
  const pubKey = key.getPublicKey()
  return pubKey
}

export const verifyChessJwt = async (jwt) => {
  // Refresh if necessary
  let idToken = jwt
  let { header, payload } = decodeJwt(idToken, { complete: true })

  /* eslint-disable-next-line no-constant-condition */
  if (new Date(payload.exp * 1000) > new Date()) {
    idToken = await getNewIdToken(payload.user_id)
    ;({ header } = decodeJwt(idToken, { complete: true }))
  }

  const pubKey = await getKey(header)
  const decoded = verifyJwt(
    idToken,
    pubKey,
    { algorithms: ['RS256'] },
    (err, _decoded) => {
      if (err) throw err
      return _decoded
    }
  )
  return { decoded, newJwt: idToken }
}
