"use strict";

export { setCustomHandler, ErrorHandler };

type ErrorHandler = (event: ErrorEvent) => void;

let CustomWindowErrorHandler: ErrorHandler,
	CustomPromiseRejectionHandler: (reason: string) => void;

function setCustomHandler(
	which: "error" | "unhandledrejection",
	handler: ErrorHandler | ((arg: string) => void)
): void {
	if (which == "error")
		CustomWindowErrorHandler = handler as ErrorHandler;
	else
		CustomPromiseRejectionHandler = handler as (arg: string) => void;
}

window.addEventListener('error', (event: ErrorEvent) => {
	// Notify about the error
	if (CustomWindowErrorHandler)
		CustomWindowErrorHandler(event);
	else {
		console.error('Global Error Caught:', {
			message: event.message,
			source: event.filename,
			lineno: event.lineno,
			colno: event.colno,
			error: event.error
		});
		// Optionally, display a user-friendly notification
		alert('An unexpected error occurred. Please try again later.');
		// Prevent the default handling
		event.preventDefault();
	}
});

window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
	// Notify about the unhandled rejection
	if (CustomPromiseRejectionHandler)
		CustomPromiseRejectionHandler(event.reason);
	else {
		console.error('Unhandled Promise Rejection:', {
			reason: event.reason
		});
		// Optionally, display a user-friendly notification
		alert('An unexpected error occurred. Please try again later.');
		// Prevent the default handling
		event.preventDefault();
	}
});


