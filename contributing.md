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

- Files should be in lowerCamelCase.
- All exported members (classes, enums, etc) should be in UpperCamelCase.
- Pulic functions should be in UpperCamelCase.
- Private functions should be in lowerCamelCase.

## Tests

Tests should be written in the form:

```JS
describe('Some Thing', () => {
    it('Does Something', () => {
        ...
    })
})
```
