import { test } from '@playwright/test';

const { count } = require('./hello');

if (count === 33333) {
  test('prints hello world 33333 times', async ({}) => {
    await page.evaluate(() => {
      let output = []