//git commit 格式
module.exports = {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "type-enum": [
            2,
            "always",
            [
                "init", //初始化项目
                "upd", //更新某个功能
                "feat", //新功能
                "fix", //修复bug
                "style", //样式修改
                "refactor", //重构
                "remove", //文件删除或者移动
                "merge", //冲突合并
                "doc", //文档更新(README更新)
                "clear", //注释内容处理，console之内无用代码删除
                "cli", //构建工具改变
            ],
        ],
    },
};
