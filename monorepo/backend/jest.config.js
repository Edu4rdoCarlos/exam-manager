/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.e2e-spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
      },
    ],
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@exam-manager/database$': '<rootDir>/../database/src/generated/client',
    '^pdfmake/src/printer$': '<rootDir>/test/mocks/pdfmake-printer.mock.js',
  },
  testTimeout: 30000,
};
