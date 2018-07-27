var host = 'https://www.bphots.com/'

var config = {
  service: {
    host,
    loginUrl: `${host}wxmini/api/login`,
    presetsUrl: `${host}week/api/report/presets`,
    heroListUrl: `${host}bp_helper/get/herolist/v2`,
    reportUrl: `${host}wxmini/api/reporterV2/info`,
    globalUrl: `${host}week/api/report/global/`,
    subscribe: `${host}wxmini/api/reporterV2/subscribe`
  }
}
module.exports = config;