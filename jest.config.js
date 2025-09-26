module.exports = {
  clearMocks: true,
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'https://example.com'
  },
  testMatch: ['<rootDir>/site/**/?(*.)+(spec|test).js'],
};
