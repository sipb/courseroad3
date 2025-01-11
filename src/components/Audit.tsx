import { type Component, For, Index, createMemo, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import { Stack } from "styled-system/jsx";

import { useCombobox, useTagsInput } from "@ark-ui/solid";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-solid";
import { Combobox, createListCollection } from "~/components/ui/combobox";
import { IconButton } from "~/components/ui/icon-button";
import { TagsInput } from "~/components/ui/tags-input";

import { useCourseDataContext } from "~/context/create";
import type {
	CourseRequirements,
	CourseRequirementsWithKey,
} from "~/context/types";

const Audit: Component<{
	reqList: CourseRequirementsWithKey[];
}> = (props) => {
	return (
		<Stack>
			<SelectProgram reqList={props.reqList} />
			<ReqTreeview />
		</Stack>
	);
};

const ReqTreeview: Component = (props) => {
	// TODO: IMPLMENT THIS
	return <></>;
};

const SelectProgram: Component<{
	reqList: CourseRequirementsWithKey[];
}> = (props) => {
	// TODO: this entire component is hacky af, try to clean it up later

	const [store, { removeReq, addReq }] = useCourseDataContext();
	const getCourses = createMemo(() => {
		const courses = props.reqList ?? [];
		courses.sort(sortCourses);

		const courseItems = courses.map((course) => ({
			value: course.key,
			label: course["medium-title"],
		}));
		return courseItems;
	});
	const [items, setItems] = createSignal(getCourses());

	const collection = createMemo(() =>
		createListCollection({
			items: getCourses(),
		}),
	);

	const handleChange = (e: Combobox.InputValueChangeDetails) => {
		const filtered = getCourses().filter((item) =>
			item.label.toLowerCase().includes(e.inputValue.toLowerCase()),
		);
		setItems(filtered.length > 0 ? filtered : getCourses());
	};

	const setSelected = (newReqs: string[]) => {
		// TODO: doesnt update components when changing activeRoad, need to fix.
		// if (currentReqs().length > newReqs.length) {
		// 	const diff = currentReqs().find((x) => !newReqs.includes(x));
		// 	if (diff) removeReq(diff);
		// } else if (currentReqs().length < newReqs.length) {
		// 	const newReq = newReqs[newReqs.length - 1];
		// 	addReq(newReq);
		// }

		tagsInput()?.setValue(newReqs);
		comboboxInput()?.setValue(newReqs);

		const currentReqs = store.roads[store.activeRoad].contents.coursesOfStudy;

		for (const req of newReqs) {
			if (!currentReqs.includes(req)) addReq(req);
		}

		for (const req of currentReqs) {
			if (!newReqs.includes(req)) removeReq(req);
		}
	};

	const currentReqs = createMemo(
		() => store.roads[store.activeRoad].contents.coursesOfStudy,
	);

	const tagsInput = useTagsInput({
		editable: false,
		value: currentReqs(),
		onValueChange: (e) => {
			comboboxInput()?.setValue(e.value);
			setSelected(e.value);
		},
	});
	const comboboxInput = useCombobox({
		onInputValueChange: handleChange,
		collection: collection(),
		inputBehavior: "autohighlight",
		value: currentReqs(),
		onValueChange: (e) => {
			tagsInput()?.setValue(e.value);
			tagsInput()?.clearInputValue();
			setSelected(e.value);
		},
		openOnClick: true,
		multiple: true,
	});

	return (
		<Combobox.RootProvider value={comboboxInput}>
			{/* @ts-expect-error: it works i swear */}
			<TagsInput.RootProvider value={tagsInput}>
				<Combobox.Label>Your Programs</Combobox.Label>

				<Combobox.Control
					asChild={(controlProps) => (
						<TagsInput.Control {...controlProps}>
							<Index each={tagsInput().value}>
								{(value, index) => (
									<TagsInput.Item index={index} value={value()}>
										<TagsInput.ItemPreview minHeight="fit-content">
											<TagsInput.ItemText>
												{
													getCourses().find((elem) => elem.value === value())
														?.label
												}
											</TagsInput.ItemText>
											<TagsInput.ItemInput />
											<TagsInput.ItemDeleteTrigger
												asChild={(triggerProps) => (
													<IconButton
														variant="link"
														size="xs"
														{...triggerProps()}
													>
														<XIcon />
													</IconButton>
												)}
											/>
											<TagsInput.ItemInput />
											<TagsInput.HiddenInput />
										</TagsInput.ItemPreview>
									</TagsInput.Item>
								)}
							</Index>

							<TagsInput.Input
								placeholder={
									comboboxInput().hasSelectedItems
										? undefined
										: "Click to add a major"
								}
								asChild={(inputProps) => <Combobox.Input {...inputProps()} />}
							/>
							<Combobox.Trigger
								asChild={(triggerProps) => (
									<IconButton
										variant="link"
										aria-label="open"
										size="xs"
										{...triggerProps()}
									>
										<ChevronsUpDownIcon />
									</IconButton>
								)}
							/>
						</TagsInput.Control>
					)}
				/>
				<Portal>
					<Combobox.Positioner>
						<Combobox.Content maxH="md">
							<Combobox.ItemGroup overflowY="auto">
								<For
									each={items()}
									fallback={
										<Combobox.Item item={null}>
											<Combobox.ItemText>No results found</Combobox.ItemText>
										</Combobox.Item>
									}
								>
									{(item) => (
										<Combobox.Item item={item} minH="fit-content">
											<Combobox.ItemText>{item.label}</Combobox.ItemText>
											<Combobox.ItemIndicator>
												<CheckIcon />
											</Combobox.ItemIndicator>
										</Combobox.Item>
									)}
								</For>
							</Combobox.ItemGroup>
						</Combobox.Content>
					</Combobox.Positioner>
				</Portal>
			</TagsInput.RootProvider>
		</Combobox.RootProvider>
	);
};

const sortCourses = (c1: CourseRequirements, c2: CourseRequirements) => {
	const sortKey = "medium-title" as const;

	const a = c1[sortKey].toLowerCase();
	const b = c2[sortKey].toLowerCase();

	// same type of program
	if (
		(a.includes("major") && b.includes("major")) ||
		(a.includes("minor") && b.includes("minor"))
	) {
		// get course numbers
		let n1 = a.split(" ")[0].split("-")[0];
		let n2 = b.split(" ")[0].split("-")[0];

		n1 =
			Number.isNaN(Number.parseInt(n1)) &&
			!Number.isNaN(Number.parseInt(n1.slice(0, -1)))
				? n1.slice(0, -1)
				: n1;
		n2 =
			Number.isNaN(Number.parseInt(n2)) &&
			!Number.isNaN(Number.parseInt(n2.slice(0, -1)))
				? n2.slice(0, -1)
				: n2;

		if (n1 === n2) return a.localeCompare(b);

		return (!Number.isNaN(Number.parseInt(n1)) &&
			!Number.isNaN(Number.parseInt(n2))) ||
			(Number.isNaN(Number.parseInt(n1)) && Number.isNaN(Number.parseInt(n2)))
			? // @ts-expect-error the original function returned n1 - n2 which should be NaN?? idk why this works but oh well
				n1 - n2
			: !Number.isNaN(Number.parseInt(n1))
				? -1
				: 1;
	}

	if (a.includes("major") && b.includes("minor")) return -1;
	if (b.includes("major") && a.includes("minor")) return 1;
	if (a.includes("major") || a.includes("minor")) return -1;
	if (b.includes("major") || b.includes("minor")) return 1;
	return a.localeCompare(b);
};

export default Audit;
