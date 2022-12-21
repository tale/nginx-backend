import { createServer } from 'node:http'
import { type ServerResponse } from 'node:http'

declare global {
	const $html: string
}

/**
 * Sends a response to the client with the given data and content type
 * @param response The response object
 * @param data The data to send
 * @param contentType The content type of the data
 */
export function endSuccess(response: ServerResponse, data: string, contentType: string) {
	response.setHeader('Content-Type', contentType)
	response.end(data)
}

/**
 * Sends an error response to the client with the given error message
 * @param response The response object
 * @param error The error message to send
 */
export function endError(response: ServerResponse, error: string) {
	response.statusCode = 500
	response.end(JSON.stringify({
		error,
		date: new Date()
			.toISOString()
	}))
}

/**
 * Gets the error type based on the status code
 * @param statusCode T
 * @returns The error type
 */
function getErrorType(statusCode: string) {
	switch (statusCode) {
	case '400': {
		return {
			type: 'Bad Request',
			message: 'Oops! Something went wrong with your request. Please try again later.'
		}
	}

	case '401': {
		return {
			type: 'Unauthorized',
			message: 'Oops! You aren\'t authorized to access this URL'
		}
	}

	case '403': {
		return {
			type: 'Forbidden',
			message: 'Oops! You aren\'t authorized to access this URL'
		}
	}

	case '404': {
		return {
			type: 'Not Found',
			message: 'Oops! We couldn\'t find what you were looking for.'
		}
	}

	case '500': {
		return {
			type: 'Internal Server Error',
			message: 'Oops! Something went wrong on our end. Please try again later.'
		}
	}

	case '502': {
		return {
			type: 'Bad Gateway',
			message: 'Oops! Something went wrong on our end. Please try again later.'
		}
	}

	case '503': {
		return {
			type: 'Service Unavailable',
			message: 'Oops! The service you are trying to access is currently unavailable. Please try again later'
		}
	}

	case '504': {
		return {
			type: 'Gateway Timeout',
			message: 'Oops! The connection timed out on our end. Please try again later.'
		}
	}

	default: {
		return {
			type: 'Unexpected Error',
			message: 'Oops! Something most likely went wrong on our end. Please try again later.'
		}
	}
	}
}

const server = createServer()
server.on('request', (request, response) => {
	if (request.url === '/healthz') {
		response.end('OK')
		return
	}

	const statusCode = request.headers['x-code']?.toString()
	const accepts = request.headers['x-format']?.toString()
	const originalUri = request.headers['x-original-uri']?.toString()

	const namespace = request.headers['x-namespace']?.toString()
	const serviceName = request.headers['x-service-name']?.toString()
	const requestId = request.headers['x-request-id']?.toString()

	// Ignoring X-Ingress-Name & X-Service-Port
	if (!(statusCode && accepts && originalUri && namespace && serviceName && requestId)) {
		endError(response, 'Invalid request sent from Kubernetes NGINX Ingress Controller')
		return
	}

	console.log(`http: ${statusCode} ${originalUri} - ${requestId}#_${serviceName}@${namespace}`)

	const mimeType = accepts.split(';')[0]
	const { type, message } = getErrorType(statusCode)
	const date = new Date()

	if (mimeType.includes('application/json')) {
		const payload = JSON.stringify({
			error: `${statusCode} ${type}`,
			meta: {
				uri: originalUri,
				statusCode,
				k8sOrigin: `${requestId}#_${serviceName}@${namespace}`
			},
			date: date.toISOString()
		})

		endSuccess(response, payload, 'application/json')
		return
	}

	if (mimeType.includes('text/html')) {
		const payload = $html.trim()
			.replaceAll('{STATUS_CODE}', statusCode)
			.replaceAll('{ORIGINAL_URI}', originalUri)
			.replaceAll('{ERROR_CLASS_MESSAGE}', message)
			.replaceAll('{ERROR_TYPE}', type)
			.replaceAll('{REQUEST_ID}', requestId)
			.replaceAll('{ORIGINAL_URI}', originalUri)
			.replaceAll('{K8S_ORIGIN}', `${requestId}#_${serviceName}@${namespace}`)
			.replaceAll('{CURRENT_YEAR}', date.getUTCFullYear()
				.toString())

		endSuccess(response, payload, 'text/html')
		return
	}

	const payload = [
		`Error: ${statusCode} ${type}`,
		`Message: ${message}`,
		`Date: ${date.toISOString()}`,
		`Kubernetes Origin: ${requestId}#_${serviceName}@${namespace}`,
		`Original URI: ${originalUri}`
	].join('\n')

	endSuccess(response, payload, 'text/plain')
})

server.listen(8080)
console.log('http: listening on port 8080')
