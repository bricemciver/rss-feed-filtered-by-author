# RSS Feed Filter by Author

A Cloudflare Worker that fetches an RSS feed, filters its items based on author whitelists or blacklists, and returns
the modified feed.

This project is designed to be deployed with [Wrangler](https://developers.cloudflare.com/workers/cli-wrangler/) to
Cloudflare Workers.

## How It Works

The application deploys a Cloudflare Worker that handles HTTP requests to the `/feed` endpoint.

1.  When the `/feed` endpoint is invoked, the Worker function triggers.
2.  It fetches an RSS feed from a URL specified in the configuration.
3.  The XML feed is parsed into a JavaScript object.
4.  Items in the feed are filtered based on the author. The author is identified from the `<author>` or `<dc:creator>`
    field.
5.  Filtering logic is controlled by a whitelist (only include these authors) or a blacklist (exclude these authors).
6.  The filtered feed is converted back to XML and returned in the HTTP response.

## Features

- **Author Whitelisting**: Only include articles from specific authors.
- **Author Blacklisting**: Exclude articles from specific authors.
- **Flexible Configuration**: Set default filter rules using Wrangler variables/secrets.
- **Dynamic Overrides**: Override the default rules on-the-fly using query string parameters.
- **CORS Support**: `Access-Control-Allow-Origin: *` header is included for easy use in web applications.
- **Modern Stack**: Uses native fetch API, Vitest for testing, oxlint/oxfmt for linting/formatting, and pnpm for package
  management.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or later recommended)
- [pnpm](https://pnpm.io/) (v8.x or later recommended)
- A [Cloudflare Account](https://dash.cloudflare.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/cli-wrangler/install-and-update/) (v3.x or later)

## Setup & Deployment

### Using Volta (Recommended)

This project uses [Volta](https://volta.sh/) to manage Node.js and package manager versions. If you have Volta
installed, it will automatically use the correct versions.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/rss-feed-filtered-by-author.git
    cd rss-feed-filtered-by-author
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Configure Wrangler Variables/Secrets:** This service requires Wrangler variables or secrets to configure the
    source RSS feed and default filtering rules.

    The following configuration is needed. You can set them using Wrangler commands.
    - **`RSS_FEED_URL`**: The full URL of the RSS feed you want to filter.

      ```bash
      # For development (stored in plain text in wrangler.toml - NOT recommended for production secrets)
      wrangler var put RSS_FEED_URL "https://example.com/your/feed.xml"

      # For production (stored as secrets - recommended for sensitive values)
      wrangler secret put RSS_FEED_URL
      ```

    - **`AUTHOR_WHITELIST`** (Optional): A comma-separated list of author names to include. If specified, only items by
      these authors will be in the output.

      ```bash
      # Example: only include items from "Jane Doe" or "John Smith"
      wrangler var put AUTHOR_WHITELIST "Jane Doe,John Smith"
      # Or as secret:
      wrangler secret put AUTHOR_WHITELIST
      ```

    - **`AUTHOR_BLACKLIST`** (Optional): A comma-separated list of author names to exclude.
      ```bash
      # Example: exclude any items from "Unwanted Author"
      wrangler var put AUTHOR_BLACKLIST "Unwanted Author"
      # Or as secret:
      wrangler secret put AUTHOR_BLACKLIST
      ```

    **Note:** The service will use the whitelist if both a whitelist and blacklist are provided.

4.  **Deploy the service:** Deploy the Worker to your Cloudflare account using Wrangler.

    ```bash
    pnpm deploy
    # Or directly: wrangler deploy
    ```

    The command will output your Worker URL.

## Usage

After deployment, you will get a Worker URL similar to this: `https://your-worker.your-subdomain.workers.dev/feed`

You can access this URL in a browser or using a tool like `curl`.

### Examples

- **Using default filters (from Wrangler):**

  ```bash
  curl "https://your-worker.your-subdomain.workers.dev/feed"
  ```

- **Overriding filters with query parameters:** You can dynamically provide a whitelist or blacklist as query string
  parameters. This will override the defaults set in Wrangler for that specific request.
  - **Whitelist:** Only get articles by "Alice" and "Bob".

    ```bash
    curl "https://your-worker.your-subdomain.workers.dev/feed?whitelist=Alice,Bob"
    ```

  - **Blacklist:** Get all articles except those by "Charlie".
    ```bash
    curl "https://your-worker.your-subdomain.workers.dev/feed?blacklist=Charlie"
    ```

## Local Development

You can run the Worker locally using the `wrangler dev` command, which provides a live endpoint for testing.

```bash
pnpm dev
# Or directly: wrangler dev
```

This command will start a local development server at http://localhost:8787. Any changes you make to your `handler.ts`
file will be reflected instantly.

## Testing

Run the test suite with Vitest:

```bash
pnpm test
# Or directly: vitest
```

## Linting & Formatting

Check code quality with oxlint:

```bash
pnpm lint
# Or directly: oxlint .
```

Format code with oxfmt:

```bash
pnpm format
# Or directly: oxfmt . --write
```

## Project Structure

- `handler.ts` - Main Worker logic
- `handler.test.ts` - Test file
- `wrangler.toml` - Wrangler configuration
- `package.json` - Dependencies and scripts
- `volta.json` - Node.js and package manager version pinning
- `vitest.config.js` - Vitest configuration
- `.oxlintrc.json` - oxlint configuration
