# list-changed-directories

This custom GitHub Action outputs a list of directories that have changed and include a specified target file.

For example, in a monorepo managing multiple applications, this custom action can be used to run the same job only on directories that have changed.
While a simple GitHub Actions' matrix can run the same job across multiple directories, it cannot limit execution exclusively to directories that have changed.
Using `on.<push|pull_request>.paths` allows targeting only changed directories, but this requires to increase the number of workflows in proportional to the number of target directories.
This custom action addresses these challenges.

This action works only with the `push` and `pull_request` events due to the need for obtaining a diff.

## Inputs

### `target-file`

**Required**. A filename that must be included in the output directories.

### `common-dependency-paths`

Paths to files that all directories including the `target-file` depend on.
If any of these files are changed, all directories including the `target-file` are considered changed.
Separate paths with a newline.

## Outputs

### `changed-directories`

The list of changed directories as a JSON string.

## Example usage

This workflow runs `bundle exec rake` in every directory that has changed and includes `Gemfile.lock`:

```yaml
on:
  pull_request:
    branches: ["main"]

jobs:
  list-changed-directories:
    runs-on: ubuntu-latest

    outputs:
      changed-directories: ${{ steps.list-changed-directories.outputs.changed-directories }}

    steps:
      - uses: actions/checkout@v4

      - uses: sankichi92/list-changed-directories@v1
        id: list-changed-directories
        with:
          target-file: Gemfile.lock
          common-dependency-paths: |-
            .github/workflows/ruby.yml

  test:
    needs: list-changed-directories
    if: needs.list-changed-directories.outputs.changed-directories != '[]'

    runs-on: ubuntu-latest

    strategy:
      matrix:
        working-directory: ${{ fromJSON(needs.list-changed-directories.outputs.changed-directories) }}

    steps:
      - uses: actions/checkout@v4

      - uses: ruby/setup-ruby@v1
        with:
          working-directory: ${{ matrix.working-directory }}
          bundler-cache: true

      - run: bundle exec rake
        working-directory: ${{ matrix.working-directory }}
```
