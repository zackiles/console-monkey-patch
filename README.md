# Console Monkey Patch

**[Overview]**

A versatile logging utility for Node.js that lets you intercept, extend, or replace console methods for custom logging workflows.

1. **Bring Your Own Logger**: Seamlessly monkey-patch popular logging libraries (e.g., native `console`, `winston`, `pino`) to redirect their outputs to in-memory logs (`this.context.stdout`/`stderr`). Perfect for environments like sandboxes where you need to capture and control all logging.

2. **Hook Mode**: Enable hook mode to chain pre-processing functions before passing messages to your existing logging library. This allows you to extend functionality without replacing your original methods.

3. **In-Memory Logger**: Don't have a logging library? No problem. Get a console-like interface with in-memory logging, leveraging `this.context.stdout` and `stderr` to store logs without printing them.

Ideal for sandboxed environments, custom log pipelines, or capturing logs without terminal output.

---

**[Calling Conventions]**

| Name                                    | Function    | Calling Signature                           | Can't Exist                             | hookMode | Local Log | Patch Type               |
|-----------------------------------------|-------------|---------------------------------------------|-----------------------------------------|----------|-----------|--------------------------|
| Instantiation with context              | constructor | (context)                                   | No consoleInstanceClass                | false    | Yes       | Full Replace             |
| Instantiation with console              | constructor | (consoleInstanceClass, hookMode?)           | No context                             | optional | No        | Full Replace / Chained Hook (based on hookMode) |
| Instantiation with context and console  | constructor | (context, consoleInstanceClass, hookMode?)  | N/A                                    | optional | Yes       | Full Replace / Chained Hook (based on hookMode) |
| Patch with context                      | patch       | (context, consoleInstanceClass?, hookMode?) | No patching without context            | optional | Yes       | Full Replace             |
| Patch with console                      | patch       | (consoleInstanceClass, hookMode?)           | No context                             | optional | No        | Full Replace / Chained Hook (based on hookMode) |

---

**[Rules to explore]**

| Rule                                                                                                           | Related To                                           |
|----------------------------------------------------------------------------------------------------------------|------------------------------------------------------|
| Local logging to `this.context.stderr` and `this.context.stdout` require a context to be passed so they can log to the class locally | Instantiation with context, Instantiation with context and console, Patch with context |
| If local logging is not needed (i.e., when the caller provides an external logging mechanism via a console instance or context functions), `this.context.stdout` and `this.context.stderr` should be explicitly set to `null` to avoid unnecessary duplication of logs in memory | Instantiation with console, Instantiation with context and console, Patch with console |
| If both a context and an external logging library are provided but local logging is not required, `this.context.stdout` and `stderr` should be explicitly set to `null` to avoid log duplication | Instantiation with context and console, Patch with console |
| When no external logging library is provided, the library should default to in-memory logging via `this.context.stdout` and `stderr`, ensuring both are initialized as non-null strings | Instantiation with context, Patch with context |
| When hook mode is enabled, local logging (`this.context.stdout` and `stderr`) should be completely bypassed, with all logs processed only by the chained external logging method | Instantiation with console, Instantiation with context and console, Patch with console |
| Ensure that in paths where external logging is used, no interaction occurs with `this.context.stdout` or `stderr` unless both context and external logging are required | Instantiation with console, Patch with console |
