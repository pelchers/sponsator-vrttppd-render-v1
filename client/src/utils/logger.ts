type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const logger = {
  log: (message: string, level: LogLevel = 'info') => {
    // Log to browser console
    switch (level) {
      case 'info':
        console.info(`[CLIENT] ${message}`);
        break;
      case 'warn':
        console.warn(`[CLIENT] ${message}`);
        break;
      case 'error':
        console.error(`[CLIENT] ${message}`);
        break;
      case 'debug':
        console.debug(`[CLIENT] ${message}`);
        break;
    }

    // Also send to server for centralized logging
    fetch('http://localhost:4100/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, type: level }),
    }).catch(err => {
      console.error('Failed to send log to server:', err);
    });
  },
  
  info: (message: string) => logger.log(message, 'info'),
  warn: (message: string) => logger.log(message, 'warn'),
  error: (message: string) => logger.log(message, 'error'),
  debug: (message: string) => logger.log(message, 'debug'),
};

export default logger; 