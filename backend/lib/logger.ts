/**
 * Centralized logging for backend. Use LOG_LEVEL env var: DEBUG | INFO | WARN | ERROR
 * Default: INFO
 */
type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

const LEVELS: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL?.toUpperCase() as LogLevel) || "INFO";
const levelNum = LEVELS[currentLevel] ?? LEVELS.INFO;

function formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
  const ts = new Date().toISOString();
  const ctxStr = context ? ` ${JSON.stringify(context)}` : "";
  return `[${ts}] [${level}] ${message}${ctxStr}`;
}

function shouldLog(level: LogLevel): boolean {
  return (LEVELS[level] ?? 0) >= levelNum;
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>): void {
    if (shouldLog("DEBUG")) {
      console.log(formatMessage("DEBUG", message, context));
    }
  },

  info(message: string, context?: Record<string, unknown>): void {
    if (shouldLog("INFO")) {
      console.log(formatMessage("INFO", message, context));
    }
  },

  warn(message: string, context?: Record<string, unknown>): void {
    if (shouldLog("WARN")) {
      console.warn(formatMessage("WARN", message, context));
    }
  },

  error(message: string, err?: unknown, context?: Record<string, unknown>): void {
    if (shouldLog("ERROR")) {
      const fullContext = { ...context };
      if (err instanceof Error) {
        fullContext.error = err.message;
        fullContext.stack = err.stack;
      } else if (err != null) {
        fullContext.error = String(err);
      }
      console.error(formatMessage("ERROR", message, fullContext));
    }
  },
};
