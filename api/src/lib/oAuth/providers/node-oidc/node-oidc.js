import fetch from 'cross-fetch'

import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'
import { encodeBody, getExpiration } from 'src/lib/oAuth/helpers'

export const NODE_OIDC = 'NODE_OIDC'
const NODE_OIDC_API_DOMAIN = process.env.NODE_OIDC_API_DOMAIN

export const NODE_OIDC_OAUTH_URL_AUTHORIZE = `${NODE_OIDC_API_DOMAIN}/auth`

const NODE_OIDC_OAUTH_URL_TOKEN = `${NODE_OIDC_API_DOMAIN}/token`

const NODE_OIDC_SCOPE = 'openid profile email'
const NODE_OIDC_REDIRECT_URI = process.env.APP_DOMAIN + '/redirect/node_oidc'

const responseType = 'code'
const params = {
  client_id: process.env.NODE_OIDC_CLIENT_ID,
  scope: NODE_OIDC_SCOPE,
  redirect_uri: NODE_OIDC_REDIRECT_URI,
}

export const onSubmitCode = async (code, { memberId, codeVerifier }) => {
  try {
    const body = {
      grant_type: 'authorization_code',
      client_id: process.env.NODE_OIDC_CLIENT_ID,
      client_secret: process.env.NODE_OIDC_CLIENT_SECRET,
      redirect_uri: NODE_OIDC_REDIRECT_URI,
      code_verifier: codeVerifier,
      code,
    }
    const encodedBody = encodeBody(body)
    logger.debug({ custom: body }, '/token request body')
    const response = await fetch(NODE_OIDC_OAUTH_URL_TOKEN, {
      method: 'post',
      body: encodedBody,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then((res) => {
      if (res.status != 200)
        throw `NODE_OIDC API failed for /token. Returned ${res.status} - ${res.statusText}`
      return res.json()
    })
    if (response.error)
      throw `${response.error} - ${response.hint}. ${response.message}`

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiration,
    } = response

    if (!refreshToken) throw 'Failed to get refresh_token from NODE_OIDC'
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
    const userDetails = await fetch(`${NODE_OIDC_API_DOMAIN}/api/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((res) => {
      if (res.status != 200)
        throw 'NODE_OIDC authorization failed, or secret invalid'
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
  urlAuthorize: NODE_OIDC_OAUTH_URL_AUTHORIZE,
  params,
  onSubmitCode,
  onConnected,
  responseType,
}
