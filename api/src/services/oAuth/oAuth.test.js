import { oAuthUrl, codeGrant } from './oAuth'
import { COINBASE } from 'src/lib/oAuth/providers/coinbase'
import { PLAID, getSandboxPublicToken } from 'src/lib/oAuth/providers/plaid'
jest.setTimeout(60000)

/* eslint-disable no-console */
describe('coinbaseLoginUrl', () => {
  scenario('Happy case', async (scenario) => {
    mockCurrentUser(scenario.member.alice)
    const { url } = await oAuthUrl({ type: COINBASE })
    // console.log(url)
    // console.log(url.split('&'))
    expect(typeof url === 'string').toBe(true)
  })
})

describe('plaidConnection', () => {
  scenario('Get plaid link code', async (scenario) => {
    mockCurrentUser(scenario.member.alice)
    const { text } = await oAuthUrl({ type: PLAID })
    expect(typeof text === 'string').toBe(true)
  })
  scenario('Connect to wyre', async (scenario) => {
    mockCurrentUser(scenario.member.alice)
    const { code, accountId } = await getSandboxPublicToken()
    // console.log(code)
    // console.log(accountId)
    const response = await codeGrant({
      // code: 'public-sandbox-6b0baaac-50a0-4cc4-8c70-3f5c8cf577e2',
      // accountId: 'ywQkJpg4mmF5BopmR6evCKErg3Jd6pfWedyjW',
      code,
      accountId,
    })
    expect(typeof response.address === 'string').toBe(true)
  })
})
