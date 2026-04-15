import { loadEnvFile } from "node:process";
import path from "node:path";
import { writeFile } from "node:fs";
import { ContentSource, toHTML } from "./core";

loadEnvFile();

new ContentSource({
  token: process.env.NOTION_API_TOKEN as string,
})
  .fetch("34185bde2593804e9bf8fc1a468f0514")
  // .use(toHTML())
  .run()
  .then((html) => {
    writeLocalFile("page", "json")(html);
  });

function writeLocalFile(fileName: string, ext: "json"): (data: unknown) => void;
function writeLocalFile(fileName: string, ext: "html"): (data: string) => void;

function writeLocalFile(fileName: string, ext: "json" | "html") {
  return (data: unknown) => {
    let filePath = path.join("./", `${fileName}.${ext}`);

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
