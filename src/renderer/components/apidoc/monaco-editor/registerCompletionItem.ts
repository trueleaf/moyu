import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

const suggestions = [{
    label: {
        label: "pm",
        description: "全局对象"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: "pm",
    trigger: ["p"],
}, {
    label: {
        label: "variables",
        description: "临时变量"
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: "variables",
    trigger: ["pm."]
}, {
    label: {
        label: "request",
        description: "全局请求"
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: "request",
    trigger: ["pm."]
}, {
    label: {
        label: "get",
        description: "获取临时变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: "get",
    trigger: ["pm.variables."]
}]

export function useCompletionItem(): void {
    monaco.languages.registerCompletionItemProvider("javascript", {
        triggerCharacters: [".", "("],
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
                    insertText: v.insertText,
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
