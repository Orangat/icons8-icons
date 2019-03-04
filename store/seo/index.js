'use strict'

const SEO_UPDATED = 'SEO_UPDATED'

const defaults = {
  title: '85,000 Icons - Free Download',
  description: 'The largest icon pack of free icons for Windows8, Windows10, iOS 11, Android 4, Material, and Office. Save in any size, color, and format in 20 seconds.',
  image: 'https://icons8.com/vue-static/icon/preview_icons8.png',
  url: 'https://icons8.com/icon'
}

const state = () => ({
  data: {
    title: defaults.title,
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { name: 'description', hid: 'description', content: defaults.description },

      { name: 'twitter:site', hid: 'twitter:site', content: '@icons_8' },
      { name: 'twitter:creator', hid: 'twitter:creator', content: '@icons_8' },
      { name: 'twitter:url', hid: 'twitter:url', content: defaults.url },
      { name: 'twitter:title', hid: 'twitter:title', content: defaults.title },
      { name: 'twitter:description', hid: 'twitter:description', content: defaults.description },
      { name: 'twitter:image', hid: 'twitter:image', content: defaults.image },
      { name: 'twitter:image:width', hid: 'twitter:image:width', content: '256' },
      { name: 'twitter:image:height', hid: 'twitter:image:height', content: '256' },

      { name: 'og:site_name', hid: 'og:site_name', content: 'Icons8' },
      { name: 'og:url', hid: 'og:url', content: defaults.url },
      { name: 'og:title', hid: 'og:title', content: defaults.title },
      { name: 'og:description', hid: 'og:description', content: defaults.description },
      { name: 'og:image', hid: 'og:image', content: defaults.image },
      { name: 'og:image:type', hid: 'og:type', content: 'png' },
      { name: 'og:image:width', hid: 'og:image:width', content: '256' },
      { name: 'og:image:height', hid: 'og:image:height', content: '256' }
    ],
    link: [
      { rel: 'image_src', href: defaults.image }
    ]
  }
})

const mutations = {
  [SEO_UPDATED] (state, {
    title = defaults.title,
    description = defaults.description,
    image = defaults.image,
    url,
    canonical,

    twitterTitle,
    twitterDescription,
    twitterImage = image,

    googleTitle,
    googleDescription,
    googleImage = image
  } = {}) {
    state.data.title = title
    if (!url) {
      if (process.browser) {
        url = window.location.href
      } else {
        url = defaults.url
      }
    }
    if (!canonical) {
      canonical = url
    }

    title = this.$utils.stripTags(title)
    twitterTitle = twitterTitle || title
    googleTitle = googleTitle || title

    description = this.$utils.stripTags(description)
    twitterDescription = twitterDescription || description
    googleDescription = googleDescription || description

    state.data.meta = [{
      name: 'description',
      hid: 'description',
      content: description
    },

    {
      name: 'twitter:url',
      hid: 'twitter:url',
      content: url
    }, {
      name: 'twitter:title',
      hid: 'twitter:title',
      content: twitterTitle
    }, {
      name: 'twitter:description',
      hid: 'twitter:description',
      content: twitterDescription
    }, {
      name: 'twitter:image',
      hid: 'twitter:image',
      content: twitterImage
    },

    {
      name: 'og:url',
      hid: 'og:url',
      content: url
    }, {
      name: 'og:title',
      hid: 'og:title',
      content: googleTitle
    }, {
      name: 'og:description',
      hid: 'og:description',
      content: googleDescription
    }, {
      name: 'og:image',
      hid: 'og:image',
      content: googleImage
    }]

    if (canonical !== url) {
      state.data.link = [
        { rel: 'canonical', href: canonical }
      ]
    } else {
      state.data.link = []
    }
  }
}

const actions = {
  updateSEO ({ commit }, seo) {
    commit(SEO_UPDATED, seo)
  },
  nuxtServerInit ({ commit }, { req }) {
    commit(SEO_UPDATED, {
      url: '//' + req.headers.host + req.originalUrl
    })
  }
}

const store = () => ({
  state,
  mutations,
  actions
})

export default store
