export const toolbar = {
    toolbarHeight : Platform.OS === 'ios' ? 64 : 56,
    toolbarBtnColor : Platform.OS === 'ios' ? '#007aff' : '#fff',
    toolbarDefaultBg : Platform.OS === 'ios' ? '#F8F8F8' : '#3F51B5'
}

export const title = {

    titleFontfamily : Platform.OS === 'ios' ? 'System' : 'Roboto_medium',
    titleFontSize : Platform.OS === 'ios'  ? 17 : 19,
    subTitleFontSize : Platform.OS === 'ios' ? 11 : 14,
    subtitleColor : Platform.OS === 'ios' ? '#8e8e93' : '#FFF',
    titleFontColor : Platform.OS === 'ios' ? '#000' : '#FFF'
}
