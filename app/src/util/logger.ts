import pino from 'pino';

/*
 * convert timestamp to local time (JST)
 */
function timestampToLocalTime(timestamp: number): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: 'Asia/Tokyo',
  })
    .format(date)
    .replace(/\//g, '-');
}

const logger = pino({
  level: 'info',
  timestamp: () => `,"time":"${timestampToLocalTime(Date.now())}"`,
  base: {},
});

export { logger };
