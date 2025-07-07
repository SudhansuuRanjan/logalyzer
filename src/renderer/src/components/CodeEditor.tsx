import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { cpp } from "@codemirror/lang-cpp";

function CodeEditor({ value }) {
    return (
        <CodeMirror
            value={value || ""}
            height="400px"
            extensions={[javascript(), cpp()]}
        />
    );
}

export default CodeEditor;