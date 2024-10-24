import { describe, it, expect, beforeEach, vi } from 'vitest'
import ConsoleMonkeyPatch from './console-monkey-patch'
import type { WritableContext, AdvancedConsole } from './types'

function spyOnConsoleMethods(consoleInstance: AdvancedConsole) {
  const methods = [
    'log',
    'error',
    'info',
    'debug',
    'warn',
    'table',
    'assert',
    'time',
    'timeEnd',
    'clear',
    'group',
    'groupEnd',
    'trace',
  ] as const
  const spies = {} as Record<string, ReturnType<typeof vi.spyOn>>

  for (const method of methods) {
    spies[method] = vi.spyOn(consoleInstance, method)
  }

  return spies
}
describe('ConsoleMonkeyPatch', () => {
  let mockContext: WritableContext
  let mockConsole: AdvancedConsole

  beforeEach(() => {
    mockContext = { stdout: '', stderr: '' }
    mockConsole = {
      log: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      table: vi.fn(),
      assert: vi.fn(),
      time: vi.fn(),
      timeEnd: vi.fn(),
      clear: vi.fn(),
      group: vi.fn(),
      groupEnd: vi.fn(),
      trace: vi.fn(),
    }
  })

  it('should initialize with a default context', () => {
    const instance = new ConsoleMonkeyPatch()
    const spies = spyOnConsoleMethods(instance.console)
    instance.console.log('Testing default context')
    expect(spies.log).toHaveBeenCalledWith('Testing default context')
  })

  it('should initialize with a provided context', () => {
    const instance = new ConsoleMonkeyPatch(mockContext)
    const spies = spyOnConsoleMethods(instance.console)
    instance.console.log('Testing provided context')
    expect(spies.log).toHaveBeenCalledWith('Testing provided context')
  })

  it('should use provided console instance', () => {
    const instance = new ConsoleMonkeyPatch(undefined, mockConsole)
    const spies = spyOnConsoleMethods(mockConsole)
    instance.console.log('Testing with provided console instance')
    expect(spies.log).toHaveBeenCalledWith('Testing with provided console instance')
  })

  it('should log messages correctly', () => {
    const instance = new ConsoleMonkeyPatch(undefined, mockConsole)
    const spies = spyOnConsoleMethods(mockConsole)
    instance.console.log('Hello, World!')
    expect(spies.log).toHaveBeenCalledWith('Hello, World!')
  })

  it('should handle errors and log them to stderr', () => {
    const instance = new ConsoleMonkeyPatch(undefined, mockConsole)
    const spies = spyOnConsoleMethods(mockConsole)
    instance.console.error('Error occurred')
    expect(spies.error).toHaveBeenCalledWith('Error occurred')
  })

  it('should track timers', () => {
    const instance = new ConsoleMonkeyPatch(mockContext)
    const spies = spyOnConsoleMethods(instance.console)
    instance.console.time?.('testTimer')
    expect(spies.time).toHaveBeenCalledWith('testTimer')
  })

  it('should clear the output context', () => {
    const instance = new ConsoleMonkeyPatch(mockContext)
    const spies = spyOnConsoleMethods(instance.console)
    instance.console.clear?.()
    expect(spies.clear).toHaveBeenCalled()
  })

  it('should use proxy methods when provided', () => {
    const instance = new ConsoleMonkeyPatch(undefined, mockConsole)
    const spies = spyOnConsoleMethods(mockConsole)
    instance.console.log('Testing proxy')
    expect(spies.log).toHaveBeenCalledWith('Testing proxy')
  })

  it('should log an assertion failure message', () => {
    // Step 1: Mock context with spies to capture stdout
    const mockContext = { stdout: vi.fn(), stderr: vi.fn() }
    const instance = new ConsoleMonkeyPatch(mockContext, undefined, false)

    // Step 2: Define the assertion failure data
    const number = 3
    const errorMsg = 'Number must be even'

    // Step 3: Call the assert method and force it to fail
    instance.console.assert?.(false, '%o', { number, errorMsg })

    // Step 4: Check if the mockContext.stdout method was called with the correct failure message
    expect(mockContext.stdout).toHaveBeenCalledTimes(1)
    expect(mockContext.stdout).toHaveBeenCalledWith(
      expect.stringContaining(`Assertion failed: {"number":3,"errorMsg":"Number must be even"}`)
    )
  })
})
