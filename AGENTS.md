# Development Guide for AI Agents

> **IMPORTANT**: AGENTS.md files are the source of truth for AI agent instructions. Always update the relevant AGENTS.md file when adding or modifying agent guidance. Do not add to CLAUDE.md or Cursor rules.

## Development Commands

- **Install dependencies**: `pnpm install`
- **Run tests**: `pnpm test` or `pnpm test --run` for single run
- **Run specific test**: `pnpm test --run handler.test.ts`
- **Start development server**: `pnpm dev` (runs `wrangler dev`)
- **Deploy to Cloudflare**: `pnpm deploy` (runs `wrangler deploy`)
- **Lint code**: `pnpm lint`
- **Fix lint errors**: `pnpm lint:fix`
- **Format code**: `pnpm format`
- **Check formatting**: `pnpm format:check`

## Project Architecture

This is a Cloudflare Worker application that filters RSS feeds by author. The core logic resides in `handler.ts`:

1. **Request Handling**: The worker exports a `fetch` function that receives Cloudflare Worker request/response objects
2. **Feed Fetching**: Uses native `fetch` API with AbortController for timeout handling (10 seconds)
3. **XML Parsing**: Uses `xml2js` library to parse RSS/Atom feeds into JavaScript objects
4. **Filtering Logic**: Filters feed items based on author whitelists/blacklists from:
   - Environment variables (RSS_FEED_URL, AUTHOR_WHITELIST, AUTHOR_BLACKLIST)
   - Query parameter overrides (whitelist, blacklist)
5. **Response Generation**: Converts filtered feed back to XML and returns with proper Content-Type headers

Key interfaces:

- `FilterConfig`: Defines whitelist/blacklist arrays
- `RSSItem`: Represents individual feed item fields
- `RSSFeed`: Represents the parsed feed structure
- `Env`: Defines expected environment variables

Configuration is managed through:

- `wrangler.toml`: Worker configuration with Node.js compatibility enabled
- Environment variables/secrets: Set via `wrangler var put` or `wrangler secret put`

Testing is done with Vitest using standard Jest-like syntax (`describe`, `it`, `expect`).

## File Structure

- `handler.ts`: Main worker logic
- `handler.test.ts`: Test file
- `wrangler.toml`: Wrangler configuration
- `package.json`: Dependencies and scripts
- `volta.json`: Node and pnpm version pinning
- `vitest.config.mts`: Vitest configuration
- `oxlint.config.ts` / `oxfmt.config.ts`: Linting/formatting configuration
