import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

type Suggestions = {
    label: {
        label: string,
        description: string
    },
    kind: monaco.languages.CompletionItemKind,
    insertText: string,
    trigger: string[],
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
    trigger: ["pm."]
}, {
    label: {
        label: "get",
        description: "获取单个临时变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `get("变量名称")`,
    sortText: "1",
    trigger: ["pm.variables."]
}, {
    label: {
        label: "set",
        description: "设置临时变量值"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `set("变量名称", "变量值")`,
    sortText: "2",
    trigger: ["pm.variables."]
}, {
    label: {
        label: "update",
        description: "更新临时变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `update("变量名称", "变量值")`,
    sortText: "3",
    trigger: ["pm.variables."]
}, {
    label: {
        label: "upsert",
        description: "更新临时变量(不存在则新增)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `upsert("变量名称", "变量值")`,
    sortText: "4",
    trigger: ["pm.variables."]
}, {
    label: {
        label: "has",
        description: "判断临时变量是否存在"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `has("变量名称")`,
    trigger: ["pm.variables."]
}, {
    label: {
        label: "unset",
        description: "删除临时变量值(同delete)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `unset("变量名称")`,
    trigger: ["pm.variables."]
}, {
    label: {
        label: "delete",
        description: "删除临时变量值(同unset)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `delete("变量名称")`,
    trigger: ["pm.variables."]
}, {
    label: {
        label: "toObject",
        description: "以对象形式输出临时变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: "toObject",
    trigger: ["pm.variables."]
}]
const collectionVariableSuggestions = [{
    label: {
        label: "collectionVariables",
        description: "集合内变量(跨接口使用)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: "collectionVariables",
    sortText: "2",
    trigger: ["pm."]
}, {
    label: {
        label: "get",
        description: "获取单个变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `get("变量名称")`,
    sortText: "1",
    trigger: ["pm.collectionVariables."]
}, {
    label: {
        label: "set",
        description: "设置变量值"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `set("变量名称", "变量值")`,
    sortText: "2",
    trigger: ["pm.collectionVariables."]
}, {
    label: {
        label: "update",
        description: "更新变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `update("变量名称", "变量值")`,
    sortText: "3",
    trigger: ["pm.collectionVariables."]
}, {
    label: {
        label: "upsert",
        description: "更新变量(不存在则新增)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `upsert("变量名称", "变量值")`,
    sortText: "4",
    trigger: ["pm.collectionVariables."]
}, {
    label: {
        label: "has",
        description: "判断变量是否存在"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `has("变量名称")`,
    trigger: ["pm.collectionVariables."]
}, {
    label: {
        label: "unset",
        description: "删除变量值(同delete)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `unset("变量名称")`,
    trigger: ["pm.collectionVariables."]
}, {
    label: {
        label: "delete",
        description: "删除变量值(同unset)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `delete("变量名称")`,
    trigger: ["pm.collectionVariables."]
}, {
    label: {
        label: "toObject",
        description: "以对象形式输出变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: "toObject",
    trigger: ["pm.collectionVariables."]
}]
const requestSuggestions = [{
    label: {
        label: "request",
        description: "全局请求"
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: "request",
    sortText: "3",
    trigger: ["pm."]
}, {
    label: {
        label: "url",
        description: "请求url"
    },
    sortText: "1",
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: "url",
    trigger: ["pm.request."]
}, {
    label: {
        label: "fullUrl",
        description: "完整请求url"
    },
    sortText: "2",
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: "fullUrl",
    trigger: ["pm.request."]
}, {
    label: {
        label: "method",
        description: "请求方法(GET|POST|PUT...)"
    },
    sortText: "3",
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: "method",
    trigger: ["pm.request."]
}, {
    label: {
        label: "host",
        description: "请求host"
    },
    sortText: "4",
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: "host",
    trigger: ["pm.request."]
}, {
    label: {
        label: "path",
        description: "请求path"
    },
    sortText: "5",
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: "path",
    trigger: ["pm.request."]
}, {
    label: {
        label: "replaceUrl",
        description: "替换url(最终发送替换后的url)"
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: `replaceUrl("替换后的url eg:https://www.baidu.com")`,
    trigger: ["pm.request."]
}, {
    label: {
        label: "headers",
        description: "请求头"
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: `headers`,
    trigger: ["pm.request."]
}, {
    label: {
        label: "add",
        description: "新增请求头"
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: `add("名称", "值")`,
    trigger: ["pm.request.headers."]
}, {
    label: {
        label: "delete",
        description: "删除请求头"
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: `delete("名称")`,
    trigger: ["pm.request.headers."]
}, {
    label: {
        label: "remove",
        description: "删除请求头"
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: `remove("名称")`,
    trigger: ["pm.request.headers."]
}, {
    label: {
        label: "update",
        description: "更新请求头"
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: `update("名称", "值")`,
    trigger: ["pm.request.headers."]
}, {
    label: {
        label: "upsert",
        description: "更新请求头，如果没有则新增"
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: `remove("名称", "值")`,
    trigger: ["pm.request.headers."]
}]

const suggestions: Suggestions = [{
    label: {
        label: "pm",
        description: "全局对象"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: "pm",
    trigger: ["p"],
},
...variableSuggestions,
...collectionVariableSuggestions,
...requestSuggestions]

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
