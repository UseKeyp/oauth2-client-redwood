import fetch from 'cross-fetch'

import { db } from 'src/lib/db'
import { encodeBody, getExpiration } from 'src/lib/oAuth/helpers'
import Sentry from 'src/lib/sentry'

export const COINBASE = 'COINBASE'
export const COINBASE_OAUTH_URL_AUTHORIZE =
  'https://www.coinbase.com/oauth/authorize'

const COINBASE_OAUTH_URL_TOKEN = 'https://www.coinbase.com/oauth/token'
const COINBASE_SCOPE =
  'wallet:accounts:read,wallet:accounts:create,wallet:addresses:read,wallet:addresses:create,wallet:user:email'
const COINBASE_REDIRECT_URI = process.env.APP_DOMAIN + '/redirect/coinbase'

const responseType = 'code'
const params = {
  client_id: process.env.COINBASE_CLIENT_ID,
  scope: COINBASE_SCOPE,
  redirect_uri: COINBASE_REDIRECT_URI,
  referral: 'gallag_jq',
  account_currency: 'ETH',
}

export const onSubmitCode = async (code, { memberId }) => {
  try {
    const body = {
      grant_type: 'authorization_code',
      client_id: process.env.COINBASE_CLIENT_ID,
      client_secret: process.env.COINBASE_CLIENT_SECRET,
      redirect_uri: COINBASE_REDIRECT_URI,
      code,
    }
    const encodedBody = encodeBody(body)
    const response = await fetch(COINBASE_OAUTH_URL_TOKEN, {
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
    const userDetails = await fetch('https://api.coinbase.com/v2/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'CB-VERSION': '2022-11-22',
      },
    }).then((res) => {
      if (res.status != 200)
        throw 'Coinbase authorization failed, or secret invalid'
      return res.json()
    })
    const accounts = await fetch(`https://api.coinbase.com/v2/accounts/ETH`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'CB-VERSION': '2022-11-22',
      },
    }).then((res) => {
      if (res.status != 200) throw "Couldn't get ETH account on Coinbase"
      return res.json()
    })
    const ethAccount = accounts.data
    const addresses = await fetch(
      `https://api.coinbase.com/v2/accounts/${ethAccount.id}/addresses`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'CB-VERSION': '2022-11-22',
        },
      }
    ).then((res) => {
      if (res.status != 200) throw "Could't get ETH addresses from Coinbase"
      return res.json()
    })
    let address = addresses.data[0].address
    if (!address) {
      const newAddress = await fetch(
        `https://api.coinbase.com/v2/accounts/${ethAccount.id}/addresses`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'CB-VERSION': '2022-11-22',
          },
        }
      ).then((res) => {
        if (res.status != 201) throw "Couldn't create ETH address on Coinbase"
        return res.json()
      })
      address = newAddress.data.address
    }
    await db.ramp.create({
      data: {
        address,
        email: userDetails.data.email,
        type: COINBASE,
        accessToken,
        refreshToken,
        member: { connect: { id: memberId } },
      },
    })
    // NOTE you may need to modify return value here:
    // for authentication - return the user object
    // for authorization - return { status: 'SUCCESS' }
    return { status: 'SUCCESS' }
  } catch (e) {
    Sentry.captureException(e)
    throw `onConnected() ${e}`
  }
}

export const provider = {
  urlAuthorize: COINBASE_OAUTH_URL_AUTHORIZE,
  params,
  onSubmitCode,
  onConnected,
  responseType,
}
