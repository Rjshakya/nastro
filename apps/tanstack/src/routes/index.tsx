import { Button } from "#/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <main className=" px-4 pb-8 pt-14">
      <p>Main page</p>
      <Button>Click</Button>
      <Link to="/about">goto</Link>
      <Link to="/dashboard">Dashboard</Link>
    </main>
  );
}
