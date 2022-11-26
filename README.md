OAuth Server libraries: https://oauth.net/code/nodejs/

Have a test playground- https://github.com/simov/grant


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



