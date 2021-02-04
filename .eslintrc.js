module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: ["plugin:vue/essential", "@vue/airbnb"],
    parserOptions: {
        parser: "babel-eslint",
    },
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "off" : "off",
        'no-debugger': process.env.NODE_ENV === 'production' ? 'off' : 'off',
        indent: [2, 4], //强制为4格缩进
        quotes: [ 
            2,
            "double",
            {
                avoidEscape: true,
                allowTemplateLiterals: true
            }
        ],
        "no-continue": "off", //允许使用continue
        "prefer-destructuring": ["error", {"object": true, "array": false}], //数组不必优先使用解构
        "object-curly-newline": ["error", {
            ImportDeclaration: "never"
        }],
        "no-unused-expressions": "off",
        "semi": "off", //结尾分号无所谓
        "no-underscore-dangle": "off", //允许下划线命名
        "import/no-cycle": [2, { maxDepth: 1 }], //可以允许一层嵌套
        "import/no-extraneous-dependencies": "off", //不做依赖检查
        "max-len": ["error", { code: 400 }], //最大代码长度为400行
        "no-param-reassign": ["error", { props: false }], //函数参数非对象情况不允许直接改变
        "linebreak-style": ["off", "windows"],
        "spaced-comment": "off", //注释不做限制
    },
};
