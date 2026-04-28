import { type CodeBlock, type ExtendedRecordMap } from "notion-types";
import { getBlockTitle } from "notion-utils";
import { Text } from "react-notion-x";
import { CodeBlock as CodeBlockComp } from "@/components/ui/code-block";
import React from "react";

export function renderCodeBlock({ recordMap }: { recordMap: ExtendedRecordMap }) {
  function Code({
    block,
    defaultLanguage = "typescript",
  }: {
    block: CodeBlock;
    defaultLanguage?: string;
    className?: string;
  }) {
    const content = getBlockTitle(block, recordMap);
    const language = (() => {
      const languageNotion = (
        block.properties?.language?.[0]?.[0] || defaultLanguage
      ).toLowerCase();

      switch (languageNotion) {
        case "c++":
          return "cpp";
        case "f#":
          return "fsharp";
        default:
          return languageNotion;
      }
    })();
    const caption = block.properties.caption;

    return (
      <>
        <CodeBlockComp className="w-full" language={language}>
          {content}
        </CodeBlockComp>

        {caption && (
          <figcaption className="notion-asset-caption">
            <Text value={caption} block={block} />
          </figcaption>
        )}
      </>
    );
  }

  return React.memo(Code);
}
