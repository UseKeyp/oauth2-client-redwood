<h1 align="center"><img width="600" style="border-radius: 30px;" src="https://github.com/treasure-chess/treasure-chess/blob/main/github-header.png?raw=true"/></h1>
<h1 align="center">Welcome to oauth2-client-redwood 👋</h1>
<p align="center">
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
  <a href="https://twitter.com/treasure chess_" target="_blank">
    <img alt="Twitter: treasurechess_" src="https://img.shields.io/twitter/follow/treasurechess_.svg?style=social" />
  </a>
</p>

If you'd like to join our team please let us know. Happy hacking!

<p align="center">
<img width="600px" src="oauth2-client-redwood.gif"/>
</p>

> A feature-complete general-purpose OAuth2 client built using Redwood.

## Providers available

Discord, Coinbase, Twitch, Chess.com, Plaid, and a demo self-hosted provider called "keyp" ([pi0neerpat/oauth2-demo-server](https://github.com/pi0neerpat/oauth2-demo-server)).

To add any new provider, simply create a new file in the providers directory.

## Features

- All providers can be used for *Authentication* or *Authorization*
- Web-side redirection UI
- No 3rd-party services required, and only one external dependency (pkce-challenge)
## Discussion 💬


This builds upon previous the work "wrapped dbAuth" (as first introduced in the community forum post [Combining dbAuth + OAuth2](https://community.redwoodjs.com/t/combining-dbauth-oauth2/2452/8)). Current discussion is happening in the [Redwood Community Forum post](https://community.redwoodjs.com/t/i-made-passportjs-for-redwood/4343?u=pi0neerpat)

## Demo 📙

Haven't had time to host a demo yet.

## Implement in your app

NOTE: if you're using a provider only for authorization, skip to step 3.

1. Setup dbAuth

```bash
yarn rw setup auth dbAuth
```

No need to follow the all instructions there, instead you will update the graphql schema as defined in step 3.

Also, create the session secret in your `.env` using `yarn rw g secret`

```
SESSION_SECRET=abc123
```

2. Install necessary dependencies

```bash
 cd api && yarn add pkce-challenge
```

3. Update the schema as necessary

Include any additional data from the provider you want to store in your database. For example, if you want to store the user's Twitch username, you can add it to the User model.

```graphql
model User {
  id           String   @id
  username     String?  @unique
  address      String?  @unique
  email        String?  @unique
  // --------------- STATE --------------
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  refreshToken String?
  accessToken  String?
  OAuth        OAuth[]
  betaAccess   Boolean  @default(false)
}

model OAuth {
  state         String   @id
  codeChallenge String
  codeVerifier  String
  createdAt     DateTime @default(now())
  user          User?    @relation(fields: [userId], references: [id])
  userId        String?
}
```

4. Modify the provider files

This is where you'll decide what you want to happen once a user is connected to the provider. For example, you may want to create a new user in your database (authentication use-case), or you may want to supplement an existing user with new data from the provider (authorization use-case).

Here's how the current example providers are currently set up, but they can be changed to fit your needs.

#### Authentication

- **Discord**: Create a user with their Discord profile, email, handle, and avatar for creating a user.
- **Chess.com**: Create a user with their Chess.com profile, email, handle, and avatar for creating a user.
- **Keyp** (in development): Create a new user with their wallet address.

Note if you are using a provider for authentication, you will need add it to the web [redirection provider](https://github.com/pi0neerpat/oauth2-client-redwood/blob/559da2f738a9755405a2a2cf800ca5fca5c23835/web/src/providers/redirection/redirection.js#L9) so that the appropriate query is made upon redirection back to the app.

#### Authorization

- **Coinbase**: Grab their ethereum deposit address.
- **Twitch**: Grab their Twitch username.
- **Plaid**: Grab their Plaid link_token to use with an approved app. (Plaid is evil and you should avoid using them)
## Next steps

- [ ] Add more providers (your help needed!)

## Resources 🧑‍💻

OAuth Server libraries: https://oauth.net/code/nodejs/

## Contributors ✨

👤 **Nifty Chess Team <maintainers@niftychess.com>**

- Website: https://treasurechess.com
- Twitter: [@treasurechess\_](https://twitter.com/treasurechess_)
- GitHub: [@Treasure-Chess](https://github.com/Treasure-Chess)

## License 📝

Copyright © 2022 Nifty Chess, Inc.<br />
This project is MIT licensed.



