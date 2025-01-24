import fs from 'fs';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
};

class Logger {
  private static logFilePath = process.env.LOG_FILE_PATH || 'app.log'; // Use environment variable for log file

  private static logToFile(level: string, message: string): void {
    const logMessage = `[${new Date().toISOString()}] [${level.toUpperCase()}]: ${message}\n`;
    fs.appendFileSync(this.logFilePath, logMessage); // Appends logs to file
  }

  private static getColor(level: string): string {
    switch (level) {
      case 'info':
        return colors.green;
      case 'error':
        return colors.red;
      case 'warn':
        return colors.yellow;
      case 'debug':
        return colors.cyan;
      default:
        return colors.reset;
    }
  }

  private static formatMessage(messages: unknown[]): string {
    return messages
      .map((msg) => {
        if (msg instanceof Error) {
          return `${msg.message}\nStack: ${msg.stack}`;
        }
        if (typeof msg === 'object') {
          return JSON.stringify(msg, null, 2);
        }
        return String(msg);
      })
      .join(' ');
  }

  static log(level: string, ...messages: unknown[]): void {
    const color = this.getColor(level);
    const formattedMessage = this.formatMessage(messages);

    console.log(`${color}[${level.toUpperCase()}]: ${formattedMessage}${colors.reset}`);
    this.logToFile(level, formattedMessage);
  }

  static info(...messages: unknown[]): void {
    this.log('info', ...messages);
  }

  static error(...messages: unknown[]): void {
    this.log('error', ...messages);
  }

  static warn(...messages: unknown[]): void {
    this.log('warn', ...messages);
  }

  static debug(...messages: unknown[]): void {
    this.log('debug', ...messages);
  }
}

export default Logger;
