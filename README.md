# graphql-tools-type-flat-object

[![Build Status](https://travis-ci.org/up9cloud/graphql-tools-type-flat-object.svg?branch=master)](https://travis-ci.org/up9cloud/graphql-tools-type-flat-object)
[![Coverage Status](https://coveralls.io/repos/github/up9cloud/graphql-tools-type-flat-object/badge.svg?branch=master)](https://coveralls.io/github/up9cloud/graphql-tools-type-flat-object?branch=master)

FlatObject scalar type for [graphql-tools](https://github.com/apollographql/graphql-tools)

## Usage

```js
import { makeExecutableSchema } from 'graphql-tools'
import FlatObject from 'graphql-tools-type-flat-object'

// by default, the scalar type is nullable and won't return errors
// so suggest using FlatObject! (non-null) type.
let typeDefs = [`
scalar FlatObject
type Query {
  value(arg: FlatObject!): FlatObject
}`
]
let resolvers = {
  FlatObject,
  Query: {
    value: (root, { arg }) => arg
  }
}
let schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema
```

## Minimum amount of module files

```console
$ tree ./node_modules/graphql-tools-type-flat-object
./node_modules/graphql-tools-type-flat-object
├── README.md
├── dist
│   └── index.js
└── package.json

1 directory, 3 files
```
