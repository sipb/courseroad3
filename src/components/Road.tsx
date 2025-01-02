import type { Component } from "solid-js";
import { For, createSignal } from "solid-js";

import { ChevronDownIcon } from "lucide-solid";
import { Accordion } from "~/components/ui/accordion";

import type { SimplifiedSelectedSubjects } from "~/context/types";

const Road: Component<{
	selectedSubjects: Array<SimplifiedSelectedSubjects[0]>;
	roadID: string;
	addingFromCard: boolean;
	dragSemesterNum: number;
}> = (props) => {
	const defaultOpen = [
		false,
		true,
		false,
		true,
		true,
		false,
		true,
		true,
		false,
		true,
		true,
		false,
		true,
	];

	const defaultOpenValues = defaultOpen
		.reduce(
			(out, bool, index) => (bool ? out.concat(index) : out),
			[] as number[],
		)
		.map((index) => index.toString());
	const numSemesters = 16;

	const [visibleList, setVisibleList] = createSignal(
		(numSemesters >= 13
			? defaultOpen.concat([true, false, true])
			: defaultOpen
		).reduce(
			(out, bool, index) => (bool ? out.concat(index) : out),
			[] as number[],
		),
	);
	const [openRoadSettings, setOpenRoadSettings] = createSignal(false);
	const [numSems, setNumSems] = createSignal(numSemesters);

	return (
		<Accordion.Root multiple defaultValue={defaultOpenValues}>
			<For each={[...Array(numSems()).keys()]}>
				{(index) => (
					<Accordion.Item value={index.toString()}>
						<Accordion.ItemTrigger>
							{index}
							<Accordion.ItemIndicator>
								<ChevronDownIcon />
							</Accordion.ItemIndicator>
						</Accordion.ItemTrigger>
						<Accordion.ItemContent>
							Classes go here for semester {index} in road {props.roadID}
						</Accordion.ItemContent>
					</Accordion.Item>
				)}
			</For>
		</Accordion.Root>
	);
};

export default Road;
