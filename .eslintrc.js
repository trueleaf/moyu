/*
	作者: shuxiaokai
	相关参考: https://cn.eslint.org/docs/rules 
	日期: 2019-05-04
	最近更新: 
*/

module.exports = {
   root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'off' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'off' : 'off',
	'indent': [2, 4],//强制为4格缩进
	'quotes': [2, 'double', { //强制双引号
      'avoidEscape': true,
      'allowTemplateLiterals': true
    }],
  }
}
