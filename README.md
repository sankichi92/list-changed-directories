# list-changed-directories

A custom GitHub action that outputs a list of changed directories including a target file.

This action can be used only on `push` and `pull_request` events.

## Inputs

### `target-file`

**Required**. A filename that must be included in the output directories.

## Outputs

### `changed-directories`

The list of changed directories as a JSON string.

## Example usage

This workflow runs `bundle exec rake` in every directory that has changed and includes `Gemfile`:

```yaml
on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]

jobs:
  list-target-dirs:
    runs-on: ubuntu-latest

    outputs:
      dirs: ${{ steps.list-changed-directories.outputs.changed-directories }}

    steps:
      - uses: actions/checkout@v4

      - uses: sankichi92/list-changed-directories@v1
        id: list-changed-directories
        with:
          target-file: Gemfile

  test:
    needs: list-target-dirs
    if: needs.list-target-dirs.outputs.dirs != '[]'

    runs-on: ubuntu-latest

    strategy:
      matrix:
        dir: ${{ fromJSON(needs.list-target-dirs.outputs.dirs) }}

    defaults:
      run:
        working-directory: ${{ matrix.dir }}

    steps:
      - uses: actions/checkout@v4

      - uses: ruby/setup-ruby@v1
        with:
          bundler-cache: true

      - run: bundle exec rake
```
