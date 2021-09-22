import React  from 'react'
import {fileTypes_Extensions} from '../utils/FileTypeExtensions'

import {Icon} from 'native-base'

export default ({type}) => (
  fileTypes_Extensions[type] === '.pdf' ? (
    <Icon type ='FontAwesome5' name ='file-pdf' />
  ) : (
    fileTypes_Extensions[type] === '.doc' || fileTypes_Extensions[type] === '.docx'? (
      <Icon type ='MaterialCommunityIcons' name ='microsoft-word' />
    ) : (
      fileTypes_Extensions[type] === '.ppt' || fileTypes_Extensions[type] === '.pptx' ? (
        <Icon type ='MaterialCommunityIcons' name ='microsoft-powerpoint' />
      ) : (
        fileTypes_Extensions[type] === '.xls' || fileTypes_Extensions[type] === '.xlsx' ? (
          <Icon type ='MaterialCommunityIcons' name ='microsoft-excel' />
        ) : (
          <Icon type ='MaterialCommunityIcons' name ='file' />
        )
      )
    )
  )
) 