/**
 * Server-side Logger using Pino
 *
 * Best Practices:
 * - Use structured logging (JSON format)
 * - Log with appropriate levels
 * - Include contextual information
 * - Never log sensitive data (passwords, tokens, PII)
 * - Use child loggers for request tracing
 */

import type { Logger as PinoLogger } from "pino"
import pino from "pino"

// Define log levels
export enum LogLevel {
	FATAL = "fatal",
	ERROR = "error",
	WARN = "warn",
	INFO = "info",
	DEBUG = "debug",
	TRACE = "trace",
}

// Sensitive fields to redact
const REDACT_FIELDS = [
	"password",
	"token",
	"accessToken",
	"refreshToken",
	"apiKey",
	"secret",
	"authorization",
	"cookie",
	"*.password",
	"*.token",
	"*.accessToken",
	"*.secret",
	"req.headers.authorization",
	"req.headers.cookie",
]

/**
 * Create the base logger instance
 */
const createLogger = (): PinoLogger => {
	const isDevelopment = process.env.NODE_ENV === "development"
	const isTest = process.env.NODE_ENV === "test"

	// In test environment, use minimal logging
	if (isTest) {
		return pino({
			level: process.env.LOG_LEVEL || "silent",
		})
	}

	return pino({
		level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),

		// Redact sensitive information
		redact: {
			paths: REDACT_FIELDS,
			censor: "[REDACTED]",
		},

		// Format timestamps
		timestamp: () => `,"time":"${new Date().toISOString()}"`,

		// Pretty print in development
		...(isDevelopment && {
			transport: {
				target: "pino-pretty",
				options: {
					colorize: true,
					translateTime: "yyyy-mm-dd HH:MM:ss.l",
					ignore: "pid,hostname",
					singleLine: false,
					messageFormat: "{levelLabel} - {msg}",
				},
			},
		}),

		// Base properties included in every log
		base: {
			env: process.env.NODE_ENV,
			...(process.env.VERCEL && {
				vercel: true,
				region: process.env.VERCEL_REGION,
			}),
		},

		// Customize serializers
		serializers: {
			req: (req) => ({
				id: req.id,
				method: req.method,
				url: req.url,
				// Don't log full headers to avoid sensitive data
				userAgent: req.headers?.["user-agent"],
			}),
			res: (res) => ({
				statusCode: res.statusCode,
			}),
			err: pino.stdSerializers.err,
		},
	})
}

/**
 * Main logger instance
 */
export const logger = createLogger()

/**
 * Create a child logger with additional context
 *
 * @example
 * const userLogger = createChildLogger({ userId: '123' });
 * userLogger.info('User action performed');
 */
export const createChildLogger = (
	bindings: Record<string, unknown>,
): PinoLogger => {
	return logger.child(bindings)
}

/**
 * Create a logger for a specific module/feature
 *
 * @example
 * const authLogger = createModuleLogger('auth');
 * authLogger.info('Login attempt');
 */
export const createModuleLogger = (module: string): PinoLogger => {
	return logger.child({ module })
}

/**
 * Log an error with full stack trace and context
 *
 * @example
 * logError(new Error('Database connection failed'), {
 *   operation: 'getUserById',
 *   userId: '123'
 * });
 */
export const logError = (
	error: Error | unknown,
	context?: Record<string, unknown>,
): void => {
	if (error instanceof Error) {
		logger.error({ err: error, ...context }, error.message)
	} else {
		logger.error({ error, ...context }, "An unknown error occurred")
	}
}

/**
 * Log HTTP request with timing
 *
 * @example
 * logRequest('POST', '/api/users', 201, 150);
 */
export const logRequest = (
	method: string,
	url: string,
	statusCode: number,
	duration?: number,
): void => {
	const level =
		statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info"

	logger[level]({
		type: "http",
		method,
		url,
		statusCode,
		...(duration && { duration: `${duration}ms` }),
	})
}

/**
 * Log database operations
 *
 * @example
 * logDatabaseOperation('User', 'findUnique', 45);
 */
export const logDatabaseOperation = (
	model: string,
	operation: string,
	duration?: number,
): void => {
	logger.debug({
		type: "database",
		model,
		operation,
		...(duration && { duration: `${duration}ms` }),
	})
}

/**
 * Log performance metrics
 *
 * @example
 * logPerformance('api.getUserById', 125);
 */
export const logPerformance = (
	operation: string,
	duration: number,
	metadata?: Record<string, unknown>,
): void => {
	logger.info({
		type: "performance",
		operation,
		duration: `${duration}ms`,
		...metadata,
	})
}

/**
 * Log security events
 *
 * @example
 * logSecurityEvent('failed_login', { username: 'user@example.com', ip: '1.2.3.4' });
 */
export const logSecurityEvent = (
	event: string,
	details: Record<string, unknown>,
): void => {
	logger.warn({
		type: "security",
		event,
		...details,
	})
}

// Export type for use in other files
export type Logger = PinoLogger
