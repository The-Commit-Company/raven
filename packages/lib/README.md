### @raven/lib

This package contains shared utilities and hooks for the Raven app.

> **IMPORTANT:** Importing these should always use the `@raven/lib` alias and not `../../packages/lib`.

#### Hooks

Add any hooks that do not have a dependency on the platform (web/native).
Hooks to fetch data should also be added here.

```ts
import { useDebounce } from '@raven/lib/hooks/useDebounce';
```

#### Utils

Add any utils that do not have a dependency on the platform (web/native). Utils using boot cannot be added here.

```ts
import { isEmailValid } from '@raven/lib/utils/validations';
```
