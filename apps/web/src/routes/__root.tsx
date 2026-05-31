import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { ThemeProvider } from "@/components/theme-provider";

import appCss from "@/styles/styles.css?url";
import notionCss from "@/styles/notion.css?url";
import rcp from "react-color-palette/css?url";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Error } from "@/components/error";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nastro" },
      {
        name: "description",
        content: "Turn your Notion pages into beautiful websites",
      },

      // Open Graph
      { property: "og:title", content: "Nastro" },
      {
        property: "og:description",
        content: "Turn your Notion pages into beautiful websites",
      },
      { property: "og:image", content: "https://nastro.xyz/og.png" },
      { property: "og:url", content: "https://nastro.xyz" }, //
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Nastro" },

      // Twitter Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Nastro" }, //
      {
        name: "twitter:description",
        content: "Turn your Notion pages into beautiful websites",
      },
      { name: "twitter:image", content: "https://nastro.xyz/og.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "stylesheet",
        href: notionCss,
      },
      {
        rel: "stylesheet",
        href: rcp,
      },
      {
        rel: "icon",
        href: "/icon.png",
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  ),
  shellComponent: RootDocument,
  errorComponent: Error,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
