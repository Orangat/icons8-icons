'use strict'

const createEnsureLoginPlugin = () => ({
  install (Vue, {store}) {
    Vue.prototype.$ensureLogin = function (options = {
      mode: 'register',
      user: store.state.auth.user
    }) {
      return new Promise(function (resolve) {
        if (options.user && !options.user.isGuest) {
          resolve()
          return
        }
        Vue.$modal.show('login-modal', {
          callback: resolve,
          ...options
        })
      })
    }
    return null
  }
})

export default createEnsureLoginPlugin
