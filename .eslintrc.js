module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  globals: {
    __static: true
  },
  plugins: [
    'html'
  ],
  'rules': {
	
   
	'indent': [2, 4],//强制为4格缩进
	'quotes': [2, 'double', { //强制双引号
      'avoidEscape': true,
      'allowTemplateLiterals': true
    }],
	'spaced-comment': 'off', //注释后面可以没有空格
	'space-before-function-paren': 'off', //取消函数后面一致的空格
	'semi': 'off', //末尾是否有分号不做限制
	'comma-dangle': 'off', //拖尾逗号不做限制
	'no-trailing-spaces': 'off', //允许存在额外空白换行
	'no-multiple-empty-lines': 'off', //允许多行空白
	'dot-notation': 'off'
  }
}
