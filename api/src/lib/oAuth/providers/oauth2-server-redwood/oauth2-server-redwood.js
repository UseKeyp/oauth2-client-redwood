import fetch from 'cross-fetch'
import { decode as decodeJwt } from 'jsonwebtoken'

import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'
import { encodeBody, getExpiration } from 'src/lib/oAuth/helpers'

export const OAUTH2_SERVER_REDWOOD = 'OAUTH2_SERVER_REDWOOD'
const OAUTH2_SERVER_REDWOOD_API_DOMAIN =
  process.env.OAUTH2_SERVER_REDWOOD_API_DOMAIN

export const OAUTH2_SERVER_REDWOOD_OAUTH_URL_AUTHORIZE = `${OAUTH2_SERVER_REDWOOD_API_DOMAIN}/auth`

const OAUTH2_SERVER_REDWOOD_OAUTH_URL_TOKEN = `${OAUTH2_SERVER_REDWOOD_API_DOMAIN}/token`

const OAUTH2_SERVER_REDWOOD_SCOPE = 'openid profile email offline_access'
const OAUTH2_SERVER_REDWOOD_REDIRECT_URI =
  process.env.APP_DOMAIN + '/redirect/oauth2_server_redwood'

const responseType = 'code'
const params = {
  client_id: process.env.OAUTH2_SERVER_REDWOOD_CLIENT_ID,
  scope: OAUTH2_SERVER_REDWOOD_SCOPE,
  redirect_uri: OAUTH2_SERVER_REDWOOD_REDIRECT_URI,
}

export const onSubmitCode = async (code, { codeVerifier }) => {
  try {
    const body = {
      grant_type: 'authorization_code',
      client_secret: process.env.OAUTH2_SERVER_REDWOOD_CLIENT_SECRET,
      client_id: process.env.OAUTH2_SERVER_REDWOOD_CLIENT_ID,
      redirect_uri: OAUTH2_SERVER_REDWOOD_REDIRECT_URI,
      code_verifier: codeVerifier,
      code,
    }
    const encodedBody = encodeBody(body)
    logger.debug({ custom: body }, '/token request body')
    const response = await fetch(OAUTH2_SERVER_REDWOOD_OAUTH_URL_TOKEN, {
      method: 'post',
      body: encodedBody,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then((res) => {
      if (res.status != 200)
        throw `OAUTH2_SERVER_REDWOOD API failed for /token. Returned ${res.status} - ${res.statusText}`
      return res.json()
    })
    if (response.error)
      throw `${response.error} - ${response.hint}. ${response.message}`

    const {
      access_token: accessToken,
      expires_in: expiration,
      id_token: idToken,
    } = response

    if (!response.id_token) throw 'Failed to get id_token'
    const decoded = await decodeJwt(idToken)

    logger.debug({ custom: response }, '/token response')
    logger.debug({ custom: decoded }, 'decoded id_token')

    if (new Date() - new Date(decoded.iat * 1000) > 60 * 1000)
      throw 'id_token was not issued recently. It must be <1 minute old.'

    return {
      accessToken,
      accessTokenExpiration: getExpiration(expiration),
      idToken,
      decoded,
      idTokenExpiration: new Date(decoded.exp * 1000),
    }
  } catch (e) {
    throw `onSubmitCode() ${e}`
  }
}

export const onConnected = async ({ accessToken, decoded }) => {
  try {
    const userDetails = await fetch(`${OAUTH2_SERVER_REDWOOD_API_DOMAIN}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((res) => {
      if (res.status != 200)
        throw 'OAUTH2_SERVER_REDWOOD authorization failed, or secret invalid'
      return res.json()
    })

    // Prevent token substitution attacks. See https://openid.net/specs/openid-connect-core-1_0.html#TokenSubstitution
    if (decoded.sub != userDetails.sub)
      throw "id_token's sub does not match userInfo"

    logger.debug({ custom: userDetails }, 'User info')

    const user = await db.user.upsert({
      update: { email: userDetails.email, accessToken },
      create: {
        id: userDetails.sub,
        email: userDetails.email,
        accessToken,
      },
      where: { id: userDetails.sub },
    })
    // NOTE you may need to modify return value here:
    // for authentication - return the user object
    // for authorization - return { status: 'SUCCESS' }
    return user
  } catch (e) {
    logger.error(e)
    throw `onConnected() ${e}`
  }
}

export const provider = {
  urlAuthorize: OAUTH2_SERVER_REDWOOD_OAUTH_URL_AUTHORIZE,
  params,
  onSubmitCode,
  onConnected,
  responseType,
}
