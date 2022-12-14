import fetch from 'cross-fetch'
import { decode as decodeJwt } from 'jsonwebtoken'

import { isDevelopment } from 'src/lib/helpers'
import { logger } from 'src/lib/logger'
import { encodeBody, getExpiration } from 'src/lib/oAuth/helpers'

export const CHESS = 'CHESS'
export const CHESS_OAUTH_URL_AUTHORIZE = 'https://oauth.chess.com/authorize'

const CHESS_OAUTH_URL_TOKEN = 'https://oauth.chess.com/token'
const CHESS_SCOPE = 'openid profile games:read email'
const CHESS_REDIRECT_URI = process.env.APP_DOMAIN + '/redirect/chess'

const responseType = 'id_token'
const params = {
  client_id: process.env.CHESS_CLIENT_ID,
  scope: CHESS_SCOPE,
  redirect_uri: CHESS_REDIRECT_URI,
}

export const getChessBasicAuth = () =>
  Buffer.from(
    process.env.CHESS_BASIC_AUTH_USERNAME +
      ':' +
      process.env.CHESS_BASIC_AUTH_PASSWORD
  ).toString('base64')

const onSubmitCode = async (code, { codeVerifier, memberId }) => {
  try {
    const body = {
      grant_type: 'authorization_code',
      client_id: process.env.CHESS_CLIENT_ID,
      client_secret: process.env.CHESS_CLIENT_SECRET,
      redirect_uri: CHESS_REDIRECT_URI,
      code,
      code_verifier: codeVerifier,
    }
    const encodedBody = encodeBody(body)
    const response = await fetch(CHESS_OAUTH_URL_TOKEN, {
      method: 'post',
      body: encodedBody,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Basic auth required for oauth.chess-x.com development server
        ...(isDevelopment && {
          Authorization: `Basic ${getChessBasicAuth()}`,
        }),
      },
    }).then((res) => {
      if (res.status == 401)
        throw 'Chess.com basic authorization failed, or secret invalid'
      return res.json()
    })
    if (response.error)
      throw `${response.error} - ${response.hint}. ${response.message}`

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiration,
      id_token: idToken, // JWT that contains identity information about user
    } = response

    // Use to get your own CHESS_API_ACCESS_TOKEN for rate-limiting
    accessToken && logger.debug(`CHESS_API_ACCESS_TOKEN ${accessToken}`)

    if (!response.id_token) throw 'Failed to get id_token'
    const decoded = await decodeJwt(idToken)

    if (new Date() - new Date(decoded.iat * 1000) > 60 * 1000)
      throw 'id_token was not issued recently. It must be <1 minute old.'
    return {
      accessToken,
      accessTokenExpiration: getExpiration(expiration),
      refreshToken,
      idToken,
      decoded,
      idTokenExpiration: new Date(decoded.exp * 1000),
      memberId,
    }
  } catch (e) {
    throw `onSubmitCode() ${e}`
  }
}

export const refreshChessTokens = async (refreshToken) => {
  try {
    const body = {
      grant_type: 'refresh_token',
      client_id: process.env.CHESS_CLIENT_ID,
      client_secret: process.env.CHESS_CLIENT_SECRET,
      refresh_token: refreshToken,
      scope: CHESS_SCOPE,
    }
    const encodedBody = encodeBody(body)
    const response = await fetch(CHESS_OAUTH_URL_TOKEN, {
      method: 'post',
      body: encodedBody,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then((res) => {
      if (res.status == 401)
        throw new Error('Chess.com basic authorization failed')
      return res.json()
    })
    if (response.error)
      throw `${response.error} - ${response.hint}. ${response.message}`
    const {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_in: newExpiration,
      id_token: newIdToken, // JWT that contains identity information about user
    } = response
    if (!newAccessToken || !newRefreshToken || !newIdToken)
      throw 'Failed to refresh tokens from Chess.com'
    const newExpirationDate = getExpiration(newExpiration)
    const decoded = decodeJwt(newIdToken)
    const idTokenExpiration = new Date(decoded.exp * 1000)
    return {
      accessToken: newAccessToken,
      accessTokenExpiration: newExpirationDate,
      refreshToken: newRefreshToken,
      idToken: newIdToken,
      idTokenExpiration,
    }
  } catch (e) {
    throw `refreshChessTokens() ${e}`
  }
}

export const provider = {
  urlAuthorize: CHESS_OAUTH_URL_AUTHORIZE,
  params,
  onSubmitCode,
  responseType,
}
