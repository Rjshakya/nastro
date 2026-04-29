import handler from "@tanstack/react-start/server-entry";

// Export Durable Objects as named exports

export default {
  async fetch(request): Promise<Response> {
    try {
      return await handler.fetch(request);
    } catch (error) {
      console.log(error);
      return new Response(error as any);
    }
  },
} as ExportedHandler<any>;
