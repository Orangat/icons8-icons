export default ({ store, isHMR }) => {
  if (isHMR) return

  window.onNuxtReady(() => {
    store.dispatch('fillUserInfo')
  })
}
