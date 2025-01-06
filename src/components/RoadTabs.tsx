import {
	type Component,
	ErrorBoundary,
	For,
	Show,
	createEffect,
	createMemo,
	createSignal,
	on,
} from "solid-js";

import {
	CheckIcon,
	ChevronsUpDownIcon,
	PencilIcon,
	PlusIcon,
	XIcon,
} from "lucide-solid";
import { Stack } from "styled-system/jsx";
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import { Field } from "~/components/ui/field";
import { IconButton } from "~/components/ui/icon-button";
import { Select, createListCollection } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Tabs } from "~/components/ui/tabs";

import { useCourseDataContext } from "~/context/create";
import type { SimplifiedSelectedSubjects } from "~/context/types";

const RoadTabs: Component<{
	addRoad: (
		roadTitle: string,
		coursesOfStudy?: string[],
		simpless?: SimplifiedSelectedSubjects,
		progressOverrides?: Record<string, number>,
	) => void;
	deleteRoad: (roadName: string) => void;
	retrieve: (roadName: string) => void;
	roadKeys?: string[];
}> = (props) => {
	const [store, { setRoadName, setActiveRoad }] = useCourseDataContext();

	const [addDialog, setAddDialog] = createSignal(false);
	const [deleteDialog, setDeleteDialog] = createSignal(false);
	const [editDialog, setEditDialog] = createSignal(false);
	const [duplicateRoad, setDuplicateRoad] = createSignal(false);
	const [duplicateRoadSource, setDuplicateRoadSource] =
		createSignal("$defaultroad$");
	const [newRoadName, setNewRoadName] = createSignal("");

	const otherRoadHasName = (roadID: string, roadName: string) => {
		const otherRoadNames = props.roadKeys?.map((road) => {
			return road === roadID ? undefined : roads()?.[road]?.name.toLowerCase();
		});
		return (
			otherRoadNames && otherRoadNames.indexOf(roadName.toLowerCase()) >= 0
		);
	};

	const activeRoad = createMemo(() => store.activeRoad);
	const roads = createMemo(() => store.roads);
	const validRoadName = createMemo(
		() => !(otherRoadHasName("", newRoadName()) || newRoadName() === ""),
	);

	createEffect(
		on(
			() => store.unretrieved,
			() => {
				if (
					addDialog() === true &&
					store.unretrieved.indexOf(duplicateRoadSource()) === -1
				) {
					addRoadFromDuplicate();
				}
			},
		),
	);

	const createRoad = () => {
		if (!duplicateRoad()) {
			props.addRoad(newRoadName());
			setAddDialog(false);
			setNewRoadName("");
		} else if (duplicateRoadSource() in roads()) {
			if (store.unretrieved.indexOf(duplicateRoadSource()) >= 0) {
				props.retrieve(duplicateRoadSource());
			} else {
				addRoadFromDuplicate();
			}
		}
	};

	const addRoadFromDuplicate = () => {
		props.addRoad(
			newRoadName(),
			roads()?.[duplicateRoadSource()].contents.coursesOfStudy.slice(0),
			roads()?.[duplicateRoadSource()].contents.selectedSubjects.map(
				(semester) => semester.slice(0),
			),
			Object.assign(
				{},
				roads()?.[duplicateRoadSource()].contents.progressOverrides,
			),
		);
		setAddDialog(false);
		setNewRoadName("");
	};

	const renameRoad = () => {
		setRoadName({ id: activeRoad(), name: newRoadName() });
		setEditDialog(false);
		setNewRoadName("");
	};

	const roadCollection = createMemo(() =>
		createListCollection({
			items:
				props.roadKeys?.map((road) => ({
					value: road,
					label: roads()?.[road]?.name,
				})) ?? [],
		}),
	);

	return (
		<>
			<Tabs.Root
				value={activeRoad()}
				onValueChange={(e) => setActiveRoad(e.value)}
			>
				<Tabs.List>
					<For each={props.roadKeys} fallback={null}>
						{(roadId) => (
							<Tabs.Trigger
								value={roadId}
								onClick={() => setActiveRoad(roadId)}
							>
								{roads()?.[roadId]?.name}
								<Show when={activeRoad() === roadId} fallback={null}>
									<IconButton
										variant="link"
										onClick={() => {
											setNewRoadName(roads()?.[roadId]?.name);
											setEditDialog(true);
										}}
									>
										<PencilIcon />
									</IconButton>
								</Show>
							</Tabs.Trigger>
						)}
					</For>
					<IconButton
						variant="ghost"
						aria-label="Add road"
						alignSelf="center"
						onClick={() => setAddDialog(true)}
					>
						<PlusIcon />
					</IconButton>
					<Tabs.Indicator />
				</Tabs.List>
			</Tabs.Root>

			<Dialog.Root
				lazyMount
				open={editDialog()}
				onOpenChange={(e) => setEditDialog(e.open)}
			>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Stack gap="8" p="6">
							<Dialog.Title>Edit Road Name</Dialog.Title>

							<Field.Root>
								<Field.Label>Road Name</Field.Label>
								<Field.Input
									placeholder="Road Name"
									value={newRoadName()}
									onInput={(e) => setNewRoadName(e.currentTarget.value)}
								/>
							</Field.Root>

							<Stack
								gap="3"
								direction="row"
								width="full"
								justifyContent="flex-end"
							>
								<Button
									colorPalette="red"
									onClick={() => {
										setEditDialog(false);
										setDeleteDialog(true);
									}}
								>
									Delete Road
								</Button>
								<Button
									onClick={renameRoad}
									disabled={otherRoadHasName(activeRoad(), newRoadName())}
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
			<Dialog.Root
				lazyMount
				open={deleteDialog()}
				onOpenChange={(e) => setDeleteDialog(e.open)}
			>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Stack gap="8" p="6">
							<Stack gap="1">
								<Dialog.Title>
									Permanently Delete {roads()?.[activeRoad()]?.name}?
								</Dialog.Title>
								<Dialog.Description>
									This action cannot be undone.
								</Dialog.Description>
							</Stack>

							<Stack
								gap="3"
								direction="row"
								width="full"
								justifyContent="flex-end"
							>
								<Button
									onClick={() => {
										setDeleteDialog(false);
										setEditDialog(true);
									}}
									variant="outline"
								>
									Cancel
								</Button>
								<Button
									colorPalette="red"
									onClick={() => {
										setDeleteDialog(false);
										props.deleteRoad(activeRoad());
										setNewRoadName("");
									}}
								>
									Confirm
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
			<Dialog.Root
				lazyMount
				open={addDialog()}
				onOpenChange={(e) => setAddDialog(e.open)}
			>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Stack gap="8" p="6">
							<Dialog.Title>Create Road</Dialog.Title>

							<Field.Root>
								<Field.Input
									placeholder="Road Name"
									autofocus
									value={newRoadName()}
									onInput={(e) => setNewRoadName(e.currentTarget.value)}
								/>
							</Field.Root>

							<Stack gap="3" direction="row" width="full">
								<Switch
									checked={duplicateRoad()}
									onCheckedChange={(e) => setDuplicateRoad(e.checked)}
								>
									Duplicate existing?
								</Switch>
								<Select.Root
									positioning={{ sameWidth: true }}
									disabled={!duplicateRoad()}
									width="2xs"
									value={[duplicateRoadSource()]}
									onValueChange={(e) => setDuplicateRoadSource(e.value[0])}
									collection={roadCollection()}
								>
									<Select.Control>
										<Select.Trigger>
											<Select.ValueText placeholder="Select a Road" />
											<ChevronsUpDownIcon />
										</Select.Trigger>
									</Select.Control>
									<Select.Positioner>
										<Select.Content>
											<Select.ItemGroup>
												<For each={roadCollection().items}>
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
							</Stack>

							<Stack
								gap="3"
								direction="row"
								width="full"
								justifyContent="flex-end"
							>
								<Button onClick={createRoad} disabled={!validRoadName()}>
									Create
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
		</>
	);
};

export default RoadTabs;
