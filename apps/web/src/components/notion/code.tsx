import "prismjs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import type { CodeBlock, ExtendedRecordMap } from "notion-types";
import { getBlockTitle } from "notion-utils";
import React from "react";
import { Text } from "react-notion-x";
import { cn } from "@/lib/utils";
import { useSiteSettingStore } from "@/stores/site.setting.store";

export const Code =
  ({ recordMap }: { recordMap: ExtendedRecordMap }) =>
  ({
    block,
    defaultLanguage = "typescript",
    className,
  }: {
    block: CodeBlock;
    defaultLanguage?: string;
    className?: string;
  }) => {
    const { isDark } = useSiteSettingStore();
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

    const codeRef = React.useRef<HTMLElement | null>(null);

    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
    };

    // const onClickCopyToClipboard = React.useCallback(() => {
    // void copyToClipboard(content)
    //   setIsCopied(true)
    //
    //   if (copyTimeout.current) {
    //     clearTimeout(copyTimeout.current)
    //     copyTimeout.current = undefined
    //   }
    //
    //   copyTimeout.current = setTimeout(() => {
    //     setIsCopied(false)
    //   }, 1200) as unknown as number
    // }, [content, copyTimeout])

    // const copyButton = (
    //   <div className='notion-code-copy-button' onClick={onClickCopyToClipboard}>
    //     <CopyIcon />
    //   </div>
    // )

    return (
      <>
        <pre
          className={cn("w-full", `language-${language}`, className)}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
        >
          {/* <div className='notion-code-copy'>
          {copyButton}

          {isCopied && (
            <div className='notion-code-copy-tooltip'>
              <div>{isCopied ? 'Copied' : 'Copy'}</div>
            </div>
          )}
        </div>

       */}

          <SyntaxHighlighter
            language={language}
            style={isDark ? oneDark : oneLight}
            wrapLongLines={true}
            className={`language-${language}  p-2 `}
            ref={codeRef as any}
          >
            {content}
          </SyntaxHighlighter>
        </pre>

        {caption && (
          <figcaption className="notion-asset-caption">
            <Text value={caption} block={block} />
          </figcaption>
        )}
      </>
    );
  };
