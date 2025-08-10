import { FC } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownI {
    children: string;
}

const Markdown: FC<MarkdownI> = ({ children }) => {
    return (
        <div>
            <div className="unreset">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {children}
                </ReactMarkdown>
            </div>
        </div>
    );
};

export default Markdown;
