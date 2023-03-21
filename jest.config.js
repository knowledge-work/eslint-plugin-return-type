module.exports = {
  preset: 'ts-jest',
  testMatch: ['**/tests/**/*.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: './tsconfig.test.json' }],
  },
}
