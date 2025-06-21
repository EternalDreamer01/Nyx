
## Setup

```sh
git submodule add https://github.com/bats-core/bats-core.git test/bats
git submodule add https://github.com/bats-core/bats-support.git test/test_helper/bats-support
git submodule add https://github.com/bats-core/bats-assert.git test/test_helper/bats-assert
```

### Issues

`fatal: 'test/bats' already exists in the index`:
```sh
# From root folder
rm -rf test/bats test/test_helper
git rm -rf test/bats test/test_helper
```
