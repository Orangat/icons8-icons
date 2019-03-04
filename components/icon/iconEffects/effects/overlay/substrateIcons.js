'use strict'

let icons = {
  android: {},
  androidL: {},
  carbon_copy: {},
  dotty: {},
  ios7: {},
  ios11: {},
  m_outlined: {},
  m_rounded: {},
  m_sharp: {},
  m_two_tone: {},
  nolan: {},
  p1em: {},
  win8: {},
  win10: {},
  Dusk_Wired: {}
}

function importAll (platform, r) {
  r.keys().forEach(key => (platform[key.split('./').join('').split('substrate_').join('')] = r(key)))
}

importAll(icons.android, require.context(`!!raw-loader!./substrate/android`, true, /\.*$/))
importAll(icons.androidL, require.context(`!!raw-loader!./substrate/androidL`, true, /\.*$/))
importAll(icons.carbon_copy, require.context(`!!raw-loader!./substrate/carbon_copy`, true, /\.*$/))
importAll(icons.dotty, require.context(`!!raw-loader!./substrate/dotty`, true, /\.*$/))
importAll(icons.ios7, require.context(`!!raw-loader!./substrate/ios7`, true, /\.*$/))
importAll(icons.ios11, require.context(`!!raw-loader!./substrate/ios11`, true, /\.*$/))
importAll(icons.m_outlined, require.context(`!!raw-loader!./substrate/androidL`, true, /\.*$/))
importAll(icons.m_rounded, require.context(`!!raw-loader!./substrate/m_rounded`, true, /\.*$/))
importAll(icons.m_sharp, require.context(`!!raw-loader!./substrate/m_sharp`, true, /\.*$/))
importAll(icons.m_two_tone, require.context(`!!raw-loader!./substrate/androidL`, true, /\.*$/))
importAll(icons.nolan, require.context(`!!raw-loader!./substrate/nolan`, true, /\.*$/))
importAll(icons.p1em, require.context(`!!raw-loader!./substrate/p1em`, true, /\.*$/))
importAll(icons.win8, require.context(`!!raw-loader!./substrate/win8`, true, /\.*$/))
importAll(icons.win10, require.context(`!!raw-loader!./substrate/win10`, true, /\.*$/))
importAll(icons.Dusk_Wired, require.context(`!!raw-loader!./substrate/wired`, true, /\.*$/))

export default icons
