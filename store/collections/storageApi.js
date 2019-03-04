'use strict'

const api = {
  getCollections,
  loadCollections,
  createCollection,
  removeCollection,
  syncCollections,
  syncCollection,

  loadIcons,
  syncAddedIcons,
  syncRemovedIcons
}

function loadCollections () {
  return new Promise(function (resolve) {
    resolve(getCollections())
  })
}

function createCollection (collection) {
  return new Promise(function (resolve) {
    const collections = getCollections()
    collections.push(collection)
    syncCollections(collections)
    resolve(collection)
  })
}

function removeCollection (collection) {
  return new Promise(function (resolve) {
    const collections = getCollections()
    let index = -1
    collections.some((c, i) => {
      if (c.id === collection.id) {
        index = i
        return true
      }
    })
    if (index >= 0) {
      collections.splice(index, 1)
      syncCollections(collections)
    }
    resolve(collection)
  })
}

function getCollections () {
  return JSON.parse(localStorage.getItem('collections')) || []
}

function syncCollections (collections) {
  localStorage.setItem('collections', JSON.stringify(collections))
}

function syncCollection (collection) {
  const collections = getCollections()
  collections.forEach((coll, i) => {
    if (collection.id === coll.id) {
      collections[i] = collection
      syncCollections(collections)
    }
  })
}

function removeIcon (icon) {
  const collections = getCollections()
  collections.forEach((coll, i) => {
    if (icon.collection === coll.id) {
      collections[i].icons = collections[i].icons.filter(storeIcon => storeIcon.iconId !== icon.iconId)
      syncCollections(collections)
    }
  })
}

// mock for server api
function loadIcons (collection) {
  return new Promise(function (resolve) {
    resolve(collection.icons)
  })
}

// mock for server api
function syncAddedIcons (collection) {
  return new Promise(function (resolve) {
    syncCollection(collection)
    resolve()
  })
}

// mock for server api
function syncRemovedIcons (icon) {
  return new Promise(function (resolve) {
    removeIcon(...icon)
    resolve()
  })
}

export default api
