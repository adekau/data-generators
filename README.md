# Data Generators

This library is intended to provide an abstraction over [ES6 Generator Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) for use in Data Generation.

`@nwps/data-generators` is aimed at random test data generation, but can be used for any data generation. More generally, it provides infinite lazy lists using [lazy evaluation](https://en.wikipedia.org/wiki/Lazy_evaluation).

It's API is modeled after both RxJS and the fluent API of AutoFixture, so that it will look familiar to both C# and JavaScript developers.

## Installing

```bash
npm install --save-dev @nwps/data-generators
```

_Note_: Needs the NWPS NPM package source from Artifactory set up in `.npmrc`.

## Documentation

Currently documentation is not hosted anywhere, but the compiled docs can be found under the repo's `docs` folder. To build the most recent docs yourself,

```bash
npm run build:docs
```

## Building

To build,

```bash
npm run build
```

An installable `.tgz` can be generated after the build is complete by running

```bash
npm pack
```

To compile without running build scripts,

```bash
npm run build:all
```

To compile a single distribution (e.g. esm5, commonjs),

```bash
./node_modules/.bin/tsc --project ./src/tsconfig.{distribution}.json
```

## Testing

```bash
npm run test
```
