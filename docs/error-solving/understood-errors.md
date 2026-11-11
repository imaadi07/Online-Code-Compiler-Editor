# Understood Errors & Failure Modes

## Error Patterns

### [Vague UI Information Architecture]
- **Cause**: Overloading developer UI with raw container metrics, industrial jargon, and low-contrast colors causing high cognitive load.
- **Solution**: Apply UX principles (progressive disclosure, clear visual hierarchy, accessible contrast ratios, Miller's Law: 7±2 chunks, Jakob's Law: familiar editor workflows).
- **Prevention**: Establish design tokens, clear semantic component boundaries, and accessible contrast checks.

### [ESLint no-unused-vars with Lowercase Component Namespaces]
- **Cause**: Lowercase namespaces like `motion.div` from `motion/react` trigger `no-unused-vars` if `varsIgnorePattern` only matches uppercase `/^[A-Z_]/`.
- **Solution**: Update `varsIgnorePattern` to `'^[A-Z_]|motion'` in `eslint.config.js`.
- **Prevention**: Anticipate third-party libraries using dot notation on lowercase namespace objects in JSX.

### [React 19 State Updates in Fake Timers Tests]
- **Cause**: In React 19 / Vitest, `fireEvent` followed by `setTimeout` state updates warning about unhandled `act(...)`.
- **Solution**: Wrap both `fireEvent` and `vi.runAllTimers()` or timer advancement inside `act(() => { ... })`.
- **Prevention**: Always use `act` when advancing timers that trigger state updates in tests.

## Known Failure Modes

### [Cognitive Overload in Code Workspaces]
- **What looks correct**: Exposing every technical detail (memory limits, PIDs, raw shell command strings, exit codes, complex nested icons) upfront.
- **Why it's wrong**: Distracts and confuses users, especially learners or developers who just want to quickly write and run code.
- **Correct approach**: Make the code and run button prominent; keep secondary settings accessible in menus or clean tabs without cluttering primary view.

### [Query Specificity in React Testing Library]
- **What looks correct**: Using generic queries like `screen.getByRole('button', { name: /Dashboard/i })` when both a brand link and a navigation pill share the name.
- **Why it's wrong**: Throws `Found multiple elements with the text/role`.
- **Correct approach**: Use exact regex `name: /^Dashboard$/i`, container IDs (`#nav-btn-dashboard`), or specific accessibility labels.
