// src/utils/__mocks__/logger.ts
import { jest } from '@jest/globals';

export const logger: any = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  fatal: jest.fn(),
  trace: jest.fn(),
  child: jest.fn(() => logger), // Return itself for child loggers
};
