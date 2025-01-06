import { getCookiesString, parseCookie } from "@solid-primitives/cookies";
import { useParams } from "@solidjs/router";
import { useNavigate } from "@solidjs/router";
import {
	For,
	createEffect,
	createMemo,
	createSignal,
	on,
	onMount,
} from "solid-js";
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
	const [
		store,
		{
			setActiveRoad,
			setRoad,
			resetFulfillmentNeeded,
			allowCookies,
			watchRoadChanges,
			setRetrieved,
			getRoadKeys,
		},
	] = useCourseDataContext();
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

	const activeRoad = createMemo(() => store.activeRoad);
	const addingFromCard = createMemo(() => store.addingFromCard);
	const cookiesAllowed = createMemo(() => store.cookiesAllowed);
	const roads = createMemo(() => store.roads);

	createEffect(
		on(activeRoad, (newRoad) => {
			if (
				store.unretrieved.indexOf(newRoad) >= 0 &&
				!authComponentRef?.gettingUserData
			) {
				authComponentRef?.retrieveRoad(newRoad).then(() => {
					setRetrieved(newRoad);
				});
			} else if (newRoad !== "") {
				// TODO: IMPLEMENT
				// updateFulfillment(store.fulfillmentNeeded);
			}
			// If just loaded, store isn't loaded yet
			// and so we can't overwrite the router just yet
			if (newRoad !== "" && !justLoaded()) {
				navigate(`/road/${newRoad}`);
			}
			setJustLoaded(false);
		}),
	);

	createEffect(
		on(roads, () => {
			setJustLoaded(false);
			if (cookiesAllowed() === undefined) {
				allowCookies();
			}
			if (activeRoad() !== "") {
				// TODO: IMPLEMENT
				// updateFulfillment(store.fulfillmentNeeded);
			}
			resetFulfillmentNeeded();

			if (!store.ignoreRoadChanges) {
				authComponentRef?.save(activeRoad());
			} else {
				watchRoadChanges();
			}
		}),
	);

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

	const [roadKeys, setRoadKeys] = createSignal(["$defaultroad$"] as string[]);
	createEffect(() => {
		setRoadKeys(getRoadKeys());
	});

	const conflict = () => {
		// TODO: IMPLEMENT
	};

	const resolveConflict = () => {
		// TODO: IMPLEMENT
	};

	return (
		<>
			<Flex>
				<SidebarContainer class={styles.aside}>
					<About />
					<ThemeToggler />
				</SidebarContainer>
				<main class={styles.main}>
					<Tabs.Root
						lazyMount
						unmountOnExit
						value={activeRoad()}
						onValueChange={(e) => setActiveRoad(e.value)}
					>
						<NavbarContainer>
							<Flex flexDirection="row" justifyContent="space-between">
								<ImportExport addRoad={addRoad} />
								<Auth
									justLoaded={justLoaded()}
									conflictInfo={conflictInfo()}
									conflict={conflict}
									resolveConflict={resolveConflict}
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
									roadKeys={roadKeys()}
								/>
							</Flex>
						</NavbarContainer>
						<For each={roadKeys()} fallback={null}>
							{(roadId) => (
								<Tabs.Content pt={0} px={2} value={roadId}>
									<Road
										selectedSubjects={roads()[roadId].contents.selectedSubjects}
										roadID={roadId}
										addingFromCard={addingFromCard() && activeRoad() === roadId}
										dragSemesterNum={
											activeRoad() === roadId ? dragSemesterNum() : -1
										}
										changeYear={(e) => authComponentRef?.changeSemester(e)}
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
