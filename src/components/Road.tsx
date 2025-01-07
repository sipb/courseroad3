import { createServerCookie } from "@solid-primitives/cookies";
import type { Component } from "solid-js";
import { Index, Show, createSignal } from "solid-js";

import { useAccordion } from "@ark-ui/solid";
import { BanIcon } from "lucide-solid";
import Semester from "~/components/Semester";
import { Accordion } from "~/components/ui/accordion";
import { IconButton } from "~/components/ui/icon-button";

import { useCourseDataContext } from "~/context/create";
import type { SimplifiedSelectedSubjects } from "~/context/types";

const Road: Component<{
	selectedSubjects: Array<SimplifiedSelectedSubjects[0]>;
	roadID: string;
	addingFromCard: boolean;
	dragSemesterNum: number;
}> = (props) => {
	const defaultOpen = ["1", "3", "4", "6", "7", "9", "10", "12"];
	const numSemesters = 16;

	const [visibleList, setVisibleList] = createServerCookie(
		`visibleList${props.roadID}`,
		{
			deserialize: (str) =>
				str
					? str.split(" ")
					: numSemesters >= 13
						? defaultOpen.concat(["13", "15"])
						: defaultOpen,
			serialize: (val) =>
				val
					? val
							.map((s) => Number.parseInt(s, 10))
							.sort((a, b) => a - b)
							.join(" ")
					: "",
		},
	);

	const [numSems, setNumSems] = createSignal(numSemesters);

	const accordion = useAccordion({
		value: visibleList(),
		onValueChange: (e) => setVisibleList(e.value),
		multiple: true,
	});

	return (
		<Accordion.RootProvider lazyMount unmountOnExit value={accordion}>
			<Index each={[...Array(numSems()).keys()]}>
				{(item) => (
					<Semester
						index={item()}
						selectedSubjects={props.selectedSubjects}
						semesterSubjects={props.selectedSubjects[item()]}
						roadID={props.roadID}
						isOpen={visibleList().includes(`${item()}`)}
					/>
				)}
			</Index>
			<Show when={props.addingFromCard}>
				<IconButton display="fixed" bottom="2rem" right="2rem">
					<BanIcon />
				</IconButton>
			</Show>
		</Accordion.RootProvider>
	);
};

export default Road;
