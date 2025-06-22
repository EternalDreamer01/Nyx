
## Setup


```sh
git clone --recurse-submodules -j4 https://github.com/EternalDreamer01/Nyx.git

# OR
# From root folder
rm -rf test/bats test/test_helper
git rm -rf test/bats test/test_helper
git submodule add https://github.com/bats-core/bats-core.git test/bats
git submodule add https://github.com/bats-core/bats-support.git test/test_helper/bats-support
git submodule add https://github.com/bats-core/bats-assert.git test/test_helper/bats-assert
```
