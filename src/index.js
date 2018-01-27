import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'
import { GraphQLError } from 'graphql/error'

let FlatObject = new GraphQLScalarType({
  name: 'FlatObject',
  description: `FlatObject scalar type for [graphql-tools](https://github.com/apollographql/graphql-tools)
The object should not be nested (value can't be array or object).`,
  serialize (value) {
    if (typeof value !== 'object') {
      return null
    }
    if (value === null) {
      return null
    }
    if (Array.isArray(value)) {
      return null
    }
    const holder = Object.create(null)
    for (let key of Object.keys(value)) {
      switch (typeof value[key]) {
        case 'boolean':
        case 'string':
          holder[key] = value[key]
          break
        case 'number':
          if (isFinite(value[key])) {
            holder[key] = value[key]
          } else {
            holder[key] = null
          }
          break
        case 'object':
          if (value[key] === null) {
            holder[key] = value[key]
          }
          break
      }
    }
    return holder
  },
  parseValue (value) {
    if (typeof value !== 'object') {
      throw new GraphQLError('', [])
    }
    if (value === null) { // graphql null value won't pass to parseValue, just in case
      throw new GraphQLError('', [])
    }
    if (Array.isArray(value)) {
      throw new GraphQLError('', [])
    }
    const holder = Object.create(null)
    for (let key of Object.keys(value)) {
      switch (typeof value[key]) {
        case 'boolean':
        case 'string':
          holder[key] = value[key]
          break
        case 'number':
          if (isFinite(value[key])) {
            holder[key] = value[key]
          } else {
            throw new GraphQLError('', []) // NaN, Infinity is not valid JSON value, just in case
          }
          break
        case 'object':
          if (value[key] === null) {
            holder[key] = value[key]
          } else {
            throw new GraphQLError('', [])
          }
          break
        default:
          throw new GraphQLError('', []) // JSON won't have other value type, just in case
      }
    }
    return holder
  },
  parseLiteral (ast) {
    if (ast.kind !== Kind.OBJECT) {
      throw new GraphQLError(`Invalid FlatObject literal,\n${ast.kind} should be ${Kind.OBJECT}.`, [ast])
    }
    const value = Object.create(null)
    for (let field of ast.fields) {
      switch (field.value.kind) {
        case Kind.NULL:
          value[field.name.value] = null
          break
        case Kind.STRING:
        case Kind.BOOLEAN:
          value[field.name.value] = field.value.value
          break
        case Kind.INT:
          value[field.name.value] = parseInt(field.value.value)
          break
        case Kind.FLOAT:
          value[field.name.value] = parseFloat(field.value.value)
          break
        default:
          throw new GraphQLError(`Invalid FlatObject literal.\n${field.value.kind}: ${field.name.value} is not allowed.`, [ast])
      }
    }
    return value
  }
})
export default FlatObject
