import { CHESS, provider as chessProvider } from './chess'
import { onConnected as onConnectedChess } from './chess/login'
import { COINBASE, provider as coinbaseProvider } from './coinbase'
import { PLAID, provider as plaidProvider } from './plaid'
import { TWITCH, provider as twitchProvider } from './twitch'
import { DISCORD, provider as discordProvider } from './discord'

export const providers = {
  [CHESS]: { ...chessProvider, onConnected: onConnectedChess },
  [COINBASE]: coinbaseProvider,
  [TWITCH]: twitchProvider,
  [PLAID]: plaidProvider,
  [DISCORD]: discordProvider,
}

export const types = [DISCORD, COINBASE, CHESS, TWITCH, PLAID]
