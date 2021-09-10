# Getting Started

test
## Installation

Installation instructions can be found in the [readme](../../index.html), located at the repository root.

## Usage

This library's primary purpose is to generate randomized mock data for JavaScript/TypeScript unit testing.

Both NWPS projects I have been on have used Jasmine for JavaScript unit testing on the front end, and xUnit + AutoFixture for C# unit testing on the back end. This library also aims to be familiar to both front end and back end developers. For those reasons the API is modeled after RxJS and AutoFixture.

An example may better explain what this library is for: say you have a generator for a large interface called `Person`. You're writing multiple unit tests for a function that formats the person's name. So the only fields on `Person` that you care about fixing to some hard coded values for these tests are `firstName`, `middleInitial`, and `lastName`.
Everything else on that contract you don't care about and can be filled randomly.

For one of the tests, you want to verify the results when `firstName` is `undefined`, `null`, or empty string.

```typescript
import { personGenerator } from './person.generator';
import { withS } from '@nwps/data-generators/transformer';

it('should handle invalid first name values', () => {
    const persons = personGenerator
        .pipe(
            withS('firstName', [undefined, null, '']) // 1
        )
        .createAll(); // 2

    for (const person of persons) {
        // expect(myNameFormatter(person)).toBe(...)
    }
});
```

1. [[`withS`]] takes a property on the generator and overwrites it with a new one (can be anything that is iterable).
    - **Note** the name [[`withS`]] has the `S` on the end due to it operating on a struct (introduced below), there is also [[`withT`]] for tuples. Also, `with` is a JavaScript reserved word so some creativity was necessary.
2. Here, [[`createAll`]] will return an array of 3 persons, the first having `firstName: undefined`, second `firstName: null` and third `firstName: ''`.
   It only creates 3 because the replacement generator provided for firstName in [[`withS`]] can only output at most 3 values.

### Primitives

`@nwps/data-generators` includes some generators out of the box under the [[library]] module for primitive data types such as strings, booleans, and numbers.

To generate a value from these, the methods [[`create`]], [[`createMany`]], and [[`createAll`]] are available.

[[`create`]] generates a single value, [[`createMany`]] allows you to specify how many values to generate and returns the values in an array, while [[`createAll`]] creates values from the generator until the generator is exhausted of values to generate.

```typescript
import { int, bool, date } from '@nwps/data-generators/library';
import { take } from '@nwps/data-generators/transformer';

int(1, 10).create(); // random integer between 1 and 10
bool(70).createMany(3); // Array of 3 random booleans each with a 70% probability of being true
date({ minutes: int(10, 40) })
    .pipe(take(3))
    .createAll(); // Array of 3 random dates with minutes randomized between 10 and 40
```

### Combinators

While the library provides the primitive building blocks, the [[`index`]] and [[`transformer`]] modules provide various [combinators](https://en.wikipedia.org/wiki/Combinatory_logic#In_computing) for creating generators of more complex structure.

Besides the primitive types in JavaScript, there are also Objects and Arrays (which are Objects as well). [[`struct`]] creates a new generator that generates an object, and [[`tuple`]] creates a new generator that generates an array. These functions are available in the index module (`@nwps/data-generators`).

A common use case of [[`struct`]] is creating a shareable generator for an interface/contract. For example, contact info,

```typescript
import { struct } from '@nwps/data-generators';
import { string, date } from '@nwps/data-generators/library';

export interface ContactInfo {
    firstName: string;
    lastName: string;
    email: string;
    updatedAt: Date;
}

export const contactInfoGenerator = struct<ContactInfo>({
    firstName: string(6), // random string of length 6
    lastName: string(), // random string of length 10
    email: string(20),
    updatedAt: date()
});
```

Then using the generator is the same as the primitives above: [[`create`]], [[`createMany`]], or [[`createAll`]].

> **Warning** when using [[`createAll`]] on an infinite generator (a generator that can always create a new value) will cause a stack overflow. More on this later on.

In addition to [[`struct`]], there is [[`tuple`]]. Tuple will generally be used less often than [[`struct`]]. A use case for [[`tuple`]] would be implementing a more complex data generator
using a similar technique commonly used for RxJS Observables. If you need multiple generated values, and then want to map to a single value, in RxJS you would use `forkJoin` or `combineLatest`. Here tuple can be used for a similar purpose.

```typescript
import { tuple } from '@nwps/data-generators';
import { int } from '@nwps/data-generators/library';
import { map } from '@nwps/data-generators/transformer';

tuple(int(1, 50), ['Bob', 'Jim', 'Larry'])
    .pipe(map(([num, name]) => `${name}, your lucky number is ${num}!`))
    .createAll();
// outputs, for example,
// ['Bob, your lucky number is 48!', 'Jim, your lucky number is 32!', 'Larry, your lucky number is 7!']
```

### Transformers

Transformers are also combinators, but are able to be used within [[`pipe`]]. The first code example shown under the [Usage](#usage) section demonstrated one such usage of [[`pipe`]]: using [[`withS`]] inside [[`pipe`]] to change how a property of an object generator is generated.

Everything under the [[`transformer`]] module can be used in the same way. Some will be used often, others will be used in more niche cases.

Some of the common ones include [[`withS`]], [[`withoutS`]], [[`map`]], [[`take`]], and [[`optional`]].

Some less common ones include the `ap` and `bind` transformers ([[`apS`]], [[`apT`]], [[`bindToS`]], [[`bindToT`]], [[`bindS`]], and [[`bindT`]]).

The `ap` and `bind` transformers all add members to a [[`struct`]] or [[`tuple`]] with some minor differences.

-   `ap` appends a member to the end of an existing struct or tuple.

    ```ts
    import { struct, tuple, constant } from '@nwps/data-generators';
    import { apS, apT } from '@nwps/data-generators/transformer';
    import { date } from '@nwps/data-generators/library';

    struct({
        name: constant('Bob')
    }).pipe(apS('birthDate', date()));
    // Outputs an object with type { name: 'Bob', birthDate: Date }

    tuple(constant('Bob')).pipe(apT(date()));
    // Outputs an array with type ['Bob', Date]
    ```

-   `bindTo` transforms a non struct or tuple into a struct or tuple.

    ```ts
    import { bindToS, bindToT } from '@nwps/data-generators/transformer';
    import { int } from '@nwps/data-generators/library';

    int().pipe(bindToS('luckyNumber'));
    // Outputs an object with type { luckyNumber: number }

    int().pipe(bindToT());
    // Outputs an array with type [number]
    ```

-   `bind` appends a member to the end of an existing struct or tuple just as `ap` does, but allows you to use the existing values.

    ```ts
    import { struct, tuple } from '@nwps/data-generators';
    import { bindS, bindT } from '@nwps/data-generators/transformer';
    import { int, string } from '@nwps/data-generators/library';

    struct({
        strLen: int(5, 10)
    }).pipe(bindS('str', ({ strLen }) => string(strLen)));
    // Outputs an object with type { strLen: number; str: string } where str.length = strLen

    tuple(int(5, 10)).pipe(bindT(([strLen]) => string(strLen)));
    // Outputs an array with type [number, string] where arr[1].length = arr[0]
    ```
