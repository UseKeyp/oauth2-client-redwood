import fetch from 'cross-fetch'

import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'
import { encodeBody, getExpiration } from 'src/lib/oAuth/helpers'

export const KEYP = 'KEYP'
const KEYP_API_DOMAIN = process.env.KEYP_API_DOMAIN

export const KEYP_OAUTH_URL_AUTHORIZE = `${KEYP_API_DOMAIN}/oauth/authorize`

const KEYP_OAUTH_URL_TOKEN = `${KEYP_API_DOMAIN}/oauth/token`

const KEYP_SCOPE =
  'wallet:accounts:read,wallet:addresses:read,wallet:user:email'
const KEYP_REDIRECT_URI = process.env.APP_DOMAIN + '/redirect/keyp'

const params = {
  client_id: process.env.KEYP_CLIENT_ID,
  scope: KEYP_SCOPE,
  redirect_uri: KEYP_REDIRECT_URI,
  login_provider: 'discord', // TODO: remove this in favor of user-selection
}

export const onSubmitCode = async (code, { memberId }) => {
  try {
    const body = {
      grant_type: 'authorization_code',
      client_id: process.env.KEYP_CLIENT_ID,
      client_secret: process.env.KEYP_CLIENT_SECRET,
      redirect_uri: KEYP_REDIRECT_URI,
      code,
    }
    const encodedBody = encodeBody(body)
    logger.debug({ custom: body }, '/token body')
    const response = await fetch(KEYP_OAUTH_URL_TOKEN, {
      method: 'post',
      body: encodedBody,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then((res) => {
      if (res.status != 200)
        throw `Keyp API failed for /token. ${res.status} - ${res.statusText}`
      return res.json()
    })
    if (response.error)
      throw `${response.error} - ${response.hint}. ${response.message}`

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiration,
    } = response

    if (!refreshToken) throw 'Failed to get refresh_token from Keyp'
    return {
      accessToken,
      accessTokenExpiration: getExpiration(expiration),
      refreshToken,
      memberId,
    }
  } catch (e) {
    throw `onSubmitCode() ${e}`
  }
}

export const onConnected = async ({ accessToken, refreshToken }) => {
  try {
    const userDetails = await fetch(`${KEYP_API_DOMAIN}/api/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((res) => {
      if (res.status != 200)
        throw 'Keyp authorization failed, or secret invalid'
      return res.json()
    })
    logger.debug({ custom: userDetails }, 'userDetails')
    // For login-type oauth providers, create the user and return the object
    const user = await db.user.upsert({
      update: { username: userDetails.name, accessToken, refreshToken },
      create: {
        id: userDetails.user_id,
        username: userDetails.name,
        accessToken,
        refreshToken,
      },
      where: { id: userDetails.user_id },
    })
    return user
  } catch (e) {
    logger.error(e)
    throw `onConnected() ${e}`
  }
}

export const provider = {
  urlAuthorize: KEYP_OAUTH_URL_AUTHORIZE,
  params,
  onSubmitCode,
  onConnected,
}
