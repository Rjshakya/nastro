import { Home } from "@/components/dashboard/home";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
  loader: async () => ({ name: "some", age: 19 }),
});

function DashboardPage() {
  return (
    <div className="p-6">
      <Home />
    </div>
  );
}
