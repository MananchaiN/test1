import { test } from '@playwright/test';

export const test1 = test('should output hello world', async ({}) => {
  expect.assertions(1);
  console.log('Hello, world!');
});
