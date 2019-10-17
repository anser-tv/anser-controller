# Contribution Guidelines

## Tests

Make sure your contributions maintain the coverage requirement by running `yarn test`, it shouldn't throw any errors.

## Linting

Ensure your code passes linting with `yarn lint`. We recoomend using VS Code and setting the following option:

```JSON
"editor.codeActionsOnSave": {
    "source.fixAll.tslint": true
}
```

## Naming

- Files should be in snake-case.
- All exported members (classes, enums, etc) should be in UpperCamelCase.
- Pulic functions should be in UpperCamelCase.
- Private functions should be in lowerCamelCase.

## Commit Messages
- Fixes should be prefixed with `fix:`
- Features should be prefixed with `feat:`
- Other changes (e.g. documentation, bumping package version) should be prefixed with `chore:`

## Branches
- Branches should follow a similar naming convention to Commit Messages e.g. `feat/some-feature`, `chore/bump-package`
- Major changes must be made on their own branch
- Minor changes (most chores) can be done on master by those with push permissions.

## Tests

Tests should be written in the form:

```JS
describe('Some Thing', () => {
    it('Does Something', () => {
        ...
    })
})
```
