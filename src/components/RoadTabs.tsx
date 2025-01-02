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
	const [store] = useCourseDataContext();

	const [addDialog, setAddDialog] = createSignal(false);
	const [deleteDialog, setDeleteDialog] = createSignal(false);
	const [editDialog, setEditDialog] = createSignal(false);
	const [duplicateRoad, setDuplicateRoad] = createSignal(false);
	const [duplicateRoadSource, setDuplicateRoadSource] =
		createSignal("$defaultroad$");
	const [newRoadName, setNewRoadName] = createSignal("");
	const [tabRoad, setTabRoad] = createSignal(store.activeRoad);

	const activeRoad = createMemo(() => store.activeRoad);
	const roads = createMemo(() => store.roads);

	const otherRoadHasName = (roadID: string, roadName: string) => {
		const otherRoadNames = Object.keys(roads()).map((road) => {
			return road === roadID ? undefined : roads()[road].name.toLowerCase();
		});
		return otherRoadNames.indexOf(roadName.toLowerCase()) >= 0;
	};

	const validRoadName = createMemo(
		() => !(otherRoadHasName("", newRoadName()) || newRoadName() === ""),
	);

	createEffect(() => {
		setTabRoad(activeRoad());
	});

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
			value={tabRoad()}
			onValueChange={(e) => setTabRoad(e.value)}
			{...props}
		>
			<Tabs.List>
				<For each={Object.keys(roads())}>
					{(roadId) => (
						<Tabs.Trigger value={roadId}>{roads()[roadId].name}</Tabs.Trigger>
					)}
				</For>
				<Tabs.Indicator />
			</Tabs.List>
		</Tabs.Root>
	);
};

export default RoadTabs;
