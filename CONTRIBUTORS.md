# Contributing to Console Monkey Patch

Thank you for your interest in contributing to **TerminalEmulator**! Your contributions help make this project better for everyone.

## How to Contribute

### 1. Fork the Repository

Click the **Fork** button at the top-right corner of the repository page to create your own fork of the project.

### 2. Clone Your Fork

Clone the forked repository to your local machine:

```bash
git clone https://github.com/zackiles/console-monkey-patch.git
cd console-monkey-patch
```

### 3. Install Dependencies

Ensure you have [Node.js](https://nodejs.org/) installed. Then, install the project dependencies:

```bash
pnpm install
```

### 4. Create a New Branch

Create a new branch for your feature or bug fix:

```bash
git checkout -b feature/your-feature-name
```

### 5. Make Your Changes

Implement your feature or fix the bug. Ensure that your code adheres to the project's coding standards.

### 6. Run Tests

Ensure all tests pass before submitting your changes:

```bash
pnpm run test
```

### 7. Lint and Format Your Code

Maintain code quality by linting and formatting your changes:

```bash
pnpm run lint
pnpm run format
```

### 8. Commit Your Changes

Commit your changes with a clear and descriptive message:

```bash
git commit -m "Add feature: your feature description"
```

### 9. Push to Your Fork

Push your changes to your forked repository:

```bash
git push origin feature/your-feature-name
```

### 10. Create a Pull Request

Navigate to the original repository and create a pull request from your forked branch. Provide a clear description of your changes and the motivation behind them.

## Testing

**TerminalEmulator** uses [Vitest](https://vitest.dev/) for testing. To run the test suites:

```bash
pnpm run test
```

## Building the Library

The library is bundled using [tsup](https://tsup.egoist.dev/). To build the library for distribution:

```bash
pnpm run build
```

## Linting and Formatting

Code quality is maintained using [Biome](https://biomejs.dev/), which handles both linting and formatting.

### Linting

To check for linting errors:

```bash
pnpm run lint
```

### Formatting

To automatically format your code:

```bash
pnpm run format
```

Ensure that your code adheres to the project's linting rules before committing changes.

## Additional Guidelines

- **Commit Messages:** Use clear and descriptive commit messages to explain the changes you've made.
- **Branch Naming:** Use descriptive branch names that reflect the feature or fix (e.g., `feature/add-input-history`).
- **Documentation:** If your contribution includes changes to the API or adds new features, update the `README.md` accordingly.
- **Issue Tracking:** Before working on a new feature or bug fix, check the [Issues](https://github.com/zackilese/console-monkey-patch/issues) section to see if it's already reported or being addressed.
