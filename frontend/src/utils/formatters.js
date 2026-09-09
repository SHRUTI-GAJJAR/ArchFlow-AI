export function formatDate(dateValue) {
  if (!dateValue) return 'No date'

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return dateValue

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatRelativeDate(dateValue) {
  if (!dateValue) return 'No recent activity'

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'No recent activity'

  const differenceInDays = Math.round((Date.now() - date.getTime()) / 86400000)
  if (differenceInDays === 0) return 'Today'
  if (differenceInDays === 1) return 'Yesterday'
  if (differenceInDays > 1 && differenceInDays < 7) return `${differenceInDays} days ago`

  return formatDate(dateValue)
}

export function getId(resource) {
  return resource?._id || resource?.id
}

export function capitalize(value) {
  if (!value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1)
}
