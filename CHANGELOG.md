# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.4.0](https://github.com/wingedearth/united-api/compare/v1.3.0...v1.4.0) (2025-08-14)


### ⚠ BREAKING CHANGES

* Rate limiting is now enforced on all GraphQL requests

### Features

* add rate limiting and security enhancements ([63dc1d6](https://github.com/wingedearth/united-api/commit/63dc1d68f6948c66b8e3da0dc6e293ca36270376))

## [1.3.0](https://github.com/wingedearth/united-api/compare/v1.2.0...v1.3.0) (2025-08-10)


### Features

* add Express server with Apollo Studio landing page ([722098b](https://github.com/wingedearth/united-api/commit/722098b5058327d2180777647038923655a21dda))
* add Heroku deployment configuration ([9940c45](https://github.com/wingedearth/united-api/commit/9940c452a6a1f69f2524ea59eb17bed42403e823))
* explicitly enable apollo studio sandbox in production ([eff60f3](https://github.com/wingedearth/united-api/commit/eff60f3429e17e833c3732d4287ee84b5dbd7a84))


### Bug Fixes

* enable Apollo Studio sandbox and disable CSRF prevention ([cfa2f81](https://github.com/wingedearth/united-api/commit/cfa2f8150bd8927574d8eb8f8043be88b1b78d5f))
* revert to standalone server setup and remove unused express dependencies ([f7eda64](https://github.com/wingedearth/united-api/commit/f7eda649dac07dc06be876838f122f42de21f1d3))


### Documentation

* update documentation for production deployment ([2ac1634](https://github.com/wingedearth/united-api/commit/2ac163424e34ae6cd19ba0b9b626a9bf3aaba16f))

## [1.2.0](https://github.com/wingedearth/united-api/compare/v1.1.1...v1.2.0) (2025-08-06)


### Features

* integrate apolloserver with users-service ([8cf11aa](https://github.com/wingedearth/united-api/commit/8cf11aa0d64727fe631cb9db46029edc850662d7))


### Chores

* remove Lowercase requirement on commit subjects ([7af057d](https://github.com/wingedearth/united-api/commit/7af057d6f3956d7ff3db507bee020421d03cb873))

### [1.1.1](https://github.com/wingedearth/united-api/compare/v1.1.0...v1.1.1) (2025-08-06)


### Bug Fixes

* add node version of 22.16.0 ([c0e2383](https://github.com/wingedearth/united-api/commit/c0e23839aeda8149485d94980f4fa91792233360))

## 1.1.0 (2025-08-06)


### Features

* add testing with vitest; add conventional commits with commitlint ([4bc8e92](https://github.com/wingedearth/united-api/commit/4bc8e924839783d9ffa47a8aa65ce27044adfb08))
* first commit ([e7d0e48](https://github.com/wingedearth/united-api/commit/e7d0e484a665436b958d38e87cf2effc6cbb20cf))


### Chores

* add changelog with standard-version ([f48c8a1](https://github.com/wingedearth/united-api/commit/f48c8a1a73720a2b5a9371a746007ee8cad51810))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [Unreleased]

### Features

- Add testing with vitest; add conventional commits with commitlint
- First commit with basic GraphQL ApolloServer setup

### Documentation

- Update README with comprehensive project information
