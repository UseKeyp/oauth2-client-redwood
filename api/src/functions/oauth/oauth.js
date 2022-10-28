import { Provider } from 'oidc-provider'

import { logger } from 'src/lib/logger'

/**
 * The handler function is your code that processes http request events.
 * You can use return and throw to send a response or error, respectively.
 *
 * Important: When deployed, a custom serverless function is an open API endpoint and
 * is your responsibility to secure appropriately.
 *
 * @see {@link https://redwoodjs.com/docs/serverless-functions#security-considerations|Serverless Function Considerations}
 * in the RedwoodJS documentation for more information.
 *
 * @typedef { import('aws-lambda').APIGatewayEvent } APIGatewayEvent
 * @typedef { import('aws-lambda').Context } Context
 * @param { APIGatewayEvent } event - an object which contains information from the invoker.
 * @param { Context } context - contains information about the invocation,
 * function, and execution environment.
 */
export const handler = async (event, context) => {
  const configuration = {
    // ... see the available options in Configuration options section
    clients: [
      {
        client_id: 'foo',
        client_secret: 'bar',
        redirect_uris: ['http://lvh.me:8080/cb'],
        // + other client properties
      },
    ],
    // ...
  }

  const oidc = new Provider('http://localhost:8911/oauth', configuration)

  // express/nodejs style application callback (req, res, next) for use with express apps, see /examples/express.js
  oidc.callback()

  // koa application for use with koa apps, see /examples/koa.js
  oidc.app

  // or just expose a server standalone, see /examples/standalone.js
  const server = oidc.listen(3000, () => {
    console.log(
      'oidc-provider listening on port 3000, check http://localhost:3000/.well-known/openid-configuration'
    )
  })
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: 'oauth function',
    }),
  }
}
