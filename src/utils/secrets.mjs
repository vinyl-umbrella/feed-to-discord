import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { CACHE_DURATION } from "../constants.mjs";

let secretsCache = null;
let cacheExpiry = null;

export async function getDiscordSecrets() {
  const now = Date.now();

  // Return cached secrets if still valid
  if (secretsCache && cacheExpiry && now < cacheExpiry) {
    return secretsCache;
  }

  const secretsManager = new SecretsManagerClient();
  const secretArn = process.env.DISCORD_SECRETS_ARN;

  if (!secretArn) {
    throw new Error("DISCORD_SECRETS_ARN environment variable is required");
  }

  try {
    const result = await secretsManager.send(
      new GetSecretValueCommand({
        SecretId: secretArn,
      }),
    );

    const secrets = JSON.parse(result.SecretString);

    // Cache the secrets
    secretsCache = {
      publicKey: secrets.publicKey,
      botToken: secrets.botToken,
      applicationId: secrets.applicationId,
    };
    cacheExpiry = now + CACHE_DURATION;

    return secretsCache;
  } catch (error) {
    console.error("Error getting Discord secrets:", error);
    throw new Error("Failed to retrieve Discord credentials");
  }
}
