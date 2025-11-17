/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppError } from '../utils/AppError.js';

function jsonResponse(status: number, body: object) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function handleError(set: any, error: unknown) {
  let response;
  let statusCode;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    set.status = statusCode;
    response = jsonResponse(statusCode, {
      errorMessages: error.errorMessages,
      statusCode,
    });

    console.error('---------------------AppError---------------------');
    console.error(`Status: ${statusCode}`);
    console.error(`Messages: ${error.errorMessages.join(', ')}`);
    console.error(`Stack: ${error.stack ?? 'No stack trace available'}`);
    console.error('--------------------------------------------------');
    return response;
  }

  statusCode = typeof set.status === 'number' && set.status >= 400 ? set.status : 500;
  set.status = statusCode;
  response = jsonResponse(statusCode, {
    errorMessages: ['An unexpected error occurred'],
    statusCode,
  });

  console.error('------------------Unexpected Error------------------');
  console.error(`Status: ${statusCode}`);
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  console.error(`Stack: ${error instanceof Error ? error.stack : 'No stack trace available'}`);
  console.error('----------------------------------------------------');
  return response;
}
