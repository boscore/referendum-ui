import { MessageBox as MbMessageBox } from 'mint-ui'
import { MessageBox } from 'element-ui'
import en from 'element-ui/lib/locale/lang/en'
import cn from 'element-ui/lib/locale/lang/zh-CN'
import locale from 'element-ui/lib/locale'

const elLang = {
  'en': en,
  'cn': cn
}

export default {
  alert,
  dateConvert,
  changeLanguage,
  errorFormat,
  toThousands,
  isExpired,
  isPC,
  transSpecialChar,
  unTransSpecialChar
}

function changeLanguage (lang) {
  locale.use(elLang[lang])
  localStorage.setItem('language', lang)
  this.$i18n.locale = lang
}

function dateConvert (date) {
  // convert date to current time zone
  const diff = new Date().getTimezoneOffset()
  const newDateTime = new Date(date).getTime() + (diff * 60 * 1000)
  const newDate = new Date(newDateTime)
  function formatNumber (n) {
    if (n < 10) {
      return '0' + n
    }
    return n
  }
  return `${newDate.getFullYear()}-${formatNumber(newDate.getMonth() + 1)}-${formatNumber(newDate.getDate())} ${formatNumber(newDate.getHours())}:${formatNumber(newDate.getMinutes())}`
}

function toThousands (num) {
  return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
}

function isExpired (exporiesAt) {
  let now = new Date().getTime() + (new Date().getTimezoneOffset() * 60 * 1000)
  let expiry = new Date(exporiesAt).getTime()
  if (expiry < now) {
    return true
  }
  return false
}

function transSpecialChar (json) {
  if (json !== undefined && json !== '' && json !== 'null') {
    json = json.replace(/\r/g, '\\r')
    json = json.replace(/\n/g, '\\n')
    json = json.replace(/\t/g, '\\t')
    json = json.replace(/\\/g, '\\\\')
    json = json.replace(/\\"/g, '\\\\"')
  }
  return json
}

function unTransSpecialChar (json) {
  if (json !== undefined && json !== '' && json !== 'null') {
    json = json.replace(/\\r/g, '\r')
    json = json.replace(/\\n/g, '\n')
    json = json.replace(/\\t/g, '\t')
    json = json.replace(/\\\\/g, '\\')
    json = json.replace(/\\\\"/g, '\\"')
  }
  return json
}

function isPC () {
  const userAgentInfo = navigator.userAgent
  const Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod']
  let flag = true
  for (let i = 0; i < Agents.length; i++) {
    if (userAgentInfo.indexOf(Agents[i]) > 0) {
      flag = false
      break
    }
  }
  return flag
}

function errorFormat (e) {
  let error = e
  if (typeof e === 'string') {
    try {
      let errorRaw = JSON.parse(e)
      if (errorRaw.error) {
        if (errorRaw.error.details.length) {
          error = errorRaw.error.details[0]
        } else {
          error = {
            message: errorRaw.error.name
          }
        }
      } else {
        error = errorRaw
      }
    } catch (jsonError) {
      error = {
        message: e
      }
    }
  }
  return error
}

function alert (title, msg, confirm, cancel, callback) {
  if (typeof confirm === 'function') {
    callback = confirm
    confirm = null
  }
  if (typeof cancel === 'function') {
    callback = cancel
    cancel = null
  }
  if (isPC()) {
    MessageBox.alert(msg, title, {
      confirmButtonText: confirm || this.$t('common.OK'),
      cancelButtonText: cancel,
      callback: callback,
      distinguishCancelAndClose: true,
      showCancelButton: cancel
    })
  } else {
    MbMessageBox.alert(msg, title, {
      confirmButtonText: confirm || this.$t('common.OK'),
      cancelButtonText: cancel,
      callback: callback,
      distinguishCancelAndClose: true,
      showCancelButton: cancel
    })
  }
}
