import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
  CountryCode,
} from 'plaid'

import { db } from 'src/lib/db'
import { isProduction } from 'src/lib/helpers'
import { logger } from 'src/lib/logger'
import Sentry from 'src/lib/sentry'
import {
  createPaymentMethodFromPlaid,
  attachBlockchainPaymentMethod,
} from 'src/lib/wyre'

export const PLAID = 'PLAID'
export const WYRE = 'WYRE'

const PLAID_SCOPE = [Products.Auth, Products.Identity]
const PLAID_REDIRECT_URI = isProduction
  ? process.env.APP_DOMAIN + '/redirect/plaid'
  : 'https://0.0.0.0:8910/redirect/plaid'

const PLAID_WEBHOOK_URL = isProduction
  ? 'https://treasure.chess.com/api/plaid'
  : 'https://tc-checkout-dev.ngrok.io/api/plaid'

const PLAID_AVAILABLE_LOCALE = {
  en: 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'en-GB-oed': 'en',
  'en-scouse': 'en',
  fr: 'fr',
  'sgn-FR': 'fr',
  'sgn-BE-fr': 'fr',
  es: 'es',
  'sgn-ES': 'es',
  'es-419': 'es',
  nl: 'nl',
  'sgn-NL': 'nl',
  de: 'de',
  'de-1901': 'de',
  'de-1996': 'de',
  'de-AT': 'de',
  'de-AT-1901': 'de',
  'de-AT-1996': 'de',
  'de-CH': 'de',
  'de-CH-1901': 'de',
  'de-CH-1996': 'de',
  'de-DE': 'de',
  'de-DE-1901': 'de',
  'de-DE-1996': 'de',
  'sgn-DE': 'de',
  'sgn-CH-de': 'de',
}

const getEnvironment = () => {
  if (process.env.ENVIRONMENT === 'staging') return 'development'
  else if (process.env.ENVIRONMENT === 'prod') return 'production'
  return 'sandbox'
}
const configuration = new Configuration({
  basePath: PlaidEnvironments[getEnvironment()],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_CLIENT_SECRET,
    },
  },
})
const client = new PlaidApi(configuration)

export const createPlaidLink = async () => {
  try {
    const request = {
      user: { client_user_id: context.currentUser.id },
      client_name: 'Treasure Chess',
      products: PLAID_SCOPE,
      language: PLAID_AVAILABLE_LOCALE[context.currentUser.locale] || 'en',
      webhook: PLAID_WEBHOOK_URL,
      redirect_uri: PLAID_REDIRECT_URI,
      country_codes: [CountryCode.Us], // TODO: How do we know this?
    }
    logger.debug({ custom: request }, 'createPlaidLink request')
    const response = await client.linkTokenCreate(request)
    logger.debug({ custom: response.data }, 'createPlaidLink response')
    const token = response?.data?.link_token
    if (response.status !== 200 || !token) throw 'No link token returned'
    return { text: token, type: 'code' }
  } catch (e) {
    logger.error(e)
    Sentry.captureException(e)
    throw `createPlaidLink() ${e}`
  }
}

const onSubmitCode = async ({ code, accountId }) => {
  try {
    /* eslint-disable camelcase*/
    const tokenResponse = await client.itemPublicTokenExchange({
      public_token: code,
    })
    const accessToken = tokenResponse.data.access_token
    return { accessToken, accountId }
  } catch (e) {
    logger.error(e)
    Sentry.captureException(e)
    throw `onSubmitCode() ${e}`
  }
}

const onConnected = async ({ accessToken, accountId }) => {
  try {
    const request = {
      access_token: accessToken,
      account_id: accountId,
      processor: 'wyre',
    }
    // Get the account nickname needed for wyre
    // TODO: Remove this old way for getting accounts once we remove
    // Identity product version below.
    // const { data: accountsResponse } = await client.accountsGet({
    //   access_token: accessToken,
    // })
    // const account = accountsResponse.accounts.find(
    //   (account) =>
    //     account.type === 'depository' &&
    //     ['checking', 'savings'].includes(account.subtype)
    // )
    // if (!account)
    //   throw 'No account found matching the criteria - checking or savings'
    // const accountNickname = `${account.name} - ${account.subtype}`
    const { data: identityResponse } = await client.identityGet({
      access_token: accessToken,
    })
    const itemId = identityResponse.item.item_id // For record-keeping purposes
    const account = identityResponse.accounts.find(
      (acc) => acc.account_id === accountId
    )
    const {
      owners,
      verification_status,
      mask,
      balances: { iso_currency_code },
    } = account
    const email = owners[0].emails.find((item) => item.primary).data
    const accountNickname = `${account.name} - ${account.subtype}`
    // Create a processor token for a specific account id.
    const processorTokenResponse = await client.processorTokenCreate(request)
    const processorToken = processorTokenResponse.data.processor_token
    // Pass processor token to Wyre
    const paymentMethod = await createPaymentMethodFromPlaid(processorToken)
    // Attach blockchain address to Payment Method
    const address = await attachBlockchainPaymentMethod(paymentMethod.id)
    // Save details to the user
    const ramp = await db.ramp.create({
      data: {
        address,
        email,
        itemId,
        mask,
        accountNickname,
        accountId,
        verificationStatus: verification_status,
        isoCurrencyCode: iso_currency_code,
        paymentMethodId: paymentMethod.id,
        type: WYRE,
        member: { connect: { id: context.currentUser.id } },
      },
    })
    return { status: 'SUCCESS', ramp }
  } catch (e) {
    Sentry.captureException(e)
    throw `onConnected() ${e}`
  }
}

export const provider = { onSubmitCode, onConnected }

// Used for testing purposes only in "sandbox" environment
export const getSandboxPublicToken = async () => {
  try {
    const publicTokenRequest = {
      institution_id: 'ins_132241',
      initial_products: PLAID_SCOPE,
    }
    const publicTokenResponse = await client.sandboxPublicTokenCreate(
      publicTokenRequest
    )
    const publicToken = publicTokenResponse.data.public_token
    const tokenResponse = await client.itemPublicTokenExchange({
      public_token: publicToken,
    })
    const accessToken = tokenResponse.data.access_token
    const { data: accountsResponse } = await client.accountsGet({
      access_token: accessToken,
    })
    const account = accountsResponse.accounts.find(
      (account) =>
        account.type === 'depository' &&
        ['checking', 'savings'].includes(account.subtype)
    )
    return { accountId: account.account_id, code: publicToken }
  } catch (e) {
    /* eslint-disable-next-line no-console */
    console.log(e)
  }
}
