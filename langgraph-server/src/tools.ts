export const log = (level: 'info' | 'warn' | 'error', message: string) => {
  const prefix = `[${level.toUpperCase()}]`
  if (level === 'info') console.log(prefix, message)
  else if (level === 'warn') console.warn(prefix, message)
  else console.error(prefix, message)
}