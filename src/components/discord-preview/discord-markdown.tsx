import type { ReactNode } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DiscordMarkdownProps {
  content: string;
  className?: string;
}

const INLINE_TOKEN_REGEX =
  /(\*\*[^*]+?\*\*|__[^_]+?__|~~[^~]+?~~|\*[^*\n]+?\*|`[^`\n]+?`|\[[^\]]+?\]\((https?:\/\/[^\s)]+)\)|<t:\d{1,13}(?::[tTdDfFR])?>|<@!?\d+>|<@&\d+>|<#\d+>|:[a-zA-Z0-9_+\-]+:)/g;

const CODE_BLOCK_REGEX = /```([a-zA-Z0-9_+-]+)?\n?([\s\S]*?)```/g;

const JS_KEYWORDS = new Set([
  "const",
  "let",
  "var",
  "function",
  "return",
  "if",
  "else",
  "for",
  "while",
  "class",
  "import",
  "export",
  "from",
  "new",
  "await",
  "async",
  "try",
  "catch",
  "throw",
]);

const EMOJI_MAP: Record<string, string> = {
  ":white_check_mark:": "✅",
  ":x:": "❌",
  ":warning:": "⚠️",
  ":fire:": "🔥",
  ":calendar:": "📅",
  ":clock:": "🕒",
  ":star:": "⭐",
};

function highlightCode(code: string, language?: string): ReactNode[] {
  if (!language || (language !== "js" && language !== "ts" && language !== "javascript" && language !== "typescript")) {
    return [code];
  }

  const tokens = code.split(/(\b)/);
  return tokens.map((token, index) => {
    if (JS_KEYWORDS.has(token)) {
      return (
        <span key={`${token}-${index}`} className="text-[#c792ea]">
          {token}
        </span>
      );
    }

    if (/^\d+$/.test(token)) {
      return (
        <span key={`${token}-${index}`} className="text-[#f78c6c]">
          {token}
        </span>
      );
    }

    return <span key={`${token}-${index}`}>{token}</span>;
  });
}

function formatDiscordTimestamp(raw: string): string {
  const match = raw.match(/^<t:(\d{1,13})(?::([tTdDfFR]))?>$/);
  if (!match) {
    return raw;
  }

  const unix = Number(match[1]);
  const formatChar = match[2] ?? "f";
  const date = new Date(unix * 1000);

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  if (formatChar === "R") {
    const seconds = Math.round((date.getTime() - Date.now()) / 1000);
    if (Math.abs(seconds) < 60) return "just now";
    const absMinutes = Math.round(Math.abs(seconds) / 60);
    if (absMinutes < 60) return seconds >= 0 ? `in ${absMinutes}m` : `${absMinutes}m ago`;
    const absHours = Math.round(absMinutes / 60);
    if (absHours < 24) return seconds >= 0 ? `in ${absHours}h` : `${absHours}h ago`;
    const absDays = Math.round(absHours / 24);
    return seconds >= 0 ? `in ${absDays}d` : `${absDays}d ago`;
  }

  if (formatChar === "t") return format(date, "p");
  if (formatChar === "T") return format(date, "pp");
  if (formatChar === "d") return format(date, "P");
  if (formatChar === "D") return format(date, "PPP");
  if (formatChar === "F") return format(date, "PPPP p");
  return format(date, "PPP p");
}

function parseInline(content: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = INLINE_TOKEN_REGEX.exec(content)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(content.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(<strong key={`${match.index}-b`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("__") && token.endsWith("__")) {
      nodes.push(<span key={`${match.index}-u`} className="underline">{token.slice(2, -2)}</span>);
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      nodes.push(<span key={`${match.index}-s`} className="line-through">{token.slice(2, -2)}</span>);
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(<em key={`${match.index}-i`}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code key={`${match.index}-c`} className="rounded bg-[#1e1f22] px-[3px] py-[1px] font-mono text-[12px] text-[#dbdee1]">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
      if (linkMatch) {
        nodes.push(
          <a key={`${match.index}-l`} href={linkMatch[2]} target="_blank" rel="noreferrer" className="text-[#00A8FC] hover:underline">
            {linkMatch[1]}
          </a>
        );
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith("<#")) {
      nodes.push(
        <span key={`${match.index}-ch`} className="rounded-[3px] bg-[#3f4352] px-[2px] text-[#c9cdfb]">
          #channel
        </span>
      );
    } else if (token.startsWith("<@&")) {
      nodes.push(
        <span key={`${match.index}-role`} className="rounded-[3px] bg-[#3f4352] px-[2px] text-[#c9cdfb]">
          @role
        </span>
      );
    } else if (token.startsWith("<@")) {
      nodes.push(
        <span key={`${match.index}-user`} className="rounded-[3px] bg-[#3f4352] px-[2px] text-[#c9cdfb]">
          @user
        </span>
      );
    } else if (token.startsWith("<t:")) {
      nodes.push(
        <span key={`${match.index}-ts`} className="rounded-[3px] bg-[#3f4352] px-[2px] text-[#c9cdfb]">
          {formatDiscordTimestamp(token)}
        </span>
      );
    } else if (token.startsWith(":") && token.endsWith(":")) {
      nodes.push(EMOJI_MAP[token] ?? token);
    } else {
      nodes.push(token);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < content.length) {
    nodes.push(content.slice(lastIndex));
  }

  return nodes;
}

function renderPlainBlock(content: string, keyPrefix: string): ReactNode[] {
  return content.split("\n").map((line, lineIndex) => {
    const isQuote = line.trimStart().startsWith(">");
    const text = isQuote ? line.replace(/^\s*>\s?/, "") : line;
    const inline = parseInline(text);

    return (
      <div key={`${keyPrefix}-${lineIndex}`} className={cn("whitespace-pre-wrap", isQuote && "border-l-4 border-[#4e5058] pl-3 text-[#b5bac1]")}>
        {inline.length > 0 ? inline : "\u00A0"}
      </div>
    );
  });
}

export function DiscordMarkdown({ content, className }: DiscordMarkdownProps) {
  const blocks: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = CODE_BLOCK_REGEX.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const plain = content.slice(lastIndex, match.index);
      blocks.push(...renderPlainBlock(plain, `plain-${lastIndex}`));
    }

    const language = match[1]?.toLowerCase();
    const code = match[2] ?? "";
    blocks.push(
      <pre key={`code-${match.index}`} className="my-1 overflow-x-auto rounded-[4px] border border-[#1e1f22] bg-[#1e1f22] px-2 py-2 text-[12px] leading-[16px] text-[#dbdee1]">
        <code className="font-mono">{highlightCode(code, language)}</code>
      </pre>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    blocks.push(...renderPlainBlock(content.slice(lastIndex), `tail-${lastIndex}`));
  }

  return (
    <div
      className={cn(
        "font-['gg_sans','Whitney','Helvetica Neue',Helvetica,Arial,sans-serif] text-[14px] leading-[1.375] text-[#dbdee1]",
        className
      )}
    >
      {blocks}
    </div>
  );
}
