import fetch from 'cross-fetch'

import { AuthenticationError } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'
import { encodeBody, getExpiration } from 'src/lib/oAuth/helpers'
import Sentry from 'src/lib/sentry'

var path = require('path')

export const DISCORD = 'DISCORD'
const DISCORD_API_URL = 'https://discord.com/api/v9'

export const DISCORD_OAUTH_URL_AUTHORIZE =
  'https://discord.com/oauth2/authorize'

const DISCORD_OAUTH_URL_TOKEN = 'https://discord.com/api/oauth2/token'
const DISCORD_SCOPE = 'identify email'
const DISCORD_REDIRECT_URI = process.env.APP_DOMAIN + '/redirect/discord'

const responseType = 'code'
export const params = {
  client_id: process.env.DISCORD_CLIENT_ID,
  scope: DISCORD_SCOPE,
  redirect_uri: DISCORD_REDIRECT_URI,
}

export const onSubmitCode = async (code, { codeVerifier }) => {
  try {
    const body = {
      grant_type: 'authorization_code',
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      redirect_uri: DISCORD_REDIRECT_URI,
      code,
      code_verifier: codeVerifier,
    }
    const encodedBody = encodeBody(body)
    const response = await fetch(DISCORD_OAUTH_URL_TOKEN, {
      method: 'post',
      body: encodedBody,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then((res) => {
      if (res.status == 401)
        throw 'Discord.com basic authorization failed, or secret invalid'
      return res.json()
    })
    if (response.error)
      throw `${response.error} - ${response.hint}. ${response.message}`

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiration,
    } = response

    // Use to get your own DISCORD_ACCESS_TOKEN for testing purposes
    accessToken && logger.debug(`DISCORD_API_ACCESS_TOKEN ${accessToken}`)

    return {
      accessToken,
      accessTokenExpiration: getExpiration(expiration),
      refreshToken,
    }
  } catch (e) {
    throw `onSubmitCode() ${e}`
  }
}

export const refreshDiscordTokens = async (refreshToken) => {
  try {
    const body = {
      grant_type: 'refresh_token',
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      refresh_token: refreshToken,
      scope: DISCORD_SCOPE,
    }
    const encodedBody = encodeBody(body)
    const response = await fetch(DISCORD_OAUTH_URL_TOKEN, {
      method: 'post',
      body: encodedBody,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then((res) => {
      if (res.status == 401)
        throw new Error('Discord.com basic authorization failed')
      return res.json()
    })
    if (response.error)
      throw `${response.error} - ${response.hint}. ${response.message}`
    const {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_in: newExpiration,
    } = response
    if (!newAccessToken || !newRefreshToken)
      throw 'Failed to refresh tokens from Discord.com'
    const newExpirationDate = getExpiration(newExpiration)
    return {
      accessToken: newAccessToken,
      accessTokenExpiration: newExpirationDate,
      refreshToken: newRefreshToken,
    }
  } catch (e) {
    throw `refreshDiscordTokens() ${e}`
  }
}

export const onConnected = async ({ refreshToken, accessToken }) => {
  try {
    const userDetails = await fetchDiscord({ path: `users/@me`, accessToken })
    logger.debug({ custom: userDetails }, 'userDetails')
    if (!userDetails.verified)
      throw new AuthenticationError(
        `Verify your email with Discord and try again.`
      )

    /* eslint-disable camelcase */
    const { id, username, locale, avatar, mfa_enabled, email } = userDetails

    const userData = {
      accessToken,
      refreshToken,
      username,
      email,
      mfa_enabled,
      locale,
      imageSrc: `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`,
    }

    const user = await db.user.upsert({
      update: userData,
      create: { id, ...userData },
      where: { id },
    })
    logger.debug({ custom: user }, 'user')

    // NOTE you may need to modify return value here:
    // for authentication - return the user object
    // for authorization - return { status: 'SUCCESS' }
    return user
  } catch (e) {
    /* eslint-disable no-console */
    console.log(e)
    /* eslint-enable no-console */
    Sentry.captureException(e)
    throw `onConnected() error`
  }
}

export const fetchDiscord = async ({
  path: pathArg,
  body,
  method: methodArg,
  botToken,
  accessToken,
}) => {
  try {
    let method = 'GET'
    if (methodArg) method = methodArg
    if (!['POST', 'GET', 'DELETE', 'PUT', 'PATCH'].includes(method))
      throw 'Invalid method'
    if (!path) throw 'No path provided'
    const url = path.join(DISCORD_API_URL, pathArg)
    return await fetch(url, {
      method,
      body,
      headers: {
        ...(botToken && { Authorization: `Bot ${botToken}` }),
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        'Content-Type': 'application/json',
      },
    }).then((res) => {
      logger.debug({ custom: res }, 'fetchDiscord res')
      if (res.status !== 200) throw res
      return res.json()
    })
  } catch (e) {
    const errorMessage = `fetchDiscord() ${e}`
    /* eslint-disable-next-line no-console */
    console.error(e)
    logger.error(errorMessage)
    Sentry.captureException(errorMessage)
  }
}

export const provider = {
  urlAuthorize: DISCORD_OAUTH_URL_AUTHORIZE,
  params,
  onSubmitCode,
  onConnected,
  responseType,
}
