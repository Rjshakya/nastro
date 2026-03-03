import LoginPage from "#/components/login";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className=" px-4 pb-8 pt-14">
      <LoginPage />
    </main>
  );
}
