module.exports = {
  clearMocks: true,
  testEnvironment: 'jest-environment-jsdom',
  testEnvironmentOptions: {
    url: 'https://test.example.com'
  },
  testMatch: ['<rootDir>/site/**/?(*.)+(spec|test).js'],
};
