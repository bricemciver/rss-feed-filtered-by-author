# RSS Feed Filter by Author

A serverless AWS Lambda function that fetches an RSS feed, filters its items based on author whitelists or blacklists, and returns the modified feed.

This project is designed to be deployed with the [Serverless Framework](https://www.serverless.com/).

## How It Works

The application deploys an AWS Lambda function fronted by an API Gateway HTTP API.

1.  When the `/feed` endpoint is invoked, the Lambda function triggers.
2.  It fetches an RSS feed from a URL specified in the configuration.
3.  The XML feed is parsed into a JavaScript object.
4.  Items in the feed are filtered based on the author. The author is identified from the `<author>` or `<dc:creator>` field.
5.  Filtering logic is controlled by a whitelist (only include these authors) or a blacklist (exclude these authors).
6.  The filtered feed is converted back to XML and returned in the HTTP response.

## Features

-   **Author Whitelisting**: Only include articles from specific authors.
-   **Author Blacklisting**: Exclude articles from specific authors.
-   **Flexible Configuration**: Set default filter rules using AWS SSM Parameter Store.
-   **Dynamic Overrides**: Override the default rules on-the-fly using query string parameters.
-   **CORS Support**: `Access-Control-Allow-Origin: *` header is included for easy use in web applications.

## Prerequisites

-   [Node.js](https://nodejs.org/) (v18.x or later recommended)
-   An [AWS Account](https://aws.amazon.com/free/)
-   [AWS CLI](https://aws.amazon.com/cli/), configured with your credentials
-   [Serverless Framework CLI](https://www.serverless.com/framework/docs/getting-started) (v4.x or later)

## Setup & Deployment

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/rss-feed-filtered-by-author.git
    cd rss-feed-filtered-by-author
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure AWS SSM Parameters:**
    This service requires AWS Systems Manager (SSM) Parameter Store to configure the source RSS feed and default filtering rules.

    The following parameters are required. You can set them using the AWS CLI.

    -   **`RSS_FEED_URL`**: The full URL of the RSS feed you want to filter.

        ```bash
        aws ssm put-parameter --name "/rss-feed-filtered-by-author/rss-feed-url" --type "String" --value "https://example.com/your/feed.xml"
        ```

    -   **`AUTHOR_WHITELIST`** (Optional): A comma-separated list of author names to include. If specified, only items by these authors will be in the output.

        ```bash
        # Example: only include items from "Jane Doe" or "John Smith"
        aws ssm put-parameter --name "/rss-feed-filtered-by-author/author-whitelist" --type "StringList" --value "Jane Doe,John Smith"
        ```

    -   **`AUTHOR_BLACKLIST`** (Optional): A comma-separated list of author names to exclude.

        ```bash
        # Example: exclude any items from "Unwanted Author"
        aws ssm put-parameter --name "/rss-feed-filtered-by-author/author-blacklist" --type "StringList" --value "Unwanted Author"
        ```

    **Note:** The service will use the whitelist if both a whitelist and blacklist are provided.

4.  **Deploy the service:**
    Deploy the function to your AWS account using the Serverless Framework.

    ```bash
    serverless deploy
    ```

    The command will output the API endpoint URL.

## Usage

After deployment, you will get an endpoint URL similar to this:
`https://<id>.execute-api.<region>.amazonaws.com/feed`

You can access this URL in a browser or using a tool like `curl`.

### Examples

-   **Using default filters (from SSM):**
    ```bash
    curl "https://<id>.execute-api.<region>.amazonaws.com/feed"
    ```

-   **Overriding filters with query parameters:**
    You can dynamically provide a whitelist or blacklist as query string parameters. This will override the defaults set in SSM for that specific request.

    -   **Whitelist:** Only get articles by "Alice" and "Bob".
        ```bash
        curl "https://<id>.execute-api.<region>.amazonaws.com/feed?whitelist=Alice,Bob"
        ```

    -   **Blacklist:** Get all articles except those by "Charlie".
        ```bash
        curl "https://<id>.execute-api.<region>.amazonaws.com/feed?blacklist=Charlie"
        ```

## Local Development

You can run the function locally using the `serverless dev` command, which emulates the Lambda environment and provides a live endpoint for testing.

```bash
serverless dev
```

This command requires your AWS credentials and SSM parameters to be configured, as it will fetch them in real-time. Any changes you make to your `handler.ts` file will be reflected instantly.
