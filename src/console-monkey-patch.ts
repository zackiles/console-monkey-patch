import type { WritableContext, BasicConsole, AdvancedConsole, ConsoleMethodArgument } from './types'
/**
 * ConsoleMonkeyPatch provides a way to intercept, transform, and redirect console output.
 * This is particularly useful for:
 * - Testing console output in unit tests
 * - Capturing console logs in environments without a real console
 * - Modifying console behavior without changing application code
 * - Supporting both string-based and function-based output targets
 *
 * The class supports two main modes:
 * 1. Default mode: Creates a new console-like interface
 * 2. Proxy mode: Wraps an existing console instance
 *
 * Additionally, it supports "hook mode" which allows logging to both the original
 * console and the patched target simultaneously.
 */

class ConsoleMonkeyPatch {
  /**
   * Creates a new ConsoleMonkeyPatch instance.
   *
   * @param context - Defines where console output should be redirected:
   *                 - Can be string-based (appends to strings)
   *                 - Can be function-based (calls functions with output)
   * @param consoleInstance - Optional existing console to patch
   * @param hookMode - If true, output goes to both original and patched destinations
   *
   * Example:
   * ```typescript
   * // String-based context
   * const context = { stdout: '', stderr: '' };
   * const patch = new ConsoleMonkeyPatch(context);
   *
   * // Function-based context
   * const fnContext = {
   *   stdout: (msg: string) => saveToFile(msg),
   *   stderr: (msg: string) => reportError(msg)
   * };
   * const patch = new ConsoleMonkeyPatch(fnContext);
   * ```
   */
  private context: WritableContext
  private timers: Map<string, number>
  public console: AdvancedConsole
  private originalUnpatchedConsoleInstance: Partial<AdvancedConsole>

  constructor(
    context?: WritableContext,
    consoleInstance?: BasicConsole | AdvancedConsole,
    hookMode = false
  ) {
    this.context = context || { stdout: '', stderr: '' }
    this.timers = new Map()
    this.originalUnpatchedConsoleInstance = { ...consoleInstance }

    this.console = consoleInstance
      ? this.createProxy(consoleInstance, hookMode)
      : this.createDefaultConsole(hookMode)
  }

  /**
   * Creates a default console implementation that redirects all output
   * through the patching system. This is used when no external console
   * instance is provided.
   *
   * Implements all standard console methods including:
   * - Basic logging (log, info, debug, error, warn)
   * - Advanced features (table, assert, time/timeEnd)
   * - Grouping and tracing (group, groupEnd, trace)
   *
   * Each method properly formats its output and respects the hookMode setting.
   */
  private createDefaultConsole(hookMode: boolean): AdvancedConsole {
    const defaultConsole: AdvancedConsole = {
      log: this.logOrSend('log', hookMode),
      info: this.logOrSend('info', hookMode),
      debug: this.logOrSend('debug', hookMode),
      error: this.logOrSend('error', hookMode),
      warn: this.logOrSend('warn', hookMode),
      table: (
        data?: ReadonlyArray<object | [string, ...string[]]>,
        ...optionalParams: ConsoleMethodArgument[]
      ) => {
        const formattedData = JSON.stringify(data)
        return this.logOrSend('table', hookMode)(formattedData, ...optionalParams)
      },
      assert: (condition: boolean, ...data: ConsoleMethodArgument[]) => {
        if (!condition) {
          let message = 'Assertion failed:'

          if (typeof data[0] === 'string' && data[0].includes('%o')) {
            const formatStr = data[0]
            const objToFormat = data[1]
            message = `Assertion failed: ${formatStr.replace('%o', JSON.stringify(objToFormat))}`
          } else {
            message = `Assertion failed: ${data
              .map((arg) => {
                return typeof arg === 'object' ? JSON.stringify(arg) : arg
              })
              .join(' ')}`
          }

          return this.logOrSend('log', hookMode)(message)
        }
      },
      time: (label: ConsoleMethodArgument = 'default') => {
        const labelStr = String(label)
        if (this.timers.has(labelStr)) {
          return this.console.error?.(`Timer '${labelStr}' already exists`)
        }
        this.timers.set(labelStr, Date.now())
      },
      timeEnd: (label: ConsoleMethodArgument = 'default') => {
        const labelStr = String(label)
        const startTime = this.timers.get(labelStr)
        if (startTime !== undefined) {
          const duration = Date.now() - startTime
          this.timers.delete(labelStr)
          return this.console.log?.(`${labelStr}: ${duration}ms`)
        }
        return this.console.error?.(`Timer '${labelStr}' does not exist`)
      },
      clear: () => {
        if (typeof this.context.stdout === 'string') {
          this.context.stdout = ''
        }
        if (typeof this.context.stderr === 'string') {
          this.context.stderr = ''
        }

        const originalClear = this.originalUnpatchedConsoleInstance.clear
        return originalClear?.call(this.originalUnpatchedConsoleInstance)
      },
      group: this.logOrSend('group', hookMode),
      groupEnd: this.logOrSend('groupEnd', hookMode),
      trace: (...args: ConsoleMethodArgument[]) => {
        const traceMessage = new Error().stack || 'No stack trace available'
        return this.logOrSend('trace', hookMode)(...args, traceMessage)
      },
    }
    return defaultConsole
  }

  /**
   * Core logging function that handles the actual redirection of console output.
   *
   * Features:
   * - Formats messages consistently with LOG: prefix
   * - Handles object serialization
   * - Supports format strings (e.g., %o for objects)
   * - Respects hookMode for dual output
   *
   * @param method - The console method being used (log, error, etc.)
   * @param hookMode - Whether to also output to original console
   */
  private logOrSend(method: keyof AdvancedConsole, hookMode: boolean) {
    return (...args: ConsoleMethodArgument[]) => {
      let message = ''

      for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        message += typeof arg === 'object' ? JSON.stringify(arg) : `${arg} `
      }

      const formattedMessage = `LOG: ${message.trim()}`
      this.writeToTarget(method, formattedMessage)

      if (hookMode && this.originalUnpatchedConsoleInstance[method]) {
        const originalMethod = this.originalUnpatchedConsoleInstance[method]
        if (typeof originalMethod === 'function') {
          return Reflect.apply(originalMethod, this.originalUnpatchedConsoleInstance, args)
        }
      }
    }
  }

  /**
   * Creates a proxy wrapper around an existing console instance.
   * This allows interception and modification of console method calls
   * while maintaining the original console's behavior when desired.
   *
   * Special handling is provided for:
   * - assert: Ensures consistent assertion failure messages
   * - hookMode: Controls whether to call original methods
   *
   * @param consoleInstance - The console instance to wrap
   * @param hookMode - Whether to preserve original console behavior
   */
  private createProxy(
    consoleInstance: BasicConsole | AdvancedConsole,
    hookMode: boolean
  ): AdvancedConsole {
    return new Proxy(consoleInstance, {
      get: (target, prop: string) => {
        const targetMethod = target[prop as keyof typeof target]

        if (prop === 'assert') {
          return (condition: boolean, ...data: ConsoleMethodArgument[]) => {
            if (!condition) {
              return this.logOrSend('log', hookMode)('Assertion failed:', ...data)
            }
          }
        }

        if (typeof targetMethod === 'function' && !hookMode) {
          return targetMethod
        }

        if (typeof targetMethod === 'function') {
          return (...args: ConsoleMethodArgument[]) => {
            const output = Reflect.apply(targetMethod, target, args)
            if (hookMode) {
              Reflect.apply(targetMethod, target, [output])
            }
            return output
          }
        }

        return Reflect.get(target, prop)
      },
    })
  }

  /**
   * Handles the actual writing of messages to the target context.
   * Supports both string-based and function-based output targets.
   *
   * Routes messages appropriately:
   * - stdout: For standard logs (log, info, debug)
   * - stderr: For errors and warnings
   *
   * @param method - The console method being used
   * @param message - The formatted message to output
   */
  private writeToTarget(method: keyof AdvancedConsole, message: string): void {
    const target =
      method === 'error' || method === 'warn' ? this.context.stderr : this.context.stdout
    if (typeof target === 'function') {
      target(message)
    } else if (typeof target === 'string') {
      this.context[method === 'error' || method === 'warn' ? 'stderr' : 'stdout'] += `${message}\n`
    }
  }

  /**
   * Allows dynamic updating of the patch configuration after creation.
   * Useful for:
   * - Changing output targets at runtime
   * - Switching between different console instances
   * - Enabling/disabling hook mode
   *
   * @param context - New output target context
   * @param consoleInstance - New console instance to patch
   * @param hookMode - New hook mode setting
   */
  public patch(
    context?: WritableContext,
    consoleInstance?: BasicConsole | AdvancedConsole,
    hookMode = false
  ): ConsoleMonkeyPatch {
    if (context) {
      this.context = context
    }
    if (consoleInstance) {
      this.console = this.createProxy(consoleInstance, hookMode)
    }
    return this
  }

  /**
   * Utility method to validate if an object is a valid console instance.
   * Checks for required minimum functionality (log and error methods).
   *
   * Used internally to validate console instances before patching.
   *
   * @param obj - Object to check
   * @returns true if object is a valid console instance
   */
  public static isConsoleInstance(obj: unknown): obj is BasicConsole {
    return obj !== null && typeof obj === 'object' && 'log' in obj && 'error' in obj
  }
}

export default ConsoleMonkeyPatch
