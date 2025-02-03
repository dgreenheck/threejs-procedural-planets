/**
* @type {import('vite').UserConfig}
*/
export default {
  base: process.env.NODE_ENV === 'production' ? '/threejs-procedural-planets/' : ''
}