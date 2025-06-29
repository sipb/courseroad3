import { createServerCookie } from "@solid-primitives/cookies";
import { BanIcon } from "lucide-solid";
import type { Component } from "solid-js";
import { createSignal, Index, Show } from "solid-js";
import { Float } from "styled-system/jsx";
import Semester from "~/components/Semester";
import { Accordion } from "~/components/ui/accordion";
import { IconButton } from "~/components/ui/icon-button";
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

	return (
		<Accordion.Root
			value={visibleList()}
			onValueChange={(e) => setVisibleList(e.value)}
			multiple
		>
			<Index each={[...Array(numSems()).keys()]}>
				{(index) => (
					<Semester
						index={index()}
						selectedSubjects={props.selectedSubjects}
						semesterSubjects={props.selectedSubjects[index()]}
						roadID={props.roadID}
						isOpen={visibleList().includes(index().toString())}
					/>
				)}
			</Index>
			<Show when={props.addingFromCard}>
				<Float placement="bottom-end" offset="8">
					<IconButton>
						<BanIcon />
					</IconButton>
				</Float>
			</Show>
		</Accordion.Root>
	);
};

export default Road;
