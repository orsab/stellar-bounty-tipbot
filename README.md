# Tip Bot
This is the tip bot for Discord channels. By reacting the message by emoji icon of bear(can be changed) you can tip someone with custom tokens. Or just by slash command ```/tip <amount> <user>```

### Requirements
- Nodejs 16+
- Stellar custodian wallet

### Setup
1. Create new custom server
2. Copy the server id to variable **DISCORDJS_GUILDID**
1. Got to https://discord.com/developers/applications
2. Create new application
3. Go to Bot tab, create bot and copy token to **DISCORDJS_BOT_TOKEN**
4. Go to OAuth2 => URL Generator
5. Choose scopes: 'bot' and 'applications.commands'
6. Choose bot permissions: 'Use Slash Commands', 'Manage Roles', 'Add Reactions'
7. Redirect to generated link and authorize the bot

### Installation
```bash
$ cp .env.example .env
$ npm i
$ vi .env
DISCORDJS_BOT_TOKEN= # set this
DISCORDJS_GUILDID= # set this
$ npm start
```

### Environment variables
**DISCORDJS_BOT_TOKEN** - Bot token

**DISCORDJS_GUILDID** - Discord guild(server) id

**CUSTODIAN_WALLET** - Private key of custodian wallet (must to have some balance of tip asset)

**TIP_ASSET_CODE** - Tip asset code

**TIP_ASSET_ISSUER** - Tip asset issuer

**NETWORK** - Stellar network (testnet | public)

**CLAIMABALE_BALANCE_CLAWBACK_TIME** - If target member dont't have the trustline for tip asset - payment will be send by the claimable balance for limited time in seconds. This claimable balance can be clawed back after setted time.

### How it works
* SQLite database is managing the users
* Each one can link it's member to the wallet address, by ```/link GUD...``` command
* Only who has the **Sponsor** role can use custodian wallet to tip the members by command: ```/tip <amount> <user>```. Or by reacting the message with bears:
🐻‍❄️ - 100 BEARS
🐻 - 10 BEARS
🐼 - 5 BEARS
🧸 - 1 BEAR

* If target member does not have the linked Stellar account - notification message will be sent to target and source(DM) accounts.
* If target member has the Stellar account but not the trustline - Claimable balance will be created with clawback timeout.