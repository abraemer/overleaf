/* eslint-disable no-unused-vars */

import Helpers from './lib/helpers.mjs'
import mongodb from './lib/mongodb.mjs'
const { getCollectionInternal } = mongodb

const tags = ['server-ce']

const indexes = [
  {
    key: {
      oidcIdentifier: 1,
    },
    name: 'oidcIdentifier_1',
    unique: true,
    sparse: true,
  },
]

async function getCollection() {
  return await getCollectionInternal('users')
}

const migrate = async client => {
  const collection = await getCollection()
  const dups = await collection
    .aggregate([
      { $match: { oidcIdentifier: { $ne: null } } },
      {
        $group: {
          _id: '$oidcIdentifier',
          count: { $sum: 1 },
          ids: { $push: '$_id' },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ])
    .toArray()
  if (dups.length) {
    throw new Error(
      `Duplicate oidcIdentifier values block the unique index: ${JSON.stringify(dups)}`
    )
  }
  await Helpers.addIndexesToCollection(collection, indexes)
}

const rollback = async client => {
  const collection = await getCollection()
  try {
    await Helpers.dropIndexesFromCollection(collection, indexes)
  } catch (err) {
    console.error('Something went wrong rolling back the migrations', err)
  }
}

export default {
  tags,
  migrate,
  rollback,
}
