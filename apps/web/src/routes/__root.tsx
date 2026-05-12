import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { ThemeProvider } from "@/components/theme-provider"

import appCss from "../styles.css?url"
import rcp from "react-color-palette/css?url"
import { Toaster } from "sonner"
import { Error } from "@/components/error"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Nastro",
      },
      { content: "Turn your Notion pages into beautiful websites", name: "description" },
      // Open Graph
      { content: "Nastro", property: "og:title" },
      {
        content: "Turn your Notion pages into beautiful websites",
        property: "og:description",
      },
      {
        content: `https://nastro.xyz/og.png`,
        property: "og:image",
      },
      { content: "website", property: "og:type" },
      {
        content: `https://nastro.xyz/og.png`,
        property: "og:logo",
      },
      // Twitter Card
      { content: "summary_large_image", name: "twitter:card" },
      { content: "nastro.xyz", name: "twitter:title" },
      {
        content: "Turn your Notion pages into beautiful websites",
        name: "twitter:description",
      },
      {
        content: `https://nastro.xyz/og.png`,
        name: "twitter:image",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "/icon.webp",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "stylesheet",
        href: rcp,
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
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main>{children}</main>
          <Toaster />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
