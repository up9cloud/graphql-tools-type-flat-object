import { expect } from 'chai'
import { graphql } from 'graphql'
import { makeExecutableSchema } from 'graphql-tools'

import FlatObject from '../src'

const whiteList = [
  {},
  {
    a: 123,
    b: 45.6,
    d: '',
    c: 'abc',
    e: true,
    f: false,
    g: null
  }
]
const blackList = [
  123,
  12.3,
  '',
  'abc',
  true,
  false,
  null,
  undefined,
  NaN,
  Infinity,
  []
]
const cleanupList = [
  {
    a: []
  },
  {
    a: {}
  }
]

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

describe('FlatObject', () => {
  describe('serialize', () => {
    it('valid value should pass', () => {
      for (let arg of whiteList) {
        expect(FlatObject.serialize(arg)).to.deep.equal(arg)
      }
    })
    it('invalid value should return null', () => {
      for (let arg of blackList) {
        expect(FlatObject.serialize(arg)).to.deep.equal(null)
      }
    })
    it('non-flat object should return flat-object', () => {
      for (let arg of cleanupList) {
        expect(FlatObject.serialize(arg)).to.deep.equal({})
      }
      expect(FlatObject.serialize({
        a: 123,
        b: {}
      })).to.deep.equal({
        a: 123
      })
    })
    it('Nan, Infinity values in object should return null', () => {
      expect(FlatObject.serialize({
        a: NaN,
        b: Infinity
      })).to.deep.equal({
        a: null,
        b: null
      })
    })
  })

  describe('parseValue', () => {
    it('valid value should pass', async () => {
      for (let arg of whiteList) {
        let { data } = await graphql(
          schema,
          `query ($arg: FlatObject!) {
            value(arg: $arg)
          }`,
          null,
          null,
          { arg }
        )
        expect(data.value).to.deep.equal(arg)
      }
    })
    it('invalid value should return errors', async () => {
      for (let arg of blackList) {
        let data = await graphql(
          schema,
          `query ($arg: FlatObject!) {
            value(arg: $arg)
          }`,
          null,
          null,
          { arg }
        )
        expect(data.data).to.deep.equal(undefined)
        // expect(data.data.value).to.deep.equal(undefined)
        expect(data.errors).to.deep.an('array')
      }
    })
    it('non-flat object should return errors', async () => {
      for (let arg of cleanupList) {
        let data = await graphql(
          schema,
          `query ($arg: FlatObject!) {
            value(arg: $arg)
          }`,
          null,
          null,
          { arg }
        )
        expect(data.data).to.deep.equal(undefined)
        // expect(data.data.value).to.deep.equal(undefined)
        expect(data.errors).to.deep.an('array')
      }
    })
  })

  let flatObjectToInlineArg = (obj) => {
    let str = []
    for (let k of Object.keys(obj)) {
      str.push(`${k}: ${JSON.stringify(obj[k])}`)
    }
    str = `{ ${str.join(', ')} }`
    return str
  }
  describe('parseLiteral', () => {
    it('valid value should pass', async () => {
      for (let arg of whiteList) {
        let res = await graphql(
          schema,
          `query { value(arg: ${flatObjectToInlineArg(arg)}) }`
        )
        expect(res.data.value).to.deep.equal(arg)
      }
    })
    it('invalid value should return errors', async () => {
      for (let arg of blackList) {
        let data = await graphql(
          schema,
          `query { value(arg: ${JSON.stringify(arg)}) }`
        )
        expect(data.data).to.deep.equal(undefined)
        // expect(data.data.value).to.deep.equal(undefined)
        expect(data.errors).to.deep.an('array')
      }
    })
    it('invalid value should return errors', async () => {
      for (let arg of cleanupList) {
        let data = await graphql(
          schema,
          `query { value(arg: ${flatObjectToInlineArg(arg)}) }`
        )
        expect(data.data).to.deep.equal(undefined)
        // expect(data.data.value).to.deep.equal(undefined)
        expect(data.errors).to.deep.an('array')
      }
    })
  })
})
