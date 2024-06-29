export function expToPath(exp: string, ctx: object) {
	const paths = exp.split('.');
	if (paths.length === 1) {
		return { ctx, property: paths[0] };
	}

	try {
		let prevObj = ctx;
		let key = '';
		paths.reduce((obj: { [T: string]: any }, curr: string) => {
			key = curr;
			prevObj = obj;
			return obj[curr];
		}, ctx);

		return { ctx: prevObj, property: key };
	} catch (err) {
		throw new Error(`${exp} is not a valid path`, { cause: err });
	}
}
