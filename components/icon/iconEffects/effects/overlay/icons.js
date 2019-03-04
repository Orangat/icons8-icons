'use strict'

let icons = {
  android: {},
  androidL: {},
  bubbles: {},
  carbon_copy: {},
  clouds: {},
  color: {},
  doodle: {},
  dotty: {},
  dusk: {},
  ios7: {},
  ios11: {},
  flat_round: {},
  m_outlined: {},
  m_rounded: {},
  m_sharp: {},
  m_two_tone: {},
  nolan: {},
  office: {
    16: {},
    30: {},
    40: {},
    80: {}
  },
  p1em: {},
  plasticine: {},
  ultraviolet: {},
  win8: {},
  win10: {},
  Dusk_Wired: {}
}

function importAll (platform, r) {
  r.keys().forEach(key => (platform[key.split('./').join('')] = r(key)))
}

importAll(icons.android, require.context(`!!raw-loader!./icons/android`, true, /\.*$/))
importAll(icons.androidL, require.context(`!!raw-loader!./icons/androidL`, true, /\.*$/))
importAll(icons.bubbles, require.context(`!!raw-loader!./icons/clouds`, true, /\.*$/))
importAll(icons.carbon_copy, require.context(`!!raw-loader!./icons/carbon_copy`, true, /\.*$/))
importAll(icons.clouds, require.context(`!!raw-loader!./icons/clouds`, true, /\.*$/))
importAll(icons.color, require.context(`!!raw-loader!./icons/color`, true, /\.*$/))
importAll(icons.doodle, require.context(`!!raw-loader!./icons/doodle`, true, /\.*$/))
importAll(icons.dotty, require.context(`!!raw-loader!./icons/dotty`, true, /\.*$/))
importAll(icons.dusk, require.context(`!!raw-loader!./icons/dusk`, true, /\.*$/))
importAll(icons.ios7, require.context(`!!raw-loader!./icons/ios7`, true, /\.*$/))
importAll(icons.ios11, require.context(`!!raw-loader!./icons/ios11`, true, /\.*$/))
importAll(icons.flat_round, require.context(`!!raw-loader!./icons/flat_round`, true, /\.*$/))
importAll(icons.m_outlined, require.context(`!!raw-loader!./icons/androidL`, true, /\.*$/))
importAll(icons.m_rounded, require.context(`!!raw-loader!./icons/m_rounded`, true, /\.*$/))
importAll(icons.m_sharp, require.context(`!!raw-loader!./icons/m_sharp`, true, /\.*$/))
importAll(icons.m_two_tone, require.context(`!!raw-loader!./icons/androidL`, true, /\.*$/))
importAll(icons.nolan, require.context(`!!raw-loader!./icons/nolan`, true, /\.*$/))
importAll(icons.p1em, require.context(`!!raw-loader!./icons/p1em`, true, /\.*$/))
importAll(icons.plasticine, require.context(`!!raw-loader!./icons/plasticine`, true, /\.*$/))
importAll(icons.ultraviolet, require.context(`!!raw-loader!./icons/ultraviolet`, true, /\.*$/))
importAll(icons.win8, require.context(`!!raw-loader!./icons/win8`, true, /\.*$/))
importAll(icons.win10, require.context(`!!raw-loader!./icons/win10`, true, /\.*$/))
importAll(icons.Dusk_Wired, require.context(`!!raw-loader!./icons/wired`, true, /\.*$/))

importAll(icons.office[16], require.context(`!!raw-loader!./icons/office/16`, true, /\.*$/))
importAll(icons.office[30], require.context(`!!raw-loader!./icons/office/30`, true, /\.*$/))
importAll(icons.office[40], require.context(`!!raw-loader!./icons/office/40`, true, /\.*$/))
importAll(icons.office[80], require.context(`!!raw-loader!./icons/office/80`, true, /\.*$/))

export default icons
