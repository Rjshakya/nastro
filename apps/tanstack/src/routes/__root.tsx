import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { getThemeServerFn } from "@/lib/theme";

import appCss from "../styles/global.css?url";
import rcp from "react-color-palette/css?url";
import { Link } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Error } from "#/components/error";

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
      { property: "og:title", content: "Nastro" },
      { property: "og:description", content: "Fastest way from notion doc to published site." },
      {
        property: "og:url",
        content: "https://nastro.xyz",
      },
      // {
      //   property: "og:image",
      //   content: loaderData?.seo?.ogImage,
      // },
      { name: "twitter:title", content: "Nastro" },
      { name: "twitter:description", content: "Fastest way from notion doc to published site." },
      {
        name: "twitter:url",
        content: "https://nastro.xyz",
      },
      // {
      //   name: "twitter:image",
      //   content: loaderData?.seo?.ogImage,
      // },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.png",
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
  loader: () => getThemeServerFn(),
  shellComponent: RootDocument,
  notFoundComponent(props) {
    return (
      <div>
        <h2>404 - Page Not Found {props.routeId}</h2>
        <Link to="/dashboard">Go back to Dashboard</Link>
      </div>
    );
  },
  errorComponent: ({ error }) => (
    <Error message={error.message} onRetry={() => window.location.reload()} />
  ),
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const theme = Route.useLoaderData();
  return (
    <html className={theme} lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased wrap-anywhere">
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
        <Toaster className=" capitalize" richColors position="top-center" />
        <Scripts />
      </body>
    </html>
  );
}
