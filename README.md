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

Coinbase, Twitch, Chess.com, Plaid, and a demo self-hosted provider called "keyp" ([pi0neerpat/oauth2-demo-server](https://github.com/pi0neerpat/oauth2-demo-server)).

To add any new provider, simply create a new file in the providers directory.

## Features

- Server-side token exchange, refreshing, and revoking
- Web-side redirection handling
- Any provider can also serve as a login method using "wrapped dbAuth" (as first introduced in the community forum post [Combining dbAuth + OAuth2](https://community.redwoodjs.com/t/combining-dbauth-oauth2/2452/8))

There are no external dependencies or 3rd-party services required.

## Discussion 💬

[Redwood Community Forum post](https://community.redwoodjs.com/t/i-made-passportjs-for-redwood/4343?u=pi0neerpat)

## Usage 📙

DEMO link coming soon
## Implement your own

NOTE: if you're not using the provider for logins, just skip to step 4.

1. Setup dbAuth

```bash
yarn setup auth dbAuth
```

No need to follow the all instructions there, instead you will update the graphql schema as defined in step 3.

Also, create the session secret in your `.env` using `yarn rw g secret`

```
SESSION_SECRET=abc123
```

2. Install necessary dependencies

```bash
 cd api && yarn add oauth2orize pkce-challenge
```

3. Update the schema as necessary

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

If you're adding your own provider, you'll need to decide what you want to happen once a user is connected. For example, you may want to create a new user in your database, or you may want to update an existing user with new data from the provider (eg. a Twitch username).
## Next steps

- [ ] Add more providers (your help is needed!)
- [ ] Create a developer dashboard for generating new API OAuth client credentials, using RedwoodJS.
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



