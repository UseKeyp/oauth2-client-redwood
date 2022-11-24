import fetch from 'node-fetch'

export const getExpiration = (expiresIn) =>
  new Date(new Date(Date.now() + expiresIn * 1000))

export const encodeBody = (body) =>
  Object.keys(body)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(body[key]))
    .join('&')

export const fetchWithToken = async ({
  url,
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
    const urlWithPath = path.join(url, pathArg)
    return await fetch(urlWithPath, {
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
