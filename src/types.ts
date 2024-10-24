/**
 * Represents a value that can be a string, a number, or an object that can be JSON stringified.
 * The object may also optionally implement a toJSON() method for custom serialization.
 */
export type Stringifiable = string | number | { [key: string]: any; toJSON?(): any }

/**
 * Represents an argument that can be a single Stringifiable value or an array of Stringifiable values.
 */
export type ConsoleMethodArgument = Stringifiable | Stringifiable[]

/**
 * Represents the context for console logging, allowing for custom stdout and stderr handlers.
 * This interface is used when a user wants to override console methods, redirecting messages to memory.
 */
export interface WritableContext {
  stdout: string | ((msg: string) => void)
  stderr: string | ((msg: string) => void)
  [key: string]: string | ((msg: string) => void) // Allow additional handlers if needed
}

/**
 * Defines the structure of a basic logging class instance.
 * The log and error methods must exist and may return either a string or void.
 * This is the bare minimum interface needed for monkey patching or using with this library.
 */
export interface BasicConsole {
  log: (...args: ConsoleMethodArgument[]) => string | void
  error: (...args: ConsoleMethodArgument[]) => string | void
}

/**
 * Extends the BasicConsole interface to define an advanced logging class instance.
 * All additional logging methods are optional and may return either a string or void.
 * This is the full supported interface for this library, allowing monkey patching.
 */
export interface AdvancedConsole extends BasicConsole {
  info?: (...args: ConsoleMethodArgument[]) => string | void
  debug?: (...args: ConsoleMethodArgument[]) => string | void
  warn?: (...args: ConsoleMethodArgument[]) => string | void
  table?: (
    data?: ReadonlyArray<object | [string, ...string[]]>,
    ...optionalParams: ConsoleMethodArgument[]
  ) => string | void
  assert?: (condition: boolean, ...data: ConsoleMethodArgument[]) => string | void // Updated
  time?: (label?: ConsoleMethodArgument) => string | void
  timeEnd?: (label?: ConsoleMethodArgument) => string | void
  clear?: () => string | void
  group?: (...args: ConsoleMethodArgument[]) => string | void
  groupEnd?: () => string | void
  trace?: (...args: ConsoleMethodArgument[]) => string | void
}
