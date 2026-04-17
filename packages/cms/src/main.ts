import { loadEnvFile } from "node:process";
import path from "node:path";
import { writeFile } from "node:fs";
import { NotionApi } from "./core";
import { toMarkdown } from "./core/plugins";

loadEnvFile();

new NotionApi({
  token: process.env.NOTION_API_TOKEN as string,
})
  .fetch("34185bde2593804e9bf8fc1a468f0514")
  // .use(toMarkdown())
  .run()
  .then((result) => {
    writeLocalFile("fullpage", "json")(result);
  });

function writeLocalFile(fileName: string, ext: "json"): (data: unknown) => void;
function writeLocalFile(fileName: string, ext: "html" | "md"): (data: string) => void;

function writeLocalFile(fileName: string, ext: "json" | "html" | "md") {
  return (data: unknown) => {
    let filePath = path.join("./", `${fileName}.${ext}`);

    if (ext === "md") {
      return writeFile(filePath, String(data), (err) => {
        if (err) {
          console.error(`Error writing file ${filePath}:`, err);
        } else {
          console.log(`✅ MD file written: ${filePath}`);
        }
      });
    }

    if (ext === "html") {
      writeFile(
        filePath,
        `<!DOCTYPE html>
          <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Notion Page</title>
                <link rel="stylesheet" href="notion-default.css">
            </head>
            <body>
              ${data}
            </body>
          </html>

`,
        (err) => {
          if (err) {
            console.error(`Error writing file ${filePath}:`, err);
          } else {
            console.log(`✅ HTML file written: ${filePath}`);
          }
        },
      );

      return;
    }

    writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        console.error(`Error writing file ${filePath}:`, err);
      } else {
        console.log(`✅ JSON file written: ${filePath}`);
      }
    });
  };
}
