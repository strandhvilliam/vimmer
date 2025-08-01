import ReactMarkdown from "react-markdown";

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="text-sm font-medium mb-2">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1 mb-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1 mb-2">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm font-medium">{children}</li>
          ),
          h1: ({ children }) => (
            <h1 className="text-lg font-rocgrotesk font-bold mb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-rocgrotesk font-semibold mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-rocgrotesk font-semibold mb-1">
              {children}
            </h3>
          ),
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ children, href }) => (
            <a
              href={href}
              className="underline text-blue-600 hover:text-blue-800"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
