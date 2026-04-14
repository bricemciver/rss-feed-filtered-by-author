import { describe, expect, it } from 'vitest';
import rssFeed from './handler';

describe('rssFeed handler', () => {
  it('should fetch, filter, and return the RSS feed', async () => {
    // Set environment variables for the test
    process.env.RSS_FEED_URL = 'http://instapundit.com/feed';

    // Mock Request object
    const request = new Request('http://example.com/feed?whitelist=Glenn%20Reynolds');

    // Mock Env object
    const env = {
      RSS_FEED_URL: 'http://instapundit.com/feed',
      AUTHOR_WHITELIST: '',
      AUTHOR_BLACKLIST: '',
    };

    // Execute the handler
    const response = await rssFeed.fetch(request, env, {} as ExecutionContext);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/rss+xml');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

    // Get the response body
    const body = await response.text();

    // Verify the filtered XML contains the expected author
    expect(body).toContain('<dc:creator>Glenn Reynolds</dc:creator>');
  });
});
