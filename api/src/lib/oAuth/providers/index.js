import { CHESS, provider as chessProvider } from './chess'
import { onConnected as onConnectedChess } from './chess/login'
import { COINBASE, provider as coinbaseProvider } from './coinbase'
import { DISCORD, provider as discordProvider } from './discord'
import { NODE_OIDC, provider as nodeOIDCProvider } from './node-oidc/node-oidc'
// import { PLAID, provider as plaidProvider } from './plaid'
// import { TWITCH, provider as twitchProvider } from './twitch'

export const providers = {
  [CHESS]: { ...chessProvider, onConnected: onConnectedChess },
  [COINBASE]: coinbaseProvider,
  [NODE_OIDC]: nodeOIDCProvider,
  [DISCORD]: discordProvider,
  // [TWITCH]: twitchProvider,
  // [PLAID]: plaidProvider,
}

export const types = [
  COINBASE,
  CHESS,
  DISCORD,
  NODE_OIDC,
  // TWITCH,
  // PLAID,
]
