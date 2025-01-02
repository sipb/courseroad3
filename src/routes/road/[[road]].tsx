import { getCookiesString, parseCookie } from "@solid-primitives/cookies";
import { useParams } from "@solidjs/router";
import { useNavigate } from "@solidjs/router";
import { For, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";

import { useCourseDataContext } from "~/context/create";
import type { SimplifiedSelectedSubjects } from "~/context/types";

import { Flex } from "styled-system/jsx";
import About from "~/components/About";
import Auth, { type AuthRef } from "~/components/Auth";
import ImportExport from "~/components/ImportExport";
import Road from "~/components/Road";
import RoadTabs from "~/components/RoadTabs";
import ThemeToggler from "~/components/ThemeToggler";
import NavbarContainer from "~/components/layout/NavbarContainer";
import SidebarContainer from "~/components/layout/SidebarContainer";
import { recipe as layoutRecipe } from "~/components/layout/layout.recipe";
import { Input } from "~/components/ui/input";
import { Tabs } from "~/components/ui/tabs";

const styles = layoutRecipe();

export default function RoadPage() {
	const params = useParams();
	const [store, { setActiveRoad, setRoad, resetFulfillmentNeeded }] =
		useCourseDataContext();
	const cookiesString = getCookiesString();
	const navigate = useNavigate();

	const [reqTrees, setReqStrees] = createStore({});
	const [reqList, setReqList] = createStore([]);
	const [dragSemesterNum, setDragSemesterNum] = createSignal(-1);
	const [justLoaded, setJustLoaded] = createSignal(true);
	const [conflictDialog, setConflictDialog] = createSignal(false);
	const [conflictInfo, setConflictInfo] = createSignal(undefined);
	const [searchInput, setSearchInput] = createSignal("");
	const [dismissedCookies, setDismissedCookies] = createSignal(false);
	const [searchOpen, setSearchOpen] = createSignal(false);

	let authComponentRef: AuthRef | undefined;

	const setActiveRoadParam = () => {
		const roadRequested = params.road;
		if (roadRequested && roadRequested in store.roads) {
			setActiveRoad(roadRequested);
			return true;
		}

		if (!parseCookie(cookiesString, "accessInfo")) {
			const defaultRoad = store.activeRoad;
			navigate(`/road/${defaultRoad}`, { replace: true });
		}
		return false;
	};

	onMount(() => {
		setActiveRoadParam();
	});

	const addRoad = (
		roadName: string,
		cos = ["girs"],
		ss: SimplifiedSelectedSubjects = Array.from(Array(16), () => []),
		overrides: Record<string, number> = {},
	) => {
		const tempRoadID = `$${authComponentRef?.newRoads.length}$`;
		const newContents = {
			coursesOfStudy: cos,
			selectedSubjects: ss,
			progressOverrides: overrides,
			progressAssertions: {},
		};

		const newRoad = {
			downloaded: new Date().toISOString(),
			changed: new Date().toISOString(),
			name: roadName,
			agent: "",
			contents: newContents,
		};
		setRoad({
			id: tempRoadID,
			road: newRoad,
			ignoreSet: false,
		});
		resetFulfillmentNeeded();
		setActiveRoad(tempRoadID);
		authComponentRef?.setNewRoads([...authComponentRef.newRoads, tempRoadID]);
	};

	return (
		<>
			<Flex>
				<SidebarContainer class={styles.aside}>
					<About />
					<ThemeToggler />
				</SidebarContainer>
				<main class={styles.main}>
					<NavbarContainer>
						<Flex flexDirection="row" justifyContent="space-between">
							<ImportExport addRoad={addRoad} />
							<Auth
								justLoaded={justLoaded()}
								conflictInfo={conflictInfo()}
								ref={authComponentRef}
							/>
							<div>
								<Input placeholder="Add classes" width={"30ch"} />
							</div>
						</Flex>
						<Flex flexDirection="row" justifyContent="space-between">
							<RoadTabs
								addRoad={addRoad}
								deleteRoad={(e) => authComponentRef?.deleteRoad(e)}
								retrieve={(e) => authComponentRef?.retrieveRoad(e)}
							/>
						</Flex>
					</NavbarContainer>
					<Tabs.Root value={store.activeRoad}>
						<For each={Object.keys(store.roads)} fallback={null}>
							{(roadId) => (
								<Tabs.Content pt={0} value={roadId}>
									<Road
										selectedSubjects={
											store.roads[roadId].contents.selectedSubjects
										}
										roadID={roadId}
										addingFromCard={
											store.addingFromCard && store.activeRoad === roadId
										}
										dragSemesterNum={
											store.activeRoad === roadId ? dragSemesterNum() : -1
										}
									/>
								</Tabs.Content>
							)}
						</For>
					</Tabs.Root>
				</main>
			</Flex>
		</>
	);
}
