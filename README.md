# RSS Discord Bot

Serverless RSS Bot for Discord using AWS Services

## AWS Services
- Amazon API Gateway
- AWS Lambda
- Amazon DynamoDB
- Amazon EventBridge
- AWS Secrets Manager
- AWS CloudFormation

## Setup

### 1. Setup Discord Bot

1. [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a bot
3. generate a bot token

### 2. Seup App

```sh
cp .env.example .env # and write your Discord bot token

# register bot commands
source .env && node scripts/register-commands.js

# install dependencies for Lambda layer
cd layer && npm i
```

### 3. Deploy
```sh
sam build
sam deploy
```

### 4. Set Discord Endpoint URL
1. Get API Gateway URL from the output of `sam deploy`
2. Set Interactions Endpoint URL in Discord Developer Portal
