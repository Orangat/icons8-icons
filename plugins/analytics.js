'use strict'

import axios from './axios'

const analyticsPlugin = {
  install (Vue, {store}) {
    const analytics = store.state.appInfo.parseAnalytics || {}
    const serverURL = analytics.serverURL || 'https://icons8-analytics.herokuapp.com/parse'
    const defaults = {
      _ApplicationId: analytics.appId || 'qisD2KRBPWSrsNouYg0VAqJIse5YMH',
      _ClientVersion: 'js1.10.1',
      _InstallationId: '60ac902e-0362-972f-57f1-d563cadca058',
      _JavaScriptKey: analytics.javascriptKey || 'rcsH8Os23luQ9uVybaA9c0DfeRELW0'
    }

    const GA = window.ga !== 'undefined' ? window.ga : undefined

    Vue.prototype.$analytics = {
      page,
      track,
      trackSearch,
      trackIconClick,
      trackIconDownload
    }

    function trackSearch ({term}) {
      const data = {
        userId: store.state.auth.user.userId,
        searchTerm: term
      }
      trackEvent('EventSearch', data)
      track({
        event: 'Searched',
        category: 'Navigation'
      })
    }

    function trackIconClick ({id, term}) {
      const data = {
        iconId: id,
        userId: store.state.auth.user.userId
      }
      if (term) {
        data.searchTerm = term
      }
      trackEvent('EventIconClick', data)
    }

    function trackIconDownload ({icon, options}) {
      const data = {
        iconId: icon.id,
        format: options.format,
        userId: store.state.auth.user.userId,
        paid: !!store.state.auth.user.activeLicense
      }
      trackEvent('EventIconDownload', data)
      track({
        event: 'Downloaded an icon',
        category: 'Downloads'
      })
    }

    function trackEvent (name, data) {
      axios.request({
        url: `/classes/${name}`,
        baseURL: serverURL,
        method: 'post',
        data: {
          ...data,
          ...defaults
        }
      })
        .catch(error => {
          console.error('Analytics track failed for ' + name, error)
        })
    }

    function track ({event = '', category}) {
      if (GA && category && event) {
        GA('send', 'event', category, event)
      }
    }

    function page ({name = '', url = window.location.href}) {
      if (GA) {
        GA('send', 'pageview', {
          page: url,
          title: name
        })
      }
    }
    return null
  }
}

export default analyticsPlugin
