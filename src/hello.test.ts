import { runHello } from './hello';

import { expect } from '@jest/globals';

it('prints Hello, world to the console', async () => {
  const originalConsoleLog = console.log;
  console.log = jest.fn();
  runHello();
  expect(console