import { createFileRoute } from "@tanstack/react-router";
import { DashboardHome } from "./-components/home";
import { Error } from "@/components/error";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
  errorComponent: Error,
});

function DashboardPage() {
  return <DashboardHome />;
}
