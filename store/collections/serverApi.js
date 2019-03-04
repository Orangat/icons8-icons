'use strict'

import axios from '~/plugins/axios'
import storage from './storageApi'

const api = {
  loadCollections,
  syncCollection,
  createCollection,
  removeCollection,

  loadIcons,
  syncAddedIcons,
  syncRemovedIcons,
  shareCollection
}

const SYNC_URL = '/api/sync/2.0.0'

const paramsConfig = {
  'application-id': 'fast',
  'application-platform': 'web',
  'application-version': '1.0.0'
}

const defaultSyncData = {
  version: '2.0.0.',
  application: {
    applicationId: 'fast',
    platform: 'web',
    version: '1.0.0'
  }
}

function loadCollections (token) {
  return new Promise(function (resolve, reject) {
    syncLocalCollections(token)
      .then(() => {
        const params = {
          hash: token,
          version: '2.0.0',
          ...paramsConfig,
          icons: 9
        }
        return axios
          .request({
            url: `${SYNC_URL}/collections`,
            baseURL: process.env.apiUrl,
            method: 'get',
            params,
            withCredentials: true
          })
      })
      .then(response => {
        resolve(parseCollections(response.data.collection))
      })
      .catch(reject)
  })
}

function parseCollections (collections) {
  let result = []
  if (collections) {
    Object.keys(collections).forEach(id => {
      let collection = collections[id]
      collection.icons = parseIcons(collection.icons)
      if (collection.share) {
        collection.share = collection.share.url
      } else {
        collection.share = undefined
      }
      result.push(collection)
    })
  }
  return result
}

function parseIcons (iconsObject) {
  let icons = []
  if (iconsObject) {
    Object.keys(iconsObject).forEach(id => {
      const icon = iconsObject[id]
      icon.svg = icon.svg ? window.atob(icon.svg) : icon.svg
      icons.push(icon)
    })
  }
  return icons
}

function loadIcons (collection, token) {
  return new Promise(function (resolve, reject) {
    const params = {
      hash: token,
      ...paramsConfig,
      collection: collection.id,
      randomKey: Date.now()
    }
    axios
      .request({
        url: `${SYNC_URL}/icons`,
        baseURL: process.env.apiUrl,
        method: 'get',
        params,
        withCredentials: true
      })
      .then(response => {
        resolve(parseIcons(response.data.icon))
      })
      .catch(reject)
  })
}

function syncAddedIcons (collection, icons, token) {
  return new Promise(function (resolve, reject) {
    let data = Object.assign({}, defaultSyncData, {
      auth: {
        hash: token
      },
      changes: ['icon'],
      icon: {
        create: [],
        attributes: {}
      }
    })

    icons.forEach((icon, i) => {
      const timestamp = Date.now()
      let id = icon.id
      if (!id || ('' + id).startsWith('user_icon')) {
        id = `${collection.id}.${timestamp}.${i}`
      }

      data.icon.create.push(id)
      data.icon.attributes[id] = {
        id,
        name: icon.name,
        timestamp,
        collection: collection.id,
        svg: icon.svg
      }
      if (!icon.imported && !icon.user_icon_id) {
        data.icon.attributes[id].iconId = id
      }
    })

    axios
      .request({
        url: SYNC_URL,
        baseURL: process.env.apiUrl,
        method: 'post',
        data,
        withCredentials: true
      })
      .then(response => {
        if (response.data.icon) {
          resolve(response.data.icon)
        } else {
          console.error('Error - Add Icon to Collection failed. Response', response.data)
          reject({message: response.data.message})
        }
      })
      .catch(reject)
  })
}

function syncRemovedIcons (icons, token) {
  return new Promise(function (resolve, reject) {
    let data = Object.assign({}, defaultSyncData, {
      auth: {
        hash: token
      },
      changes: ['icon'],
      icon: {
        remove: []
      }
    })

    icons.forEach(icon => {
      data.icon.remove.push(icon.id)
    })

    axios
      .request({
        url: SYNC_URL,
        baseURL: process.env.apiUrl,
        method: 'post',
        data,
        withCredentials: true
      })
      .then(response => {
        if (response.data.icon) {
          resolve()
        } else {
          console.error('Error - Remove Icon from Collection failed. Response', response.data)
          reject({message: response.data.message})
        }
      })
      .catch(reject)
  })
}

function syncCollection (collection, token) {
  return new Promise(function (resolve, reject) {
    const id = collection.id
    const data = Object.assign({}, defaultSyncData, {
      auth: {
        hash: token
      },
      changes: ['collection'],
      collection: {
        change: [id],
        attributes: {
          [id]: {
            id,
            name: collection.name
          }
        }
      }
    })
    axios
      .request({
        url: SYNC_URL,
        baseURL: process.env.apiUrl,
        method: 'post',
        data,
        withCredentials: true
      })
      .then(() => {
        resolve()
      })
      .catch(reject)
  })
}

function createCollection (collection, token) {
  return new Promise(function (resolve, reject) {
    const id = collection.id
    const data = Object.assign({}, defaultSyncData, {
      auth: {
        hash: token
      },
      changes: ['collection'],
      collection: {
        create: [id],
        attributes: {
          [id]: {
            id,
            name: collection.name,
            timestamp: Date.now(),
            'default': collection.default,
            recentlyDownloaded: collection.recentlyDownloaded
          }
        }
      }
    })
    axios
      .request({
        url: SYNC_URL,
        baseURL: process.env.apiUrl,
        method: 'post',
        data,
        withCredentials: true
      })
      .then(response => {
        if (!response.data.collection || !response.data.collection.attributes) {
          reject({message: 'Invalid server response', response: response.data})
          return
        }
        const newId = Object.keys(response.data.collection.attributes)[0]
        const updatedCollection = Object.assign({}, collection, response.data.collection.attributes[newId])
        resolve(updatedCollection)
      })
      .catch(reject)
  })
}

function removeCollection (collection, token) {
  return new Promise(function (resolve, reject) {
    const data = Object.assign({}, defaultSyncData, {
      auth: {
        hash: token
      },
      changes: ['collection'],
      collection: {
        remove: [collection.id]
      }
    })

    axios
      .request({
        url: SYNC_URL,
        baseURL: process.env.apiUrl,
        method: 'post',
        data,
        withCredentials: true
      })
      .then(response => {
        if (response.data.messages) {
          reject(response.data)
        } else {
          resolve(collection)
        }
      })
      .catch(reject)
  })
}

function syncLocalCollections (token) {
  return new Promise(function (resolve, reject) {
    // collect not synced collection with icons
    const collections = storage.getCollections()
      .filter(collection => {
        return !collection.synced && collection.icons && collection.icons.length
      })

    // if there is no collections, then resolve
    if (!collections.length) {
      resolve()
      return
    }

    let data = Object.assign({}, defaultSyncData, {
      auth: {
        hash: token
      },
      changes: ['collection'],
      collection: {
        create: [],
        attributes: {}
      }
    })

    // collect info for create collection
    const timestamp = Date.now()
    collections.forEach(collection => {
      data.collection.create.push(collection.id)
      data.collection.attributes[collection.id] = {
        id: collection.id,
        name: collection.name,
        timestamp,
        default: false
      }
    })

    // create collections
    axios
      .request({
        url: SYNC_URL,
        baseURL: process.env.apiUrl,
        method: 'post',
        data,
        withCredentials: true
      })
      .then(response => {
        if (!response.data.collection || !response.data.collection.attributes) {
          reject({message: 'Invalid server response', response: response.data})
          return
        }
        // update collections id from response
        const attributes = response.data.collection.attributes
        Object.keys(attributes).forEach((id, i) => {
          collections[i].id = id
        })

        // sync collections icons
        let promises = []
        collections.forEach(collection => {
          promises.push(syncAddedIcons(collection, collection.icons, token))
        })

        Promise.all(promises)
          .then(() => {
            collections.forEach(collection => {
              collection.synced = true
            })
            storage.syncCollections(collections)
            resolve()
          })
          .catch(reject)
      })
      .catch(reject)
  })
}

function shareCollection (collection, token) {
  return new Promise(function (resolve, reject) {
    const params = {
      hash: token,
      id: collection.id,
      version: '2.0.0',
      ...paramsConfig,
      icons: 4
    }
    axios
      .request({
        url: `${SYNC_URL}/share`,
        baseURL: process.env.apiUrl,
        method: 'get',
        params,
        withCredentials: true
      })
      .then(response => {
        if (response.data.collection) {
          const updatedCollection = response.data.collection[collection.id]
          if (updatedCollection && updatedCollection.share) {
            resolve({id: collection.id, share: updatedCollection.share.url})
          } else {
            reject(response.data)
          }
        } else {
          reject(response.data)
        }
      })
      .catch(reject)
  })
}

export default api
