import { cookieStorage, makePersisted } from "@solid-primitives/storage";
import type { Component } from "solid-js";
import { For, Index, Show, createMemo, createSignal } from "solid-js";

import { useAccordion } from "@ark-ui/solid";
import {
	BanIcon,
	CheckIcon,
	ChevronDownIcon,
	ChevronsUpDownIcon,
	XIcon,
} from "lucide-solid";
import { Stack } from "styled-system/jsx";
import Semester from "~/components/Semester";
import { Accordion } from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import { IconButton } from "~/components/ui/icon-button";
import { Select, createListCollection } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";

import { useCourseDataContext } from "~/context/create";
import type { SimplifiedSelectedSubjects } from "~/context/types";

const Road: Component<{
	selectedSubjects: Array<SimplifiedSelectedSubjects[0]>;
	roadID: string;
	addingFromCard: boolean;
	dragSemesterNum: number;
	changeYear: (year: number) => void;
}> = (props) => {
	const [store, { getUserYear, setHideIAP }] = useCourseDataContext();

	const defaultOpen = ["1", "3", "4", "6", "7", "9", "10", "12"];
	const numSemesters = 16;

	const [visibleList, setVisibleList] = makePersisted(
		createSignal(
			numSemesters >= 13 ? defaultOpen.concat(["13", "15"]) : defaultOpen,
		),
		{
			storage: store.cookiesAllowed
				? cookieStorage.withOptions({ path: "/" })
				: undefined,
			name: `visibleList${props.roadID}`,
		},
	);
	const [openRoadSettings, setOpenRoadSettings] = createSignal(false);
	const [numSems, setNumSems] = createSignal(numSemesters);

	const year = createMemo(() => getUserYear());
	const hideIAP = createMemo(() => store.hideIAP);

	const accordion = useAccordion({
		value: visibleList(),
		onValueChange: (e) => setVisibleList(e.value),
		multiple: true,
	});
	const yearCollection = createListCollection({
		items: [
			{ value: "0", label: "First Year/Freshman" },
			{ value: "1", label: "Sophomore" },
			{ value: "2", label: "Junior" },
			{ value: "3", label: "Senior" },
			{ value: "4", label: "Super Senior" },
		],
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
						hideIap={hideIAP()}
						openRoadSettingsDialog={() => setOpenRoadSettings(true)}
					/>
				)}
			</Index>
			<Show when={props.addingFromCard}>
				<IconButton display="fixed" bottom="2rem" right="2rem">
					<BanIcon />
				</IconButton>
			</Show>
			<Dialog.Root
				lazyMount
				unmountOnExit
				open={openRoadSettings()}
				onOpenChange={(e) => setOpenRoadSettings(e.open)}
			>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Stack gap="8" p="6">
							<Dialog.Title>Road Settings</Dialog.Title>

							<Select.Root
								positioning={{ sameWidth: true }}
								width="2xs"
								collection={yearCollection}
								value={[`${year()}`]}
								onValueChange={(e) =>
									props.changeYear(Number.parseInt(e.value[0]))
								}
							>
								<Select.Label>I am a...</Select.Label>
								<Select.Control>
									<Select.Trigger>
										<Select.ValueText placeholder="Select a Year" />
										<ChevronsUpDownIcon />
									</Select.Trigger>
								</Select.Control>
								<Select.Positioner>
									<Select.Content>
										<Select.ItemGroup>
											<For each={yearCollection.items}>
												{(item) => (
													<Select.Item item={item}>
														<Select.ItemText>{item.label}</Select.ItemText>
														<Select.ItemIndicator>
															<CheckIcon />
														</Select.ItemIndicator>
													</Select.Item>
												)}
											</For>
										</Select.ItemGroup>
									</Select.Content>
								</Select.Positioner>
							</Select.Root>

							<Switch
								checked={hideIAP()}
								onCheckedChange={(e) => setHideIAP(e.checked)}
							>
								Hide IAP
							</Switch>

							<Stack
								gap="3"
								direction="row"
								width="full"
								justifyContent="flex-end"
							>
								<Button
									variant="outline"
									onClick={() => {
										setOpenRoadSettings(false);
									}}
								>
									Cancel
								</Button>
								<Button
									onClick={() => {
										props.changeYear(year());
										setOpenRoadSettings(false);
									}}
								>
									Submit
								</Button>
							</Stack>
						</Stack>
						<Dialog.CloseTrigger
							asChild={(closeTriggerProps) => (
								<IconButton
									{...closeTriggerProps()}
									aria-label="Close Dialog"
									variant="ghost"
									size="sm"
									position="absolute"
									top="2"
									right="2"
								>
									<XIcon />
								</IconButton>
							)}
						/>
					</Dialog.Content>
				</Dialog.Positioner>
			</Dialog.Root>
		</Accordion.RootProvider>
	);
};

export default Road;
