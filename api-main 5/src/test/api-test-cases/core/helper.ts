export const getDate = (date: Date): string => {
  const year = date.getFullYear();
  let month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  let day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  let hours = date.getUTCHours().toString();
  hours = hours.length > 1 ? hours : '0' + hours;
  let minutes = date.getUTCMinutes().toString();
  minutes = minutes.length > 1 ? minutes : '0' + minutes;
  let seconds = date.getUTCSeconds().toString();
  seconds = seconds.length > 1 ? seconds : '0' + seconds;
  const firstPart = year + '-' + month + '-' + day;
  const secondPart = 'T' + hours + ':' + minutes + ':' + seconds + 'Z';
  return firstPart + secondPart;
};
