import { handleCoinbaseLogin } from './coinbase'
jest.setTimeout(20000)

describe('coinbaseLoginUrl', () => {
  scenario('Happy case', async () => {
    await handleCoinbaseLogin({
      accessToken: process.env.TEST_COINBASE_AUTH_TOKEN,
    })
  })
})
