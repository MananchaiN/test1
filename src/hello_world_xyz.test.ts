import { helloWorldXYZ } from './hello_world_xyz';

jest.mock('./hello_world_xyz');

describe('helloWorldXYZ function', () => {
    it('should log "Hello World XYZ"', () => {
        console.log = jest.fn();
        helloWorldXYZ();
