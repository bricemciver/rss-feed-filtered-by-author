import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import axios from "axios";
import { parseStringPromise } from "xml2js";

interface FilterConfig {
  whitelist?: string[];
  blacklist?: string[];
}

interface RSSItem {
  title?: string[];
  link?: string[];
  description?: string[];
  author?: string[];
  "dc:creator"?: string[];
  pubDate?: string[];
  guid?: unknown[];
}

interface RSSFeed {
  rss?: {
    channel?: Array<{
      title?: string[];
      link?: string[];
      description?: string[];
      item?: RSSItem[];
    }>;
  };
  // Atom feed support
  feed?: unknown;
}

const RSS_FEED_URL = process.env.RSS_FEED_URL || "https://example.com/feed.xml";
const WHITELIST = process.env.AUTHOR_WHITELIST
  ? process.env.AUTHOR_WHITELIST.split(",")
  : [];
const BLACKLIST = process.env.AUTHOR_BLACKLIST
  ? process.env.AUTHOR_BLACKLIST.split(",")
  : [];

const fetchFeed = async (url: string): Promise<string> => {
  try {
    const response = await axios.get(url, {
      // 10 second timeout
      timeout: 10000,
      headers: {
        "User-Agent": "RSS-Filter-Lambda/1.0",
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch feed: ${error.message}`);
    }
    throw error;
  }
};

const filterFeed = (feed: RSSFeed, config: FilterConfig): RSSFeed => {
  if (!feed.rss?.channel?.[0]?.item) {
    // No items to filter
    return feed;
  }

  const channel = feed.rss.channel[0];
  const items = channel.item || [];

  const filteredItems = items.filter((item) => {
    const author = getAuthor(item);

    if (!author) {
      // If no author, include by default unless there's a whitelist
      return !(config.whitelist && config.whitelist.length > 0);
    }

    // Check blacklist first
    if (config.blacklist && config.blacklist.length > 0) {
      if (
        config.blacklist.some((blocked) =>
          author.toLowerCase().includes(blocked.toLowerCase()),
        )
      ) {
        return false;
      }
    }

    // Check whitelist
    if (config.whitelist && config.whitelist.length > 0) {
      return config.whitelist.some((allowed) =>
        author.toLowerCase().includes(allowed.toLowerCase()),
      );
    }

    // If no whitelist, include the item (it passed blacklist check)
    return true;
  });

  return {
    rss: {
      ...feed.rss,
      channel: [
        {
          ...channel,
          item: filteredItems,
        },
      ],
    },
  };
};

const getAuthor = (item: RSSItem): string | null => {
  // Try different common author fields
  if (item.author?.[0]) {
    return item.author[0];
  }
  if (item["dc:creator"]?.[0]) {
    return item["dc:creator"][0];
  }
  return null;
};

export const rssFeed: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  try {
    // Parse query parameters for dynamic filtering
    const whitelist = event.queryStringParameters?.whitelist
      ? event.queryStringParameters.whitelist.split(",")
      : WHITELIST;
    const blacklist = event.queryStringParameters?.blacklist
      ? event.queryStringParameters.blacklist.split(",")
      : BLACKLIST;

    // Fetch the RSS feed
    const feedXml = await fetchFeed(RSS_FEED_URL);

    // Parse the XML
    const parsedFeed: RSSFeed = await parseStringPromise(feedXml);

    // Filter the feed
    const filteredFeed = filterFeed(parsedFeed, { whitelist, blacklist });

    // Convert back to XML
    const { Builder } = await import("xml2js");
    const builder = new Builder();
    const filteredXml = builder.buildObject(filteredFeed);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/xml",
        "Access-Control-Allow-Origin": "*",
      },
      body: filteredXml,
    } as APIGatewayProxyResult;
  } catch (error) {
    console.error("Error processing RSS feed:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Failed to process RSS feed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    } as APIGatewayProxyResult;
  }
};
