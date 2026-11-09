import React from 'react';
import { Copy, Check } from 'lucide-react';

export default function MarkdownMessage({ content }) {
  const [copiedIndex, setCopiedIndex] = React.useState(null);

  const copyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!content) return null;

  // Split content by code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let blockIndex = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        value: content.slice(lastIndex, match.index),
      });
    }
    parts.push({
      type: 'code',
      lang: match[1] || 'python',
      code: match[2].trim(),
      index: blockIndex++,
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      value: content.slice(lastIndex),
    });
  }

  const renderInlineFormatted = (text) => {
    // Split by inline code `...`
    const inlineParts = text.split(/(`[^`]+`)/g);
    return inlineParts.map((chunk, i) => {
      if (chunk.startsWith('`') && chunk.endsWith('`') && chunk.length > 2) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-cyan-300 text-xs">
            {chunk.slice(1, -1)}
          </code>
        );
      }

      // Bold **text**
      const boldParts = chunk.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bChunk, bi) => {
        if (bChunk.startsWith('**') && bChunk.endsWith('**') && bChunk.length > 4) {
          return (
            <strong key={`${i}-${bi}`} className="text-white font-semibold">
              {bChunk.slice(2, -2)}
            </strong>
          );
        }
        return bChunk;
      });
    });
  };

  const renderTextParagraphs = (textBlock) => {
    const lines = textBlock.split('\n');
    return lines.map((line, li) => {
      const trimmed = line.trim();

      // Horizontal Divider
      if (trimmed === '---') {
        return <hr key={li} className="border-t border-slate-700/60 my-3" />;
      }

      // Headers
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={li} className="text-base font-bold text-cyan-300 mt-4 mb-2 flex items-center gap-1.5">
            {renderInlineFormatted(trimmed.slice(4))}
          </h3>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={li} className="text-lg font-bold text-white mt-4 mb-2">
            {renderInlineFormatted(trimmed.slice(3))}
          </h2>
        );
      }
      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={li} className="text-xl font-extrabold text-white mt-5 mb-2.5">
            {renderInlineFormatted(trimmed.slice(2))}
          </h1>
        );
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <div key={li} className="flex items-start gap-2 ml-2 my-1">
            <span className="text-cyan-400 font-bold select-none">•</span>
            <span className="text-slate-200">{renderInlineFormatted(trimmed.slice(2))}</span>
          </div>
        );
      }

      // Numbered lists e.g. "1. "
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={li} className="flex items-start gap-2 ml-2 my-1">
            <span className="font-mono text-cyan-400 font-bold text-xs pt-0.5 select-none">{numMatch[1]}.</span>
            <span className="text-slate-200">{renderInlineFormatted(numMatch[2])}</span>
          </div>
        );
      }

      if (!trimmed) {
        return <div key={li} className="h-2" />;
      }

      return (
        <p key={li} className="my-1.5 text-slate-200 leading-relaxed">
          {renderInlineFormatted(line)}
        </p>
      );
    });
  };

  return (
    <div className="space-y-1">
      {parts.map((part, pi) => {
        if (part.type === 'code') {
          return (
            <div key={pi} className="my-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <span className="uppercase">{part.lang || 'python'}</span>
                <button
                  type="button"
                  onClick={() => copyCode(part.code, part.index)}
                  className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  {copiedIndex === part.index ? (
                    <>
                      <Check size={12} className="text-green-400" />
                      <span className="text-green-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 text-xs font-mono text-cyan-100 overflow-x-auto leading-relaxed scrollbar-thin">
                <code>{part.code}</code>
              </pre>
            </div>
          );
        }
        return <div key={pi}>{renderTextParagraphs(part.value)}</div>;
      })}
    </div>
  );
}

