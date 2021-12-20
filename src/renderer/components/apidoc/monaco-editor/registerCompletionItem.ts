import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

const variableSuggestion = [{
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
const collectionVariableSuggestion = [{
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
        description: "获取单个集合内变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `get("变量名称")`,
    sortText: "1",
    trigger: ["pm.collectionVariables."]
}, {
    label: {
        label: "set",
        description: "设置集合内变量值"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `set("变量名称", "变量值")`,
    sortText: "2",
    trigger: ["pm.collectionVariables."]
}, {
    label: {
        label: "update",
        description: "更新集合内变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `update("变量名称", "变量值")`,
    sortText: "3",
    trigger: ["pm.collectionVariables."]
}, {
    label: {
        label: "upsert",
        description: "更新集合内变量(不存在则新增)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `upsert("变量名称", "变量值")`,
    sortText: "4",
    trigger: ["pm.collectionVariables."]
}, {
    label: {
        label: "has",
        description: "判断集合内变量是否存在"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `has("变量名称")`,
    trigger: ["pm.collectionVariables."]
}, {
    label: {
        label: "unset",
        description: "删除集合内变量值(同delete)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `unset("变量名称")`,
    trigger: ["pm.collectionVariables."]
}, {
    label: {
        label: "delete",
        description: "删除集合内变量值(同unset)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `delete("变量名称")`,
    trigger: ["pm.collectionVariables."]
}, {
    label: {
        label: "toObject",
        description: "以对象形式输出集合内变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: "toObject",
    trigger: ["pm.collectionVariables."]
}]

const suggestions = [{
    label: {
        label: "pm",
        description: "全局对象"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: "pm",
    trigger: ["p"],
}, ...variableSuggestion, ...collectionVariableSuggestion, {
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
        label: "rawUrl",
        description: "原始url(变量未被替换)"
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: "rawUrl",
    trigger: ["pm.request."]
}, {
    label: {
        label: "replaceUrl",
        description: "替换url(最终发送替换后的url)"
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: `replaceUrl("替换后的url eg:https://www.baidu.com")`,
    trigger: ["pm.request."]
}]

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
