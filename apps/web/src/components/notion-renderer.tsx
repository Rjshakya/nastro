import { NotionRenderer as NotionRendererLib } from "react-notion-x";
import { Card, CardContent } from "@/components/ui/card";
import "@/styles/notion.css";

interface NotionRendererProps {
  pageId: string;
  recordMap: any;
}

export function NotionRenderer({ pageId, recordMap }: NotionRendererProps) {
  // if (isLoading) {
  //   return (
  //     <div className="space-y-4 p-8">
  //       <Skeleton className="h-8 w-3/4" />
  //       <Skeleton className="h-4 w-full" />
  //       <Skeleton className="h-4 w-full" />
  //       <Skeleton className="h-4 w-2/3" />
  //       <Skeleton className="h-32 w-full" />
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <Card>
  //       <CardContent className="py-8 text-center text-muted-foreground">
  //         <p>Failed to load Notion page</p>
  //         <p className="text-sm mt-2">{error}</p>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  if (!recordMap) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No content available
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="notion-renderer">
      <NotionRendererLib
        recordMap={recordMap}
        
        darkMode={true}
        className=""
        isShowingSearch={true}
      />
    </div>
  );
}
