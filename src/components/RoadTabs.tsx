import {
	type Component,
	For,
	createEffect,
	createMemo,
	createSignal,
} from "solid-js";

import { Tabs } from "~/components/ui/tabs";

import { useCourseDataContext } from "~/context/create";

const RoadTabs: Component = (props) => {
	const [store, { setActiveRoad }] = useCourseDataContext();

	const [addDialog, setAddDialog] = createSignal(false);
	const [deleteDialog, setDeleteDialog] = createSignal(false);
	const [editDialog, setEditDialog] = createSignal(false);
	const [duplicateRoad, setDuplicateRoad] = createSignal(false);
	const [duplicateRoadSource, setDuplicateRoadSource] =
		createSignal("$defaultroad$");
	const [newRoadName, setNewRoadName] = createSignal("");

	const otherRoadHasName = (roadID: string, roadName: string) => {
		const otherRoadNames = Object.keys(store.roads).map((road) => {
			return road === roadID ? undefined : store.roads[road].name.toLowerCase();
		});
		return otherRoadNames.indexOf(roadName.toLowerCase()) >= 0;
	};

	const validRoadName = createMemo(
		() => !(otherRoadHasName("", newRoadName()) || newRoadName() === ""),
	);

	createEffect(() => {
		if (
			addDialog() &&
			store.unretrieved.indexOf(duplicateRoadSource()) === -1
		) {
			// addRoadFromDuplicate();
		}
	});

	return (
		<Tabs.Root
			value={store.activeRoad}
			onValueChange={(e) => setActiveRoad(e.value)}
			{...props}
		>
			<Tabs.List>
				<For each={Object.keys(store.roads)}>
					{(roadId) => (
						<Tabs.Trigger value={roadId}>
							{store.roads[roadId].name}
						</Tabs.Trigger>
					)}
				</For>
				<Tabs.Indicator />
			</Tabs.List>
		</Tabs.Root>
	);
};

export default RoadTabs;
