/* eslint-disable-next-line no-unused-vars */
import { DbAuthHandler } from '@redwoodjs/api'
import { InputError } from '@redwoodjs/graphql-server'

import { validateLoginRequest } from 'src/lib/auth/validation'
import { db } from 'src/lib/db'
import { isProduction, cors } from 'src/lib/helpers'
import { logger } from 'src/lib/logger'
import { oAuthUrl, submitCodeGrant } from 'src/lib/oAuth'
import { providers } from 'src/lib/oAuth/providers'

export const handler = async (event, context) => {
  logger.debug('Invoked /auth ')
  const authHandler = new DbAuthHandler(event, context, {
    db: db,
    cors,
    authModelAccessor: 'user',
    authFields: {
      id: 'id',
      username: 'username',
    },
    login: {
      handler: (user) => {
        return user
      },
      errors: {
        usernameOrPasswordMissing: 'Both username and password are required',
        usernameNotFound: 'Username ${username} not found',
        incorrectPassword: 'Username ${username} not found',
      },
      // expires: 60 * 60, // 1 hour
      expires: 60 * 60 * 24 * 3, // 3 days
      // expires: 60 * 60 * 24 *30, // 30 days
    },
    signup: {
      handler: () => {
        throw new InputError('signUp is not implemented')
      },
    },
    forgotPassword: {
      // https://community.redwoodjs.com/t/v0-38-upgrade-guide/2501
      handler: () => null,
      expires: 60 * 60 * 24,
      errors: {
        usernameNotFound: 'Error',
        usernameRequired: 'Error',
      },
    },
    resetPassword: {
      handler: () => null,
      allowReusedPassword: false,
      errors: {
        resetTokenExpired: 'This reset token is old, try again',
        resetTokenInvalid: 'This reset token was not found',
        resetTokenRequired: 'You have to include a reset token',
        reusedPassword: 'You must choose a new password',
      },
    },
    cookie: {
      HttpOnly: true,
      Path: '/',
      SameSite: 'Strict',
      Secure: isProduction,
      ...(isProduction && {
        Domain: process.env.APP_DOMAIN.split('://')[1],
      }),
    },
  })

  authHandler.login = async () => {
    const { code, state, type } = authHandler.params
    validateLoginRequest({ type })
    if (!code || !state)
      throw new InputError('logIn() Code or state not provided.')

    const tokens = await submitCodeGrant({
      state,
      code,
      type,
    })
    const user = await providers[type].onConnected(tokens)
    const sessionData = { id: user[authHandler.options.authFields.id] }

    // TODO: this needs to go into graphql somewhere so that each request makes
    // a new CSRF token and sets it in both the encrypted session and the
    // csrf-token header
    const csrfToken = DbAuthHandler.CSRF_TOKEN

    const response = [
      sessionData,
      {
        'csrf-token': csrfToken,
        ...authHandler._createSessionHeader(sessionData, csrfToken),
      },
    ]
    logger.debug({ custom: response }, 'login() cookie')
    return response
  }

  authHandler.signup = async () => {
    try {
      const { type } = authHandler.params
      logger.debug(`authHandler.signup type: ${type}`)
      validateLoginRequest({ type })
      const { url } = await oAuthUrl(type)
      return [JSON.stringify({ url }), {}, { statusCode: 201 }]
    } catch (e) {
      logger.error(e)
      return [JSON.stringify(e), {}, { statusCode: 500, error: e }]
    }
  }

  return await authHandler.invoke()
}
