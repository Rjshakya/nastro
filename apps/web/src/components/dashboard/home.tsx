import { Route } from "@/routes/_app/dashboard";

export const Home = () => {
  const data = Route.useLoaderData();

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Your sites will appear here.</p>
      <p>{data?.name}</p>
      <p>{data?.age}</p>
    </div>
  );
};
