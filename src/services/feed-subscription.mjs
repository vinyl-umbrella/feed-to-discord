import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { DYNAMODB } from "../constants.mjs";

const client = new DynamoDBClient();
const dynamodb = DynamoDBDocumentClient.from(client);
const FEEDS_TABLE = process.env.FEEDS_TABLE;

/**
 * Feed subscription service
 */
export class FeedSubscriptionService {
  /**
   * Get feeds for a specific channel
   * @param {string} channelId
   * @returns {Promise<Array>}
   */
  async getFeedsByChannel(channelId) {
    const params = {
      TableName: FEEDS_TABLE,
      KeyConditionExpression: "channelId = :channelId",
      ExpressionAttributeValues: {
        ":channelId": channelId,
      },
    };

    const result = await dynamodb.send(new QueryCommand(params));
    return result.Items;
  }

  /**
   * Get feeds for all channels in a guild
   * @param {string} guildId
   * @returns {Promise<Array>}
   */
  async getFeedsByGuild(guildId) {
    const params = {
      TableName: FEEDS_TABLE,
      IndexName: DYNAMODB.GUILD_ID_INDEX,
      KeyConditionExpression: "guildId = :guildId",
      ExpressionAttributeValues: {
        ":guildId": guildId,
      },
    };

    const result = await dynamodb.send(new QueryCommand(params));
    return result.Items;
  }

  /**
   * Check if a feed is subscribed to a specific channel
   * @param {string} channelId
   * @param {string} feedUrl
   * @returns {Promise<boolean>}
   */
  async isChannelSubscribed(channelId, feedUrl) {
    const params = {
      TableName: FEEDS_TABLE,
      Key: { channelId, feedUrl },
    };

    const result = await dynamodb.send(new GetCommand(params));
    return !!result.Item;
  }

  /**
   * Check if a feed is already subscribed to a guild
   * @param {string} guildId
   * @param {string} feedUrl
   * @returns {Promise<boolean>}
   */
  async isSubscribed(guildId, feedUrl) {
    const params = {
      TableName: FEEDS_TABLE,
      IndexName: DYNAMODB.GUILD_ID_INDEX,
      KeyConditionExpression: "guildId = :guildId",
      FilterExpression: "feedUrl = :feedUrl",
      ExpressionAttributeValues: {
        ":guildId": guildId,
        ":feedUrl": feedUrl,
      },
    };

    const result = await dynamodb.send(new QueryCommand(params));
    return result.Items && result.Items.length > 0;
  }

  /**
   * Subscribe to a feed
   * @param {string} channelId
   * @param {string} guildId
   * @param {string} feedUrl
   * @param {string} feedTitle
   * @returns {Promise<void>}
   */
  async subscribe(channelId, guildId, feedUrl, feedTitle = null) {
    const params = {
      TableName: FEEDS_TABLE,
      Item: {
        channelId,
        guildId,
        feedUrl,
        feedTitle,
        subscribedAt: new Date().toISOString(),
        lastChecked: null,
        lastItemDate: null,
      },
    };

    await dynamodb.send(new PutCommand(params));
  }

  /**
   * Unsubscribe from a feed
   * @param {string} channelId
   * @param {string} feedUrl
   * @returns {Promise<void>}
   */
  async unsubscribe(channelId, feedUrl) {
    const params = {
      TableName: FEEDS_TABLE,
      Key: { channelId, feedUrl },
    };

    await dynamodb.send(new DeleteCommand(params));
  }

  /**
   * Get all unique feed URLs
   * @returns {Promise<Array>}
   */
  async getAllFeedUrls() {
    const uniqueFeeds = {};
    let lastEvaluatedKey;

    do {
      const params = {
        TableName: FEEDS_TABLE,
        ProjectionExpression: "feedUrl, lastChecked, lastItemDate",
        ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey }),
      };

      const result = await dynamodb.send(new ScanCommand(params));

      // Group by feedUrl to avoid duplicates
      result.Items.forEach((item) => {
        if (!uniqueFeeds[item.feedUrl]) {
          uniqueFeeds[item.feedUrl] = {
            lastChecked: item.lastChecked,
            lastItemDate: item.lastItemDate,
          };
        }
      });

      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return Object.keys(uniqueFeeds).map((feedUrl) => ({
      feedUrl,
      ...uniqueFeeds[feedUrl],
    }));
  }

  /**
   * Get channels subscribed to a specific feed
   * @param {string} feedUrl
   * @returns {Promise<Array>}
   */
  async getChannelsByFeed(feedUrl) {
    const params = {
      TableName: FEEDS_TABLE,
      IndexName: DYNAMODB.FEED_URL_INDEX,
      KeyConditionExpression: "feedUrl = :feedUrl",
      ExpressionAttributeValues: {
        ":feedUrl": feedUrl,
      },
    };

    const result = await dynamodb.send(new QueryCommand(params));
    return result.Items;
  }

  /**
   * Update feed status (lastChecked, lastItemDate, feedTitle) for given subscriptions
   * @param {Array} subscriptions - Subscriptions from getChannelsByFeed()
   * @param {Object} fields - Fields to update { lastChecked?, lastItemDate?, feedTitle? }
   * @returns {Promise<void>}
   */
  async updateFeedStatus(subscriptions, fields) {
    const setClauses = [];
    const expressionAttributeValues = {};

    if (fields.lastChecked !== undefined) {
      setClauses.push("lastChecked = :lastChecked");
      expressionAttributeValues[":lastChecked"] = fields.lastChecked;
    }
    if (fields.lastItemDate !== undefined) {
      setClauses.push("lastItemDate = :lastItemDate");
      expressionAttributeValues[":lastItemDate"] = fields.lastItemDate;
    }
    if (fields.feedTitle !== undefined) {
      setClauses.push("feedTitle = :feedTitle");
      expressionAttributeValues[":feedTitle"] = fields.feedTitle;
    }

    if (setClauses.length === 0) return;

    const updateExpression = `SET ${setClauses.join(", ")}`;

    const updatePromises = subscriptions.map((sub) =>
      dynamodb.send(
        new UpdateCommand({
          TableName: FEEDS_TABLE,
          Key: {
            channelId: sub.channelId,
            feedUrl: sub.feedUrl,
          },
          UpdateExpression: updateExpression,
          ExpressionAttributeValues: expressionAttributeValues,
        }),
      ),
    );

    await Promise.all(updatePromises);
  }
}
