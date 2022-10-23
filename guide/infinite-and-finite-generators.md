Data Generators can be broken down into two distinct types: **infinite** and **finite**.

## Finite

A **finite** Data Generator can only produce a set amount of values. If you try to create more values than it can produce, it will produce only the amount it can and then terminate.

```ts
import { createGenerator } from '@nwps/data-generators';

const gen = createGenerator(function* () {
    yield 'Hello';
    yield 'world';
});

const results = gen.createMany(5); // (*) ['Hello', 'world']
```

-   Since the generator only yields two values, calling `createMany(5)` terminates early.

Transformers such as [[`take`]] and [[`one`]] also result in a finite Data Generator. The difference between the aforementioned and
[[`createMany`]] is that [[`take`]] and [[`one`]] result in a new finite Data Generator that can never generate more than it's capable of
and [[`createMany`]] is just generating some values from a potentially infinite data generator.

```ts
import { int } from '@nwps/data-generators/library';
import { take } from '@nwps/data-generators/transformer';

const gen1 = int();
const gen2 = int().pipe(take(5));

const results1 = gen1.createMany(5);
const results2 = gen2.createMany(5);
```

In the above, `results1` and `results2` will both be length 5. The difference can be seen in the following,

```ts
const results1 = gen1.createMany(10);
const results2 = gen2.createMany(10);
```

Since `gen1` is infinite (as all Data Generators from [[`library`]] are), it can produce 10 integers. However, `gen2` is a finite generator
due to the [[`take`]] transformer and can only generate 5 integers at maximum. Here `results1` is length 10, and `results2` is length 5.

## Infinite

An **infinite** Data Generator will never run out of values it can produce. All Data Generators in [[library | `@nwps/data-generators/library`]] are infinite.

An infinite Data Generator is just a `while (true)` infinite loop that yields the next value.

```ts
import { createGenerator } from '@nwps/data-generators';

const number = createGenerator(function* () {
    while (true) {
        yield Math.random();
    }
});
```
