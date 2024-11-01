import { format } from 'date-fns'

export const formatDate = (date: string | number | Date | null | undefined): string => {
  if (!date) return 'N/A'
  return format(new Date(date), 'PPp')
}