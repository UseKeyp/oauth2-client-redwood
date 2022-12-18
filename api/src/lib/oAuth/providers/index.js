import { CHESS, provider as chessProvider } from './chess'
import { onConnected as onConnectedChess } from './chess/login'
import { COINBASE, provider as coinbaseProvider } from './coinbase'
import { DISCORD, provider as discordProvider } from './discord'
import { NODE_OIDC, provider as nodeOIDCProvider } from './node-oidc'
import {
  OAUTH2_SERVER_REDWOOD,
  provider as oauth2ServerRedwoodProvider,
} from './oauth2-server-redwood'
// import { PLAID, provider as plaidProvider } from './plaid'
// import { TWITCH, provider as twitchProvider } from './twitch'

export const providers = {
  [CHESS]: { ...chessProvider, onConnected: onConnectedChess },
  [COINBASE]: coinbaseProvider,
  [NODE_OIDC]: nodeOIDCProvider,
  [DISCORD]: discordProvider,
  [OAUTH2_SERVER_REDWOOD]: oauth2ServerRedwoodProvider,
  // [TWITCH]: twitchProvider,
  // [PLAID]: plaidProvider,
}

export const types = [
  COINBASE,
  CHESS,
  DISCORD,
  NODE_OIDC,
  OAUTH2_SERVER_REDWOOD,
  // TWITCH,
  // PLAID,
]
