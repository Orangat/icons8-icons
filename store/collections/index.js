'use strict'

import server from './serverApi.js'
import storage from './storageApi.js'
import download from './download.js'

const COLLECTIONS_LOADED = 'COLLECTIONS_LOADED'
const COLLECTION_ICONS_SYNCED = 'COLLECTION_ICONS_SYNCED'
const COLLECTION_SELECTED = 'COLLECTION_SELECTED'
const COLLECTION_RENAMED = 'COLLECTION_RENAMED'
const COLLECTION_CREATED = 'COLLECTION_CREATED'
const COLLECTION_UPDATED = 'COLLECTION_UPDATED'
const COLLECTION_MERGED = 'COLLECTION_MERGED'
const COLLECTION_REMOVED = 'COLLECTION_REMOVED'
const COLLECTION_EDITING = 'COLLECTION_EDITING'
const COLLECTION_OPENED = 'COLLECTION_OPENED'
const COLLECTION_CLOSED = 'COLLECTION_CLOSED'

const ICONS_LOADED = 'ICONS_LOADED'
const ICON_ADDED_TO_COLLECTION = 'ICON_ADDED_TO_COLLECTION'
const ICON_REMOVED_FROM_COLLECTION = 'ICON_REMOVED_FROM_COLLECTION'

const ICONS_LIMIT = '1000'
const DOWNLOADED_ICONS_LIMIT = '100'
// const COLLECTIONS_LIMIT = '50'

const state = () => ({
  collections: [],
  collection: {},
  isCollectionOpen: false
})

function api (isGuest) {
  if (isGuest) {
    return storage
  } else {
    return server
  }
}

const mutations = {
  [COLLECTIONS_LOADED] (state, collections) {
    state.collections = collections
  },
  [COLLECTION_ICONS_SYNCED] (state, { icons, data }) {
    data.create.forEach((id, i) => {
      const icon = icons[i]
      icon.iconId = icon.id
      icon.id = id
      const base64 = data.attributes[id].svg
      icon.svg = base64 ? window.atob(base64) : undefined
    })
  },
  [COLLECTION_CREATED] (state, collection) {
    collection.edit = false
    state.collections.unshift(collection)
  },
  [COLLECTION_UPDATED] (state, collection) {
    state.collections.some((c, i) => {
      if (c.id === collection.id) {
        Object.assign(state.collections[i], collection)
        return true
      }
    })
  },
  [COLLECTION_MERGED] (state, { oldCollection, newCollection }) {
    state.collections.some((c, i) => {
      if (c.id === oldCollection.id) {
        Object.assign(state.collections[i], newCollection)
        return true
      }
    })
  },
  [COLLECTION_REMOVED] (state, collection) {
    let index = -1
    state.collections.some((c, i) => {
      if (c.id === collection.id) {
        index = i
        return true
      }
    })
    if (index >= 0) {
      state.collections.splice(index, 1)
    }
  },
  [COLLECTION_SELECTED] (state, collection) {
    if (state.collection) {
      state.collection.edit = false
    }
    if (collection) {
      collection.edit = false
      collection.icons = collection.icons || []
      state.collection = collection
    }
  },
  [COLLECTION_RENAMED] (state, name) {
    if (state.collection) {
      state.collection.name = name
    }
  },
  [COLLECTION_EDITING] (state, edit) {
    if (state.collection) {
      state.collection.edit = edit
    }
  },
  [COLLECTION_OPENED] (state) {
    state.isCollectionOpen = true
  },
  [COLLECTION_CLOSED] (state) {
    state.isCollectionOpen = false
  },
  [ICONS_LOADED] (state, { collection, icons }) {
    collection.icons = icons
    collection.isLoaded = true
  },
  [ICON_ADDED_TO_COLLECTION] (state, { icon, collection }) {
    (collection || state.collection).icons.push(icon)
  },
  [ICON_REMOVED_FROM_COLLECTION] (state, { index, collection }) {
    (collection || state.collection).icons.splice(index, 1)
  }
}

const actions = {
  loadCollections,
  selectCollection,
  loadCollection,
  renameCollection,
  createCollection,
  removeCollection,
  openCollection,
  closeCollection,

  addIconsToCollection,
  removeIconFromCollection,
  toggleIconInCollection,
  addIconToDownloadedCollection,
  addUniqueInCollection,
  downloadCollection,
  generateFont,
  generateIconSet,
  shareCollection
}

function loadCollections ({ commit, state, rootState }) {
  return new Promise(function (resolve, reject) {
    let collections
    api(rootState.auth.user.isGuest)
      .loadCollections(rootState.auth.user.authToken)
      .then(result => {
        collections = result
        commit(COLLECTIONS_LOADED, collections)
        return prepareDefaultCollection({ commit, state, rootState }, collections)
      })
      .then(() => {
        return prepareRecentlyDownloadedCollection({ commit, state, rootState }, collections)
      })
      .then(resolve)
      .catch(error => {
        console.error(error)
        reject(error)
      })
  })
}

function prepareDefaultCollection ({ commit, state, rootState }, collections) {
  return new Promise(function (resolve, reject) {
    const defaultCollection = getDefaultCollection(collections)
    if (!defaultCollection) {
      const newCollection = {
        id: '' + new Date().getTime(),
        name: 'Favorites',
        icons: [],
        'default': true
      }
      commit(COLLECTION_CREATED, newCollection)
      commit(COLLECTION_SELECTED, newCollection)
      api(rootState.auth.user.isGuest)
        .createCollection(newCollection, rootState.auth.user.authToken)
        .then(collection => {
          commit(COLLECTION_UPDATED, collection)
        })
        .catch(error => {
          console.error(error)
          reject(error)
        })
    } else {
      selectCollection({ commit, state, rootState }, defaultCollection)
        .then(resolve)
        .catch(reject)
    }
  })
}

function prepareRecentlyDownloadedCollection ({ commit, state, rootState }, collections) {
  return new Promise(function (resolve, reject) {
    if (!getRecentlyDownloadedCollection({ commit }, collections)) {
      const newCollection = {
        id: '' + new Date().getTime(),
        name: 'Downloaded',
        icons: [],
        'recentlyDownloaded': true
      }
      commit(COLLECTION_CREATED, newCollection)
      api(rootState.auth.user.isGuest)
        .createCollection(newCollection, rootState.auth.user.authToken)
        .then(collection => {
          commit(COLLECTION_UPDATED, collection)
          resolve()
        })
        .catch(reject)
    } else {
      resolve()
    }
  })
}

function getDefaultCollection (collections) {
  let defaultCollection = false
  collections.forEach(collection => {
    if (collection.default) {
      defaultCollection = collection
    }
  })
  return defaultCollection
}

function getRecentlyDownloadedCollection ({ commit }, collections) {
  let recentlyDownloadedCollection = false
  collections.some(collection => {
    if (collection.recentlyDownloaded) {
      recentlyDownloadedCollection = collection
      return true
    }
  })
  if (!recentlyDownloadedCollection) {
    collections.some(collection => {
      if (collection.name === 'Downloaded') {
        recentlyDownloadedCollection = Object.assign({}, collection)
        recentlyDownloadedCollection.recentlyDownloaded = true
        commit(COLLECTION_UPDATED, recentlyDownloadedCollection)
        return true
      }
    })
  }
  return recentlyDownloadedCollection
}

function selectCollection ({ commit, state, rootState }, collection) {
  return new Promise(function (resolve, reject) {
    commit(COLLECTION_SELECTED, collection)
    if (!collection.isLoaded) {
      loadCollection({ commit, state, rootState }, collection)
        .then(resolve)
        .catch(reject)
    } else {
      resolve()
    }
  })
}

function loadCollection ({ commit, rootState }, collection) {
  return new Promise(function (resolve, reject) {
    if (!rootState.auth.user.isGuest) {
      api(rootState.auth.user.isGuest)
        .loadIcons(collection, rootState.auth.user.authToken)
        .then(icons => {
          commit(ICONS_LOADED, { collection, icons })
          resolve()
        })
        .catch(reject)
    } else {
      resolve()
    }
  })
}

function renameCollection ({ commit, state, rootState }, name) {
  commit(COLLECTION_RENAMED, name)
  api(rootState.auth.user.isGuest)
    .syncCollection(state.collection, rootState.auth.user.authToken)
}

function createCollection ({ commit, state, rootState }) {
  return new Promise(function (resolve, reject) {
    const token = rootState.auth.user.authToken
    const newCollection = {
      id: token + '.' + new Date().getTime(),
      name: generateNewName(state.collections),
      icons: []
    }
    commit(COLLECTION_CREATED, newCollection)
    commit(COLLECTION_SELECTED, newCollection)
    commit(COLLECTION_EDITING, true)
    api(rootState.auth.user.isGuest)
      .createCollection(newCollection, token)
      .then(collection => {
        // TODO really strange parameters, need to refactor
        commit(COLLECTION_MERGED, {
          oldCollection: newCollection,
          newCollection: collection
        })
        resolve()
      })
      .catch(error => {
        console.error(error)
        reject(error)
      })
  })
}

function removeCollection ({ commit, state, rootState }, collection) {
  if (state.collection.id === collection.id) {
    if (state.collections.length > 1) {
      commit(COLLECTION_SELECTED, state.collections[0])
    } else {
      commit(COLLECTION_SELECTED, undefined)
    }
  }
  api(rootState.auth.user.isGuest)
    .removeCollection(collection, rootState.auth.user.authToken)
    .then(collection => {
      commit(COLLECTION_REMOVED, collection)
      prepareDefaultCollection({ commit, state, rootState }, state.collections)
    })
    .catch(console.error)
}

function openCollection ({ commit }) {
  commit(COLLECTION_OPENED)
}

function closeCollection ({ commit }) {
  commit(COLLECTION_CLOSED)
}

function addIconsToCollection ({ commit, state, rootState }, { icons, collection = state.collection }) {
  return new Promise(function (resolve, reject) {
    if (collection && collection.icons && collection.icons.length >= ICONS_LIMIT) {
      reject({
        notify: `Sorry, the icon collection limit is ${ICONS_LIMIT}!`
      })
      return
    }
    const token = rootState.auth.user.authToken
    const iconObjects = []
    icons.forEach(rawIcon => {
      const icon = Object.assign({
        iconId: rawIcon.id,
        collection: collection.id
      }, rawIcon)
      commit(ICON_ADDED_TO_COLLECTION, { icon, collection })
      iconObjects.push(icon)
    })
    api(rootState.auth.user.isGuest)
      .syncAddedIcons(collection, iconObjects, token)
      .then(response => {
        if (!rootState.auth.user.isGuest) {
          commit(COLLECTION_ICONS_SYNCED, {
            icons: iconObjects,
            data: response
          })
        }
        resolve()
      })
      .catch(reject)
  })
}

function removeIconFromCollection ({ commit, state, rootState }, { icon, collection }) {
  return new Promise(function (resolve, reject) {
    let index = -1
    let iconObject;
    (collection || state.collection).icons.some((ic, i) => {
      // if select icon from collection
      // then real icon id stored in iconId
      if (ic.collection === icon.collection) {
        if (ic.id === icon.id) {
          index = i
          iconObject = ic
          return true
        }
        // if select icon from iconGrid or anything else
        // then real icon id stored in id
      } else {
        if (ic.iconId === icon.id) {
          index = i
          iconObject = ic
          return true
        }
      }
    })
    if (iconObject) {
      commit(ICON_REMOVED_FROM_COLLECTION, { index, collection })
      api(rootState.auth.user.isGuest)
        .syncRemovedIcons([iconObject], rootState.auth.user.authToken)
        .then(resolve)
        .catch(reject)
    }
  })
}

function toggleIconInCollection ({ commit, state, rootState }, { icon, collection }) {
  let exists = false;
  (collection || state.collection).icons.find(i => {
    if (i.iconId === icon.id) { // && !icon.user_icon_id
      exists = true
    }
  })
  if (!exists) {
    return addIconsToCollection({ commit, state, rootState }, { icons: [icon], collection })
  } else {
    return removeIconFromCollection({ commit, state, rootState }, { icon, collection })
  }
}

function addIconToDownloadedCollection ({ commit, state, rootState }, { icon }) {
  return new Promise(function (resolve, reject) {
    const collection = getRecentlyDownloadedCollection({ commit }, state.collections)
    if (collection) {
      if (collection.icons && collection.icons.length < DOWNLOADED_ICONS_LIMIT) {
        addUniqueInCollection({ commit, state, rootState }, { icon, collection })
          .then(resolve)
          .catch(reject)
        return
      }
      commit(ICON_REMOVED_FROM_COLLECTION, { index: 0, collection })
      api(rootState.auth.user.isGuest)
        .syncRemovedIcons([collection.icons[0]], rootState.auth.user.authToken)
        .then(() => {
          return addUniqueInCollection({ commit, state, rootState }, { icon, collection })
        })
        .then(resolve)
        .catch(reject)
    } else {
      console.warn('recentlyDownloaded collection not found')
      resolve()
    }
  })
}

// TODO: Think about better function name
function addUniqueInCollection ({ commit, state, rootState }, { icon, collection }) {
  return new Promise(function (resolve, reject) {
    let exists = false;
    (collection || state.collection).icons.find(i => {
      if ((i.iconId === icon.id || i.id === icon.id) && !icon.user_icon_id) {
        exists = true
      }
    })
    if (!exists) {
      addIconsToCollection({ commit, state, rootState }, { icons: [icon], collection })
        .then(resolve)
        .catch(reject)
    } else {
      resolve()
    }
  })
}

function shareCollection ({ rootState, commit }, collection) {
  return new Promise(function (resolve, reject) {
    api(rootState.auth.user.isGuest)
      .shareCollection(collection, rootState.auth.user.authToken)
      .then(updatedCollection => {
        commit(COLLECTION_UPDATED, updatedCollection)
      })
      .catch(reject)
  })
}

function generateNewName (collections) {
  let index = 0
  let name
  let valid = false
  while (!valid) {
    index++
    name = `Collection ${index}`
    let exists = false
    collections.forEach(collection => {
      if (collection.name === name) {
        exists = true
      }
    })
    if (!exists) {
      valid = true
    }
  }
  return name
}

function downloadCollection ({ rootState }, { collection, icons, options }) {
  const { name } = collection
  return download.downloadCollection({
    ...options,
    icons,
    name
  })
}

function generateFont ({ rootState }, { collection, icons }) {
  return download.generateFont(icons, collection, rootState.auth.user.authToken)
}

function generateIconSet ({ rootState }, { collection, icons }) {
  return download.generateIconSet(icons, collection.name, rootState.auth.user.authToken)
}

const store = () => ({
  state,
  mutations,
  actions
})

export default store
