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
<img src="oauth2-client-redwood.gif"/>
</p>

> A feature-complete general-purpose OAuth2 client built with RedwoodJS.

Designed to be both an authentication/login method for your users, and/or a general way to fetch OAuth2 user data from third-party apps (eg. "connect your Twitch account"). What's included:

- "Wrapped" dbAuth client + server (as first introduced in the community forum post [Combining dbAuth + OAuth2](https://community.redwoodjs.com/t/combining-dbauth-oauth2/2452/8))
- Web-side Oauth and Redirect tooling
- Server-side grant-token exchange, refreshing, revoking

Essentially a custom-implementation of [`passport-oauth2`](https://www.passportjs.org/packages/passport-oauth2/)

The code for the authority server (the one providing the user data) is here: https://github.com/pi0neerpat/oauth2-demo-server

All the OAuth code is custom; the only external dependency is optional `pkce-challenge`.

## Discussion

[Redwood Community Forum post](https://community.redwoodjs.com/t/i-made-passportjs-for-redwood/4343?u=pi0neerpat)

## Usage 📙

DEMO link coming soon
## Implement your own

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

## Next steps

- [ ] Create a developer dashboard for creating API OAuth client credentials, using RedwoodJS.
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



