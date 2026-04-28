import { createFileRoute } from "@tanstack/react-router";
import { DashboardHome } from "./-components/home";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return <DashboardHome />;
}
