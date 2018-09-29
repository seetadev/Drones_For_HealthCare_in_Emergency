## MDL Node GenomeLink Example

This is based on the original GenomeLink Node Example except with some added flair of Material Design.  The original can be found here: https://github.com/AWAKENS-dev/api-oauth-example-node-express

### How to run

0. Visit "My apps" console and set

    Name: as you like
    Redirect uris: http://127.0.0.1:3000/callback

1. Set scopes (whitelists) in "Authorization scopes" panel.

    Vitamin A
    Vitamin B12
    Vitamin D
    Vitamin E
    Response to vitamin E supplementation
    Folate
    Calcium
    Magnesium
    Phosphorus
    Iron
    Alpha-linolenic acid
    Beta-carotene

Make sure the report scope is the same thing from GenomeLink and app.js.


2. Install node_modules

```
npm install

```

3. Dotenv is used really only for testing purposes.

So in production, you might want to comment this line out of your app.js
```
require('dotenv').config()

```
**Side Note: The original GenomeLink example does not use dotenv, but I find this method is easier on Windows.

4. Create .env file based on:

```
GENOMELINK_CLIENT_ID=your_client_id
GENOMELINK_CLIENT_SECRET=your_client_secret
GENOMELINK_CALLBACK_URL='http://127.0.0.1:3000/callback'

```

Replace the your_client_id and your_client_secret based on the information in your GenomeLink console.

5. Then run the app

```
node app.js

```

then, visit `http://127.0.0.1:3000`

### Usernames/Passwords

```
username 	password
test-user-1 	genomelink.io
test-user-2 	genomelink.io
test-user-3 	genomelink.io

```
### Requirements

Node >= 8.9.0
