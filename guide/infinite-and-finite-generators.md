# Infinite and Finite Generators

Data Generators can be broken down into two distinct types: **infinite** and **finite**.

## Finite

A **finite** Data Generator can only produce a set amount of values. If you try to create more values than it can produce, it will produce only the amount it can and then terminate.

```
import { createGenerator } from '@nwps/data-generators';

const gen = createGenerator(function* () {
    yield 'Hello';
    yield 'world';
});

const results = gen.createMany(5); // ['Hello', 'world']
```

## Infinite

An **infinite** Data Generator will never run out of values it can produce, and producing all the values
