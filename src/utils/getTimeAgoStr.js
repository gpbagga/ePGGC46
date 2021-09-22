export default (timestamp) => {
  let timeAgo

  const currentDate = new Date();
  const currentTimestamp = currentDate.getTime();
  
  const seconds = Math.floor((currentTimestamp - timestamp)/1000)
  
  if(seconds < 60){
    timeAgo = seconds === 1 ? '1 second ago': seconds + ' seconds ago'
  }
  else{
    const min = Math.floor(seconds/60) 
    if(min < 60){
      timeAgo = min === 1 ? '1 minute ago': min + ' minutes ago'
    }else{
      const hours = Math.floor(min/60)

      if(hours < 24 ){
        timeAgo = hours === 1 ? '1 hour ago': hours + ' hours ago'
      }else{
        const days = Math.floor(hours/24)
        timeAgo = days === 1 ? '1 day ago': days + ' days ago'
      }
    }
  }
  return timeAgo
}
