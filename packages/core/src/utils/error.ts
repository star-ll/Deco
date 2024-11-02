export function warn(message: string) {
	if (process.env.NODE_ENV !== 'production') {
		console.error(new Error(message));
	}
}
