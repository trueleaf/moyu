import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

export default function createDependencyProposals(range: monaco.IRange): monaco.languages.CompletionItem[] {
    return [
        {
            label: "lodash",
            kind: monaco.languages.CompletionItemKind.Function,
            detail: "测试",
            insertText: `"lodash": "aaaaaaaaaaa"`,
            range
        },
    ];
}
