import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

const suggestions = [{
    label: "pm",
    kind: monaco.languages.CompletionItemKind.Function,
    detail: "全局对象",
    insertText: "pm",
    trigger: ["p"],
    documentation: "xxxxxxx"
}, {
    label: "pm.variables",
    kind: monaco.languages.CompletionItemKind.Method,
    detail: "全局变量",
    insertText: "variables",
    documentation: "documentation",
    trigger: ["pm."]
}]

export function useCompletionItem(): void {
    // monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ noLib: true });
    monaco.languages.registerCompletionItemProvider("javascript", {
        triggerCharacters: ["."],
        provideCompletionItems(model, position) {
            const currentLineStr = model.getValueInRange({
                startLineNumber: position.lineNumber,
                startColumn: 0,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            });
            const lineStrArr = currentLineStr.replace("\t", "").split(" ");
            const activeStr = lineStrArr[lineStrArr.length - 1];
            const matchedSuggestions = suggestions.filter(v => v.trigger.includes(activeStr));
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };
            const result: monaco.languages.CompletionItem[] = matchedSuggestions.map(v => {
                const data = {
                    label: v.label,
                    kind: v.kind,
                    detail: v.detail,
                    insertText: v.insertText,
                    documentation: v.documentation || "",
                    range,
                    preselect: true
                }
                return data;
            })
            return {
                suggestions: result
            };
        }
    })
}
