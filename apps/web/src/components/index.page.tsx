import { toast } from "sonner";
import { Button } from "./ui/button";

export const IndexPage = () => {
  return <Button className=" translate-y-3" onClick={() => toast("astro toast")}>Toast</Button>;
};
