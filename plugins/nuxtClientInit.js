export default (context) => {
  return new Promise(function (resolve, reject) {
    if (context.isHMR) {
      resolve()
      return
    }
    context.store.dispatch('nuxtClientInit', context)
      .then(resolve)
      .catch(reject)
  })
}
