import type { APIGatewayProxyEvent } from "aws-lambda";
import { rssFeed } from "./handler";

describe("rssFeed handler", () => {
  it("should fetch, filter, and return the RSS feed", async () => {
    // Set environment variables for the test
    process.env.RSS_FEED_URL = "http://instapundit.com/feed";

    // Mock API Gateway event
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        whitelist: "Glenn Reynolds",
      },
    };

    // Execute the handler
    const result = await rssFeed(event as APIGatewayProxyEvent, {} as any, () => {});

    if (result) {
      expect(result.statusCode).toBe(200);
      expect(result.headers).toEqual({
        "Content-Type": "application/rss+xml",
        "Access-Control-Allow-Origin": "*",
      });
      
      // Verify the filtered XML
      expect(result.body).toContain("<dc:creator>Glenn Reynolds</dc:creator>");
    }   
  });
});
