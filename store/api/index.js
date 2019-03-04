'use strict'

import icon from './icon/index'
import latest from './latest'
import pack from './pack'
import search from './search'

const actions = {
  ...icon,
  latest,
  ...pack,
  search
}

const store = () => ({
  actions
})

export default store
