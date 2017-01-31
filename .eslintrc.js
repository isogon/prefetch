module.exports = {
  extends: 'airbnb',
  parser: 'babel-eslint',
  env: {
    browser: true,
    node: true,
    jest: true
  },
  rules: {
    'no-param-reassign': [2, {props: false}],
    'prefer-arrowcallback': 0,
    'react/jsx-filename-extension': 0,
    'arrow-parens': ['error', 'always'],
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'never',
      exports: 'never',
      functions: 'never',
    }]
  },
  settings: {
    'import/parser': 'babel-eslint',
    'import/resolve': {
      moduleDirectory: ['node_modules', 'modules']
    }
  }
}
