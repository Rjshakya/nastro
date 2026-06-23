import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { AnalyticsPage } from "./-components/analytics-page";

const searchSchema = z.object({
  name: z.string().optional(),
  pageId: z.string().optional(),
});

export const Route = createFileRoute("/_app/analytics/$slug")({
  validateSearch: searchSchema,
  component: AnalyticsPage,
});
