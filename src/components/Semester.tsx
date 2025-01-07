import { type Component, Show, createMemo } from "solid-js";

import { ChevronDownIcon } from "lucide-solid";
import { Accordion } from "~/components/ui/accordion";

import { useCourseDataContext } from "~/context/create";
import type {
	SelectedSubjects,
	SimplifiedSelectedSubjects,
} from "~/context/types";

const Semester: Component<{
	selectedSubjects: SimplifiedSelectedSubjects;
	semesterSubjects: Array<SelectedSubjects>;
	index: number;
	roadID: string;
	isOpen: boolean;
}> = (props) => {
	const [store, { getUserYear }] = useCourseDataContext();

	const baseYear = createMemo(() => {
		const today = new Date(Date.now());
		const currentYear = today.getFullYear();
		const baseYear = today.getMonth() >= 5 ? currentYear + 1 : currentYear;
		return baseYear - getUserYear();
	});
	const semesterYearName = createMemo(() => {
		const yearNames = [
			"Freshman",
			"Sophomore",
			"Junior",
			"Senior",
			"Fifth Year",
		];
		if (props.index === 0) {
			return "";
		}
		const yearIndex = Math.floor((props.index - 1) / 3);
		return yearNames[yearIndex];
	});
	const semesterYear = createMemo(() => {
		return props.index === 0
			? ""
			: Math.floor((props.index - 2) / 3) + baseYear();
	});
	const semesterType = createMemo(() => {
		return props.index === 0
			? "Prior Credit"
			: ["Fall", "IAP", "Spring"][(props.index - 1) % 3];
	});

	return (
		<Show when={!store.hideIAP || semesterType() !== "IAP"}>
			<Accordion.Item value={props.index.toString()}>
				<Accordion.ItemTrigger>
					{semesterYearName()} {semesterType()}{" "}
					{props.index > 0 ? `'${semesterYear().toString().substring(2)}` : ""}
					<Accordion.ItemIndicator>
						<ChevronDownIcon />
					</Accordion.ItemIndicator>
				</Accordion.ItemTrigger>
				<Accordion.ItemContent>
					Showing semester {props.index} for {props.roadID}
				</Accordion.ItemContent>
			</Accordion.Item>
		</Show>
	);
};

export default Semester;
