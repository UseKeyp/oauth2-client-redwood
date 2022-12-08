import { CHESS, provider as chessProvider } from './chess'
import { onConnected as onConnectedChess } from './chess/login'
import { COINBASE, provider as coinbaseProvider } from './coinbase'
import { DISCORD, provider as discordProvider } from './discord'
import { KEYP, provider as keypProvider } from './keyp'
// import { PLAID, provider as plaidProvider } from './plaid'
// import { TWITCH, provider as twitchProvider } from './twitch'

export const providers = {
  [CHESS]: { ...chessProvider, onConnected: onConnectedChess },
  [COINBASE]: coinbaseProvider,
  [KEYP]: keypProvider,
  [DISCORD]: discordProvider,
  // [TWITCH]: twitchProvider,
  // [PLAID]: plaidProvider,
}

export const types = [
  COINBASE,
  CHESS,
  KEYP,
  DISCORD,
  // TWITCH,
  // PLAID,
]
