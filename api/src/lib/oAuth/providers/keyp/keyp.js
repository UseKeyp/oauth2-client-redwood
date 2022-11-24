import fetch from 'cross-fetch'

import { db } from 'src/lib/db'
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
    const response = await fetch(KEYP_OAUTH_URL_TOKEN, {
      method: 'post',
      body: encodedBody,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then((res) => {
      if (res.status != 200)
        throw `Coinbase API failed for /token. ${res.status} - ${res.statusText}`
      return res.json()
    })
    if (response.error)
      throw `${response.error} - ${response.hint}. ${response.message}`

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiration,
    } = response

    if (!refreshToken) throw 'Failed to get refresh_token from Coinbase'
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

export const onConnected = async ({ accessToken, refreshToken, memberId }) => {
  try {
    const userDetails = await fetch('https://api.keyp.com/v2/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((res) => {
      if (res.status != 200)
        throw 'Coinbase authorization failed, or secret invalid'
      return res.json()
    })
    const accounts = await fetch(`https://api.keyp.com/v2/accounts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((res) => {
      if (res.status != 200)
        throw 'Coinbase authorization failed, or secret invalid'
      return res.json()
    })
    const ethAccount = accounts.data.find(
      (account) => account.currency === 'ETH'
    )
    const addresses = await fetch(
      `https://api.keyp.com/v2/accounts/${ethAccount.id}/addresses`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    ).then((res) => {
      if (res.status != 200)
        throw 'Coinbase authorization failed, or secret invalid'
      return res.json()
    })
    const address = addresses.data[0].address
    await db.ramp.create({
      data: {
        address,
        email: userDetails.data.email,
        type: KEYP,
        accessToken,
        refreshToken,
        member: { connect: { id: memberId } },
      },
    })
    return {
      status: 'SUCCESS',
    }
  } catch (e) {
    throw `onConnected() ${e}`
  }
}

export const provider = {
  urlAuthorize: KEYP_OAUTH_URL_AUTHORIZE,
  params,
  onSubmitCode,
  onConnected,
}
