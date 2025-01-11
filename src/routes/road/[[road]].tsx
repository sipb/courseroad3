import { getCookiesString, parseCookie } from "@solid-primitives/cookies";
import { useParams } from "@solidjs/router";
import { useNavigate } from "@solidjs/router";
import {
	For,
	createEffect,
	createMemo,
	createResource,
	createSignal,
	on,
	onMount,
} from "solid-js";
import { createStore } from "solid-js/store";

import { defaultState, useCourseDataContext } from "~/context/create";
import type {
	CourseRequirements,
	Reqs,
	SimplifiedSelectedSubjects,
} from "~/context/types";

import { css } from "styled-system/css";
import { Flex } from "styled-system/jsx";
import Auth, { type AuthRef } from "~/components/Auth";
import BetaAlert from "~/components/BetaAlert";
import ImportExport from "~/components/ImportExport";
import Road from "~/components/Road";
import RoadTabs from "~/components/RoadTabs";
import NavbarContainer from "~/components/layout/NavbarContainer";
import Sidebar from "~/components/layout/Sidebar";
import SidebarContainer from "~/components/layout/SidebarContainer";
import SidebarDrawer from "~/components/layout/SidebarDrawer";
import { recipe as layoutRecipe } from "~/components/layout/layout.recipe";
import { Input } from "~/components/ui/input";
import { Tabs } from "~/components/ui/tabs";
import { flatten } from "~/lib/browserSupport";

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
			resetState,
			loadAllSubjects,
		},
	] = useCourseDataContext();
	const cookiesString = getCookiesString();
	const navigate = useNavigate();

	const [reqTrees, setReqTrees] = createStore({} as Record<string, Reqs>);
	const [dragSemesterNum, setDragSemesterNum] = createSignal(-1);
	const [justLoaded, setJustLoaded] = createSignal(true);
	const [conflictDialog, setConflictDialog] = createSignal(false);
	const [conflictInfo, setConflictInfo] = createSignal(undefined);
	const [searchInput, setSearchInput] = createSignal("");
	const [dismissedCookies, setDismissedCookies] = createSignal(false);
	const [searchOpen, setSearchOpen] = createSignal(false);
	const [isUpdatingFulfillment, setIsUpdatingFulfillment] = createSignal(false);

	let authComponentRef: AuthRef | undefined;

	const [reqList] = createResource(
		async () => {
			const response = await fetch(
				`${import.meta.env.VITE_FIREROAD_URL}/requirements/list_reqs/`,
			);
			const data = (await response.json()) as Record<
				string,
				CourseRequirements
			>;
			const dataWithKeys = Object.keys(data).map((key) => ({
				...data[key],
				key,
			}));
			return dataWithKeys.sort();
		},
		{ initialValue: [] },
	);

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
				!authComponentRef?.gettingUserData()
			) {
				authComponentRef?.retrieveRoad(newRoad).then(() => {
					setRetrieved(newRoad);
				});
			} else if (newRoad !== "") {
				updateFulfillment(store.fulfillmentNeeded);
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
				updateFulfillment(store.fulfillmentNeeded);
			}
			resetFulfillmentNeeded();

			if (!store.ignoreRoadChanges) {
				authComponentRef?.save(activeRoad());
			} else {
				watchRoadChanges();
			}
		}),
	);

	const updateFulfillment = (fulfillmentNeeded: string) => {
		if (!isUpdatingFulfillment() && fulfillmentNeeded !== "none") {
			setIsUpdatingFulfillment(true);

			const fulfillments =
				fulfillmentNeeded === "all"
					? roads()[activeRoad()].contents.coursesOfStudy
					: [fulfillmentNeeded];

			for (const req of fulfillments) {
				const alteredRoadContents = Object.assign(
					{},
					roads()[activeRoad()].contents,
				);

				alteredRoadContents.selectedSubjects = flatten(
					alteredRoadContents.selectedSubjects,
				);

				fetch(
					`${import.meta.env.VITE_FIREROAD_URL}/requirements/progress/${req}/`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(alteredRoadContents),
					},
				).then((response) =>
					response.json().then((data) => {
						setReqTrees(req, data);
					}),
				);
			}

			setIsUpdatingFulfillment(false);
		}
	};

	onMount(() => {
		if (defaultState.versionNumber !== store.versionNumber) {
			resetState();
		}

		setActiveRoadParam();

		updateFulfillment("all");

		// TODO: consider making this a resource instead of loaded on mount
		loadAllSubjects()
			.then(() => {
				console.log("Subjects were loaded successfully!");
			})
			.catch((e) => {
				console.log(`There was an error loading subjects: \n${e}`);
			});
	});

	const addRoad = (
		roadName: string,
		cos = ["girs"],
		ss: SimplifiedSelectedSubjects = Array.from(Array(16), () => []),
		overrides: Record<string, number> = {},
	) => {
		const tempRoadID = `$${authComponentRef?.newRoads().length}$`;
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
		authComponentRef?.setNewRoads([...authComponentRef.newRoads(), tempRoadID]);
	};

	// creatememo doesnt work for some reason...
	// I have a feeling its due to the following issue:
	// https://github.com/solidjs-community/solid-primitives/discussions/708
	const [roadKeys, setRoadKeys] = createSignal(["$defaultroad$"]);
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
				<SidebarContainer
					class={styles.sidebar}
					headerClass={styles.sidebarHeader}
					bodyClass={styles.sidebarBody}
					footerClass={styles.sidebarFooter}
				>
					<Sidebar
						changeYear={(e) => authComponentRef?.changeSemester(e)}
						reqList={reqList()}
					/>
				</SidebarContainer>
				<main class={styles.main}>
					<Tabs.Root
						lazyMount
						unmountOnExit
						value={activeRoad()}
						onValueChange={(e) => setActiveRoad(e.value)}
					>
						<NavbarContainer>
							<BetaAlert />
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
									<Input
										placeholder="Add classes"
										class={css({ width: { base: 32, md: 40, lg: 52 } })}
										me={2}
									/>
									<SidebarDrawer>
										<Sidebar
											changeYear={(e) => authComponentRef?.changeSemester(e)}
											reqList={reqList()}
										/>
									</SidebarDrawer>
								</div>
							</Flex>
							<RoadTabs
								addRoad={addRoad}
								deleteRoad={(e) => authComponentRef?.deleteRoad(e)}
								retrieve={(e) => authComponentRef?.retrieveRoad(e)}
								roadKeys={roadKeys()}
							/>
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
										// changeYear={(e) => authComponentRef?.changeSemester(e)}
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
