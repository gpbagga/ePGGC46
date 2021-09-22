import Snackbar from 'react-native-snackbar'

export default showSnackbar = (text,textColor, backgroundColor, isLongDuration) => {
  Snackbar.show({
    text,
    textColor,
    backgroundColor,
    duration: isLongDuration && Snackbar.LENGTH_LONG
  })
}