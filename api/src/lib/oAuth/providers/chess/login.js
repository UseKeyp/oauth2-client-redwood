import { EnvelopError } from '@envelop/core'

import { AuthenticationError } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'
// import { fetchMember } from 'src/lib/members'
import { getTorusPublicAddress } from 'src/lib/torus/torus'

export const onConnected = async ({ refreshToken, accessToken, decoded }) => {
  try {
    if (!decoded) return null
    /* eslint-disable camelcase */
    const { preferred_username, user_id, email } = decoded
    logger.debug({ custom: decoded }, 'onConnected() decoded')
    // Create member if needed, and get current avatar
    // const member = await fetchMember(preferred_username, true)
    // if (member.banned) {
    //   throw new AuthenticationError('user is banned')
    // }
    // if (user_id !== member.id)
    //   throw new AuthenticationError(
    //     `user_id in JWT doesn't match player_id from API`
    //   )

    // if (!email)
    //   throw new EnvelopError(
    //     `Couldn't fetch email for user ${preferred_username} in fetchMember function`
    //   )

    // await db.member.update({
    //   where: { id: member.id },
    //   data: {
    //     refreshToken,
    //     accessToken,
    //     email,
    //     // NOTE: Updates user with their current avatar and country
    //     imageSrc: member.imageSrc,
    //     country: member.country,
    //     ...(member.masterTitle && { masterTitle: member.masterTitle }),
    //     ...(member.blocked && { blocked: false }), // Remove the block if they sign in
    //   },
    // })

    // // NOTE: Get Torus wallet address if needed.
    // if (!member.address) {
    //   try {
    //     const publicAddress = await getTorusPublicAddress(member.id)
    //     logger.debug(`getTorusPublicAddress - ${publicAddress}`)
    //     await db.member.update({
    //       where: { id: member.id },
    //       data: { address: publicAddress },
    //     })
    //   } catch (e) {
    //     logger.error(e, "Error fetching user's wallet from Torus")
    //   }
    // }
    // return member
    return { username: 'bob', id: 123 }
  } catch (e) {
    logger.error(e)
    throw `onConnected() error`
  }
}
