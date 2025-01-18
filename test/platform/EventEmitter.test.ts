import { EventEmitter } from '../../src/platform/EventEmitter';

describe('EventEmitter', () => {
    let emitter: EventEmitter;
    
    beforeEach(() => {
        emitter = new EventEmitter();
    });

    describe('Basic Event Handling', () => {
        test('should register and emit events', () => {
            const mockCallback = jest.fn();
            emitter.on('test', mockCallback);
            
            emitter.emit('test', 'data');
            expect(mockCallback).toHaveBeenCalledWith('data');
        });

        test('should handle multiple listeners', () => {
            const mockCallback1 = jest.fn();
            const mockCallback2 = jest.fn();
            
            emitter.on('test', mockCallback1);
            emitter.on('test', mockCallback2);
            
            emitter.emit('test', 'data');
            
            expect(mockCallback1).toHaveBeenCalledWith('data');
            expect(mockCallback2).toHaveBeenCalledWith('data');
        });

        test('should handle multiple arguments', () => {
            const mockCallback = jest.fn();
            emitter.on('test', mockCallback);
            
            emitter.emit('test', 'arg1', 'arg2', 'arg3');
            expect(mockCallback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
        });
    });

    describe('Event Removal', () => {
        test('should remove specific listener', () => {
            const mockCallback = jest.fn();
            emitter.on('test', mockCallback);
            emitter.off('test', mockCallback);
            
            emitter.emit('test');
            expect(mockCallback).not.toHaveBeenCalled();
        });

        test('should remove all listeners for event', () => {
            const mockCallback1 = jest.fn();
            const mockCallback2 = jest.fn();
            
            emitter.on('test', mockCallback1);
            emitter.on('test', mockCallback2);
            
            emitter.removeAllListeners('test');
            emitter.emit('test');
            
            expect(mockCallback1).not.toHaveBeenCalled();
            expect(mockCallback2).not.toHaveBeenCalled();
        });

        test('should remove all listeners', () => {
            const mockCallback1 = jest.fn();
            const mockCallback2 = jest.fn();
            
            emitter.on('test1', mockCallback1);
            emitter.on('test2', mockCallback2);
            
            emitter.removeAllListeners();
            
            emitter.emit('test1');
            emitter.emit('test2');
            
            expect(mockCallback1).not.toHaveBeenCalled();
            expect(mockCallback2).not.toHaveBeenCalled();
        });
    });

    describe('Once Events', () => {
        test('should trigger once event only one time', () => {
            const mockCallback = jest.fn();
            emitter.once('test', mockCallback);
            
            emitter.emit('test', 'first');
            emitter.emit('test', 'second');
            
            expect(mockCallback).toHaveBeenCalledTimes(1);
            expect(mockCallback).toHaveBeenCalledWith('first');
        });
    });

    describe('Error Handling', () => {
        test('should continue executing callbacks if one throws', () => {
            const mockCallback1 = jest.fn().mockImplementation(() => {
                throw new Error('Test error');
            });
            const mockCallback2 = jest.fn();
            
            emitter.on('test', mockCallback1);
            emitter.on('test', mockCallback2);
            
            // Should not throw
            emitter.emit('test');
            
            expect(mockCallback2).toHaveBeenCalled();
        });

        test('should handle removal of non-existent listener', () => {
            const mockCallback = jest.fn();
            // Should not throw
            emitter.off('test', mockCallback);
        });
    });

    describe('Utility Methods', () => {
        test('should count listeners correctly', () => {
            const mockCallback1 = jest.fn();
            const mockCallback2 = jest.fn();
            
            emitter.on('test', mockCallback1);
            emitter.on('test', mockCallback2);
            
            expect(emitter.listenerCount('test')).toBe(2);
        });

        test('should return event names', () => {
            const mockCallback = jest.fn();
            
            emitter.on('test1', mockCallback);
            emitter.on('test2', mockCallback);
            
            const eventNames = emitter.eventNames();
            expect(eventNames).toContain('test1');
            expect(eventNames).toContain('test2');
            expect(eventNames).toHaveLength(2);
        });
    });
});
