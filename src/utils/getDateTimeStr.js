import {monthsShort} from './dateUtils'
export default (timestamp) => {
  const date = new Date(timestamp)
  return date.getDate() + ' ' + monthsShort[date.getMonth()] + ' ' + date.getFullYear()
  + ' ' + date.toLocaleTimeString()
}