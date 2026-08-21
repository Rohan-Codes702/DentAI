const levels = ['error', 'warn', 'info', 'debug'];

const timestamp = () => new Date().toISOString();

const log = (level, ...args) => {
  if (!levels.includes(level)) level = 'info';
  const prefix = `[${timestamp()}] [${level.toUpperCase()}]`;
  // eslint-disable-next-line no-console
  console[level === 'debug' ? 'log' : level](prefix, ...args);
};

module.exports = {
  error: (...args) => log('error', ...args),
  warn: (...args) => log('warn', ...args),
  info: (...args) => log('info', ...args),
  debug: (...args) => log('debug', ...args),
};
