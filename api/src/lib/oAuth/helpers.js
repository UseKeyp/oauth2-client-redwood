export const getExpiration = (expiresIn) =>
  new Date(new Date(Date.now() + expiresIn * 1000))

export const encodeBody = (body) =>
  Object.keys(body)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(body[key]))
    .join('&')
