export const transDate = (dateString) => {
  const time = new Date(dateString)
  return `${(time.getMonth() + 1)}/${time.getDate()} ${time.getHours()}:${time.getMinutes()}`
}

export const iterateTransDate = arrayObject => arrayObject.map((l) => {
  if (l.createdAt) l.createdAt = transDate(l.createdAt)
  if (l.updatedAt) l.updatedAt = transDate(l.updatedAt)
  return l
})
