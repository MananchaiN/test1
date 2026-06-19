import { expect } from 'chai';
import { logHelloWorld } from '../src/hello_world';

describe('Hello World Test', () => {
  it('should log the correct message', () => {
    console.log = jest.fn();
    logHelloWorld();
