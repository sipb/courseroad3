import type {
	SelectedSubjects,
	SimplifiedSelectedSubjects,
} from "~/context/types";

export const getSimpleSelectedSubjects = (
	selectedSubjects: SelectedSubjects[],
) => {
	const simpless: SimplifiedSelectedSubjects = Array.from(Array(16), () => []);
	for (let i = 0; i < selectedSubjects.length; i++) {
		const s = selectedSubjects[i];
		if (s.semester === undefined || s.semester < 0) {
			s.semester = 0;
		}
		simpless[s.semester].push(s);
	}
	return simpless;
};
