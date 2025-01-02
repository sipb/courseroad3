export const flatten = <T>(array: T[]) => {
	return ([] as T[]).concat.apply([], array);
};
