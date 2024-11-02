import { warn } from './error';

export function expToPath(exp: string, ctx: object) {
	const paths = exp.replace(/\[(\w+)\]/g, '.$1').split('.');
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
		warn(`${exp} is not a valid path`);
	}
}
