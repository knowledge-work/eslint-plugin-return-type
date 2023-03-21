module.exports = {
  preset: 'ts-jest',
  testMatch: ['**/tests/**/*.ts'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json',
    },
  },
}
