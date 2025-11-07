// src/utils/__mocks__/logger.ts
export const logger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  fatal: jest.fn(),
  trace: jest.fn(),
  child: jest.fn(() => logger), // Return itself for child loggers
};
