module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        "plugin:vue/vue3-recommended",
        "@vue/standard",
        "@vue/typescript/recommended"
    ],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        "vue/html-indent": ["error", 4],
        "vue/max-attributes-per-line": "off",
        "vue/html-self-closing": "off",
        "vue/singleline-html-element-content-newline": "off",
        "space-before-function-paren": "off",
        indent: [2, 4], //强制为4格缩进
        semi: "off", //结尾分号无所谓
        "comma-dangle": "off",
        quotes: [
            2,
            "double",
            {
                avoidEscape: true,
                allowTemplateLiterals: true
            }
        ],
        "max-len": ["error", { code: 400 }], //最大代码长度为400行
        "no-param-reassign": ["error", { props: false }], //函数参数非对象情况不允许直接改变
        "linebreak-style": ["off", "windows"],
        "spaced-comment": "off", //注释不做限制
        "prefer-destructuring": [
            "error",
            {
                //申明变量解构有限，赋值可以不必解构
                VariableDeclarator: {
                    array: false,
                    object: true
                },
                AssignmentExpression: {
                    array: false,
                    object: true
                }
            }
        ]
    }
};
