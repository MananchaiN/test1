import { hello } from './hello';

jest.mock('./hello');

it('logs "Hello, World!" to the console', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation();
  hello();
  expect(spy).toHaveBeenCalledWith('Hello, World