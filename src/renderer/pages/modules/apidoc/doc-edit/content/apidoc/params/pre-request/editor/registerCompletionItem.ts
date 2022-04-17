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
const requestSuggestions = [{
    label: {
        label: "request",
        description: "全局请求"
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: "request",
    sortText: "3",
    keyword: "pm.request",
}, {
    label: {
        label: "sendRequest",
        description: "发送请求"
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: `sendRequest("请求url", (err, response) => {})`,
    sortText: "4",
    keyword: "pm.sendRequest",
}, {
    label: {
        label: "url",
        description: "请求url"
    },
    sortText: "1",
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: "url",
    keyword: "pm.request.url",
}, {
    label: {
        label: "fullUrl",
        description: "完整请求url"
    },
    sortText: "2",
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: "fullUrl",
    keyword: "pm.request.fullUrl",
}, {
    label: {
        label: "method",
        description: "请求方法(GET|POST|PUT...)"
    },
    sortText: "3",
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: "method",
    keyword: "pm.request.method",
}, {
    label: {
        label: "host",
        description: "请求host"
    },
    sortText: "4",
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: "host",
    keyword: "pm.request.host",
}, {
    label: {
        label: "path",
        description: "请求path"
    },
    sortText: "5",
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: "path",
    keyword: "pm.request.path",
}, {
    label: {
        label: "replaceUrl",
        description: "替换url(最终发送替换后的url)"
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: `replaceUrl("替换后的url eg:https://www.baidu.com")`,
    keyword: "pm.request.replaceUrl",
}, {
    label: {
        label: "headers",
        description: "请求头"
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: `headers`,
    keyword: "pm.request.headers",
}, {
    label: {
        label: "add",
        description: "新增请求头"
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: `add("名称", "值")`,
    keyword: "pm.request.headers.add",
}, {
    label: {
        label: "delete",
        description: "删除请求头"
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: `delete("名称")`,
    keyword: "pm.request.headers.delete",
}, {
    label: {
        label: "remove",
        description: "删除请求头"
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: `remove("名称")`,
    keyword: "pm.request.headers.remove",
}, {
    label: {
        label: "update",
        description: "更新请求头"
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: `update("名称", "值")`,
    keyword: "pm.request.headers.update",
}, {
    label: {
        label: "upsert",
        description: "更新请求头，如果没有则新增"
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: `upsert("名称", "值")`,
    keyword: "pm.request.headers.upsert",
}, {
    label: {
        label: "queryParams",
        description: "请求query参数"
    },
    kind: monaco.languages.CompletionItemKind.Module,
    insertText: `queryParams`,
    keyword: "pm.request.queryParams",
}, {
    label: {
        label: "body",
        description: "请求body参数"
    },
    kind: monaco.languages.CompletionItemKind.Module,
    insertText: `body`,
    keyword: "pm.request.body",
}, {
    label: {
        label: "json",
        description: "json参数"
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: `json`,
    keyword: "pm.request.body.json",
}, {
    label: {
        label: "urlencoded",
        description: "urlencoded参数"
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: `urlencoded`,
    keyword: "pm.request.body.urlencoded",
}, {
    label: {
        label: "formdata",
        description: "formdata参数"
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: `formdata`,
    keyword: "pm.request.body.formdata",
}, {
    label: {
        label: "raw",
        description: "raw参数"
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: `raw`,
    keyword: "pm.request.body.raw",
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
