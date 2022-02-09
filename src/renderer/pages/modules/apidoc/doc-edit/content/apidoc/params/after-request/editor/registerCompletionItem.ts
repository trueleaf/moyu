import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

type Suggestions = {
    label: {
        label: string,
        description: string
    },
    kind: monaco.languages.CompletionItemKind,
    insertText: string,
    keyword: string,
    sortText?: string
}[]

const variableSuggestions = [{
    label: {
        label: "variables",
        description: "临时变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: "variables",
    sortText: "1",
    keyword: "pm.variables",
}, {
    label: {
        label: "get",
        description: "获取单个临时变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `get("变量名称")`,
    sortText: "1",
    keyword: "pm.variables.get",
}, {
    label: {
        label: "set",
        description: "设置临时变量值"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `set("变量名称", "变量值")`,
    sortText: "2",
    keyword: "pm.variables.set",
}, {
    label: {
        label: "update",
        description: "更新临时变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `update("变量名称", "变量值")`,
    sortText: "3",
    keyword: "pm.variables.update",
}, {
    label: {
        label: "upsert",
        description: "更新临时变量(不存在则新增)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `upsert("变量名称", "变量值")`,
    sortText: "4",
    keyword: "pm.variables.upsert",
}, {
    label: {
        label: "has",
        description: "判断临时变量是否存在"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `has("变量名称")`,
    keyword: "pm.variables.has",
}, {
    label: {
        label: "unset",
        description: "删除临时变量值(同delete)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `unset("变量名称")`,
    keyword: "pm.variables.unset",
}, {
    label: {
        label: "delete",
        description: "删除临时变量值(同unset)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `delete("变量名称")`,
    keyword: "pm.variables.delete",
}, {
    label: {
        label: "toObject",
        description: "以对象形式输出临时变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: "toObject",
    keyword: "pm.variables.toObject",
}]
const collectionVariableSuggestions = [{
    label: {
        label: "collectionVariables",
        description: "集合内变量(跨接口使用)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: "collectionVariables",
    sortText: "2",
    keyword: "pm.collectionVariables",
}, {
    label: {
        label: "get",
        description: "获取单个变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `get("变量名称")`,
    sortText: "1",
    keyword: "pm.collectionVariables.get",
}, {
    label: {
        label: "set",
        description: "设置变量值"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `set("变量名称", "变量值")`,
    sortText: "2",
    keyword: "pm.collectionVariables.set",
}, {
    label: {
        label: "update",
        description: "更新变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `update("变量名称", "变量值")`,
    sortText: "3",
    keyword: "pm.collectionVariables.update",
}, {
    label: {
        label: "upsert",
        description: "更新变量(不存在则新增)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `upsert("变量名称", "变量值")`,
    sortText: "4",
    keyword: "pm.collectionVariables.upsert",
}, {
    label: {
        label: "has",
        description: "判断变量是否存在"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `has("变量名称")`,
    keyword: "pm.collectionVariables.has",
}, {
    label: {
        label: "unset",
        description: "删除变量值(同delete)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `unset("变量名称")`,
    keyword: "pm.collectionVariables.unset",
}, {
    label: {
        label: "delete",
        description: "删除变量值(同unset)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `delete("变量名称")`,
    keyword: "pm.collectionVariables.delete",
}, {
    label: {
        label: "toObject",
        description: "以对象形式输出变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: "toObject",
    keyword: "pm.collectionVariables.toObject",
}]
const responseSuggestions = [{
    label: {
        label: "sendRequest",
        description: "发送请求"
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: `sendRequest("请求url", (err, response) => {})`,
    sortText: "4",
    keyword: "pm.sendRequest",
}]

const suggestions: Suggestions = [{
    label: {
        label: "pm",
        description: "全局对象"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: "pm",
    keyword: "pm",
},
...variableSuggestions,
...collectionVariableSuggestions,
...responseSuggestions]

export function useCompletionItem(): monaco.IDisposable {
    return monaco.languages.registerCompletionItemProvider("javascript", {
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
            const matchedSuggestions = suggestions.filter(v => {
                const activeStrArr = activeStr.split(".");
                const keywordArr = v.keyword.split(".");
                for (let i = 0; i < activeStrArr.length - 1; i += 1) {
                    if (activeStrArr[i] !== keywordArr[i]) {
                        return false;
                    }
                }
                if (activeStrArr.length < keywordArr.length) return false;
                // console.log(v.keyword, activeStr)
                const matchedTrigger = v.keyword.includes(activeStr);
                return matchedTrigger
            });
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
                    sortText: v.sortText || v.label.label,
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
