import { createFileRoute } from "@tanstack/react-router";
import { CustomDomainPage } from "./-components/custom-domain-page";
import { Error } from "@/components/error";

export const Route = createFileRoute("/_app/custom-domain")({
  component: CustomDomainRoute,
  errorComponent: Error,
});

function CustomDomainRoute() {
  return <CustomDomainPage />;
}
