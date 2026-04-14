import { parseStringPromise } from 'xml2js';

interface FilterConfig {
  whitelist?: string[];
  blacklist?: string[];
}

interface RSSItem {
  title?: string[];
  link?: string[];
  description?: string[];
  author?: string[];
  'dc:creator'?: string[];
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

const fetchFeed = async (url: string): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    clearTimeout(timeoutId);
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
    if (config.blacklist?.some((blocked) => author.toLowerCase().includes(blocked.toLowerCase()))) {
      return false;
    }

    // Check whitelist
    if (config.whitelist && config.whitelist.length > 0) {
      return config.whitelist.some((allowed) => author.toLowerCase().includes(allowed.toLowerCase()));
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
  if (item['dc:creator']?.[0]) {
    return item['dc:creator'][0];
  }
  return null;
};

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);
      const RSS_FEED_URL = env.RSS_FEED_URL || 'https://example.com/feed.xml';
      const WHITELIST = env.AUTHOR_WHITELIST ? env.AUTHOR_WHITELIST.split(',') : [];
      const BLACKLIST = env.AUTHOR_BLACKLIST ? env.AUTHOR_BLACKLIST.split(',') : [];

      // Parse query parameters for dynamic filtering
      const whitelistParam = url.searchParams.get('whitelist');
      const blacklistParam = url.searchParams.get('blacklist');

      const whitelist = whitelistParam ? whitelistParam.split(',') : WHITELIST;
      const blacklist = blacklistParam ? blacklistParam.split(',') : BLACKLIST;

      // Fetch the RSS feed
      const feedXml = await fetchFeed(RSS_FEED_URL);

      // Parse the XML
      const parsedFeed: RSSFeed = await parseStringPromise(feedXml);

      // Filter the feed
      const filteredFeed = filterFeed(parsedFeed, { whitelist, blacklist });

      // Convert back to XML
      const { Builder } = await import('xml2js');
      const builder = new Builder();
      const filteredXml = builder.buildObject(filteredFeed);

      return new Response(filteredXml, {
        status: 200,
        headers: {
          'Content-Type': 'application/rss+xml',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      let message = 'Unknown error';
      if (error instanceof Error) {
        message = error.message;
      }
      return new Response(
        JSON.stringify({
          error: 'Failed to process RSS feed',
          message,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }
  },
} satisfies ExportedHandler<Env>;

interface Env {
  RSS_FEED_URL?: string;
  AUTHOR_WHITELIST?: string;
  AUTHOR_BLACKLIST?: string;
}
