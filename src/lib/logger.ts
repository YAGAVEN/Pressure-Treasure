/**
 * Production-safe logger utility
 * Logs messages only in development mode
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    if (isDev) {
      console.error(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },

  // Always log errors in production too (but sanitized)
  production: {
    error: (message: string, error?: any) => {
      console.error(message);
      if (isDev && error) {
        console.error('Error details:', error);
      }
    }
  }
};

export default logger;
