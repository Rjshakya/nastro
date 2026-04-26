import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="flex flex-col gap-4 min-h-svh p-6 max-w-xl mx-auto">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button className="mt-2">Button</Button>
        </div>
      </div>

      <div className="">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Hi there</CardTitle>
            <CardDescription>this is description for card</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
