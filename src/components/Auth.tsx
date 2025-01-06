import { cookieStorage, makePersisted } from "@solid-primitives/storage";
import { useNavigate, useParams, useSearchParams } from "@solidjs/router";
import {
	type Component,
	For,
	Show,
	createEffect,
	createMemo,
	createSignal,
	mergeProps,
	on,
	onMount,
} from "solid-js";
import { Dynamic } from "solid-js/web";

import {
	LogInIcon,
	LogOutIcon,
	SaveIcon,
	TriangleAlertIcon,
} from "lucide-solid";
import { Flex } from "styled-system/jsx";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { Tooltip } from "~/components/ui/tooltip";

import { useCourseDataContext } from "~/context/create";
import type {
	Conflict,
	Road,
	RoadFromResponse,
	RoadResponse,
	SelectedSubjects,
	SyncRoadPost,
	SyncRoadResponse,
} from "~/context/types";

import { UAParser } from "ua-parser-js";
import { flatten } from "~/lib/browserSupport";
import { getSimpleSelectedSubjects } from "~/lib/sanitizeSubjects";

declare global {
	interface Window {
		setLocationHref?: (url: string) => void;
	}
}

export type AuthRef = {
	(props: {
		deleteRoad: (roadName: string) => void;
		retrieveRoad: (roadID: string) => Promise<RoadResponse | undefined>;
		newRoads: string[];
		setNewRoads: (newRoads: string[]) => void;
		save: (roadID: string) => void;
		gettingUserData: boolean;
	}): void;
	deleteRoad: (roadName: string) => void;
	retrieveRoad: (roadID: string) => Promise<RoadResponse | undefined>;
	newRoads: string[];
	setNewRoads: (newRoads: string[]) => void;
	save: (roadID: string) => void;
	gettingUserData: boolean;
};

const Auth: Component<{
	justLoaded: boolean;
	conflictInfo?: Conflict;
	ref?: AuthRef;
	conflict: (conflictInfo: Conflict) => void;
	resolveConflict: () => void;
}> = (props) => {
	const finalProps = mergeProps({ conflictInfo: {} }, props);
	const [
		store,
		{
			setLoggedIn,
			resetState,
			setCurrentSemester,
			setRoad,
			setRetrieved,
			waitAndMigrateOldSubjects,
			deleteRoad,
			setActiveRoad,
			setUnretrieved,
			setRoadName,
			setRoads,
			allowCookies,
			getRoadKeys,
			setRoadProp,
			resetID,
		},
	] = useCourseDataContext();
	const navigate = useNavigate();

	const [accessInfo, setAccessInfo] = createSignal(
		undefined as
			| undefined
			| {
					username: string;
					current_semester: string;
					access_token: string;
					success: boolean;
					academic_id: string;
			  },
	);
	const [loggedIn, setLoggedInInternal] = createSignal(false);
	const [newRoadsRef, setNewRoadsRef] = createSignal([] as string[]);
	const [saveWarnings, setSaveWarnings] = createSignal(
		[] as {
			id: string;
			error: string;
			name: string;
		}[],
	);
	const [gettingUserData, setGettingUserData] = createSignal(false);
	const [currentlySaving, setCurrentlySaving] = createSignal(false);
	const [tabID, setTabIDInternal] = createSignal(
		Math.floor(Math.random() * 16 ** 10).toString(16),
	);

	const [searchParams, setSearchParams] = useSearchParams();
	const params = useParams();

	const [newRoadsCookie, setNewRoadsCookie] = makePersisted(
		createSignal(undefined as Record<string, Road> | undefined),
		{
			name: "newRoads",
			storage: cookieStorage.withOptions({ path: "/" }),
		},
	);
	const [accessInfoCookie, setAccessInfoCookie] = makePersisted(
		createSignal(undefined as ReturnType<typeof accessInfo> | undefined),
		{
			name: "accessInfo",
			storage: cookieStorage.withOptions({
				maxAge: 3 * 24 * 60 * 60,
				path: "/",
			}),
		},
	);
	const [hasSetYearCookie, setHasSetYearCookie] = makePersisted(
		createSignal(false),
		{
			name: "has_set_year",
			storage: cookieStorage.withOptions({ path: "/" }),
		},
	);
	const [hasLoggedInCookie, setHasLoggedInCookie] = makePersisted(
		createSignal(false),
		{
			name: "hasLoggedIn",
			storage: cookieStorage.withOptions({ path: "/" }),
		},
	);
	const [tabsCookie, setTabsCookie] = makePersisted(
		createSignal({ ids: [] } as { ids: number[] }),
		{
			name: "tabs",
			storage: cookieStorage.withOptions({ path: "/" }),
		},
	);

	const activeRoad = createMemo(() => store.activeRoad);
	const cookiesAllowed = createMemo(() => store.cookiesAllowed);
	const roads = createMemo(() => store.roads);
	const saveColor = createMemo(() => {
		if (!cookiesAllowed() && !loggedIn()) {
			return "fg.muted";
		}
		return saveWarnings().length ? "fg.error" : "fg.default";
	});
	const SaveIconComponent = createMemo(() =>
		saveWarnings().length ? TriangleAlertIcon : SaveIcon,
	);

	createEffect(
		on(cookiesAllowed, (newCA) => {
			if (newCA) {
				setNewRoadsCookie(getNewRoadData());
				if (loggedIn()) {
					setAccessInfo(accessInfo());
				}
				setTabID();
			}
		}),
	);

	createEffect(
		on(loggedIn, (newLoggedIn) => {
			setLoggedIn(newLoggedIn);
			if (newLoggedIn && hasSetYearCookie() !== true) {
				const email = accessInfo()?.academic_id;
				const endPoint = email?.indexOf("@") ?? -1;
				const kerb = email?.substring(0, endPoint) ?? "";

				fetch(`${import.meta.env.VITE_URL}/api/people/${kerb}`).then(
					(response) => {
						if (!response.ok) {
							console.log("Failed to find user year");
						} else {
							response.json().then((data) => {
								const dataNum = Number.parseInt(data, 10);
								const year = data ? Math.floor(data / 2) + 1 : undefined;

								if (year !== undefined) {
									changeSemester(year);
								} else {
									console.log("Failed to find user year");
								}
							});
						}
					},
				);
			}
		}),
	);

	onMount(() => {
		window.setLocationHref = (url: string) => {
			window.location.href = url;
		};

		if (newRoadsCookie()) {
			const newRoads = newRoadsCookie() ?? {};

			if (Object.keys(newRoads).length) {
				for (const roadID in newRoads) {
					if (!Array.isArray(newRoads[roadID].contents.selectedSubjects[0])) {
						newRoads[roadID].contents.selectedSubjects =
							getSimpleSelectedSubjects(
								newRoads[roadID].contents
									.selectedSubjects as unknown as SelectedSubjects[],
							);
					}
					if (newRoads[roadID].contents.progressAssertions === undefined) {
						newRoads[roadID].contents.progressAssertions = {};
					}
				}
				if (props.justLoaded) {
					if (!(activeRoad() in newRoads)) {
						setActiveRoad(Object.keys(newRoads)[0]);
					}
					setRoads(newRoads);
				} else {
					setRoads(Object.assign(newRoads, roads()));
				}
				setNewRoadsRef(Object.keys(newRoads));
			}
			allowCookies();
		}

		if (accessInfoCookie()) {
			setAccessInfo(accessInfoCookie());
			setLoggedInInternal(true);
			allowCookies();
			verify().then(() => {
				getUserData();
			});
		}

		setTabID();

		window.onbeforeunload = () => {
			if (cookiesAllowed()) {
				const tabID = sessionStorage.tabID;
				let tabs: number[] = [];
				if (tabsCookie()) {
					tabs = tabsCookie().ids;
				}
				const tabIndex = tabs.indexOf(tabID);
				tabs.splice(tabIndex, 1);
				if (tabs.length) {
					setTabsCookie({ ids: tabs });
				} else {
					setTabsCookie({ ids: [] });
				}
			}
			if (currentlySaving()) {
				return "Your changes are being saved. Are you sure you want to leave?";
			}
		};

		attemptLogin();
	});

	const loginUser = () => {
		if (cookiesAllowed()) {
			setHasLoggedInCookie(true);
		}
		window.setLocationHref?.(
			`${import.meta.env.VITE_FIREROAD_URL}/login/?redirect=${import.meta.env.VITE_URL}`,
		);
	};

	const logoutUser = () => {
		setAccessInfoCookie(undefined);
		if (cookiesAllowed()) {
			setHasLoggedInCookie(false);
		}
		resetState();
		setLoggedInInternal(false);
		setAccessInfo(undefined);
		// window.location.reload();
	};

	const verify = () => {
		const headerList = {
			Authorization: `Bearer ${accessInfo()?.access_token}`,
		};
		const currentMonth = new Date().getMonth();

		return fetch(`${import.meta.env.VITE_FIREROAD_URL}/verify/`, {
			headers: headerList,
		})
			.then((verifyResponse) => {
				if (verifyResponse.ok) {
					verifyResponse.json().then((data) => {
						if (data.success) {
							setCurrentSemester(
								data.current_semester - (currentMonth === 4 ? 1 : 0),
							);
							return data;
						}

						logoutUser();
						return Promise.reject(new Error("Token not valid"));
					});
				} else {
					logoutUser();
					return Promise.reject(new Error("Failed to verify user"));
				}
			})
			.catch((err) => {
				logoutUser();
				return Promise.reject(err);
			});
	};

	const doSecure = async <T,>(
		method: "GET" | "POST",
		link: string,
		params?: BodyInit | null,
	) => {
		if (loggedIn() && accessInfo() !== undefined) {
			const headerList = {
				Authorization: `Bearer ${accessInfo()?.access_token}`,
			};

			const response = await fetch(
				`${import.meta.env.VITE_FIREROAD_URL}${link}`,
				{
					method,
					headers: headerList,
					body: params,
				},
			);

			if (!response.ok) {
				throw new Error(response.statusText);
			}

			return (await response.json()) as T;
		}

		throw new Error("No auth information");
	};

	const getSecure = async <T,>(link: string) => await doSecure<T>("GET", link);

	// biome-ignore lint/suspicious/noExplicitAny: json stringifys
	const postSecure = <T,>(link: string, params: any) =>
		doSecure<T>("POST", link, JSON.stringify(params));

	const retrieveRoad = async (roadID: string) => {
		setGettingUserData(true);

		return getSecure<RoadResponse>(`/sync/roads/?id=${roadID}`).then(
			(roadData) => {
				if (roadData.success) {
					roadData.file.downloaded = new Date().toISOString();
					roadData.file.changed = new Date().toISOString();

					sanitizeRoad(roadData.file);

					setRoad({
						id: roadID,
						road: roadData.file as unknown as Road,
						ignoreSet: true,
					});

					setRetrieved(roadID);
					waitAndMigrateOldSubjects(roadID);

					setGettingUserData(false);
					return roadData;
				}
			},
		);
	};

	const sanitizeRoad = (road: RoadFromResponse) => {
		const newss = road.contents.selectedSubjects.map((s) => {
			if (s.id) {
				s.subject_id = s.id;
				s.id = undefined;
			}
			return s;
		});

		road.contents.selectedSubjects = newss;

		// convert selected subjects to more convenient format
		// @ts-expect-error converting from RoadFromResponse to Road
		road.contents.selectedSubjects = getSimpleSelectedSubjects(
			road.contents.selectedSubjects,
		);
		// sanitize progressOverrides
		if (road.contents.progressOverrides === undefined) {
			road.contents.progressOverrides = {};
		}
		// sanitize progressAssertions
		if (road.contents.progressAssertions === undefined) {
			road.contents.progressAssertions = {};
		}
	};

	const getUserData = () => {
		setGettingUserData(true);
		getSecure<{
			files: {
				[key: string]: {
					name: string;
					agent: string;
					changed: string;
				};
			};
			success: boolean;
		}>("/sync/roads/")
			.then((data) => {
				if (data.success) {
					return data.files;
				}
				throw new Error("Failed to get user data");
			})
			.then((files) => {
				renumberRoads(files);
				for (let i = 0; i < newRoadsRef().length; i++) {
					saveRemote(newRoadsRef()[i]);
				}
				const fileKeys = Object.keys(files);
				for (let i = 0; i < fileKeys.length; i++) {
					const blankRoad = {
						downloaded: new Date().toISOString(),
						changed: files[fileKeys[i]].changed,
						name: files[fileKeys[i]].name,
						agent: files[fileKeys[i]].agent,
						contents: {
							coursesOfStudy: ["girs"],
							selectedSubjects: Array.from(Array(16), () => []),
							progressOverrides: {},
							progressAssertions: {},
						},
					};
					setRoad({
						id: fileKeys[i],
						road: blankRoad,
						ignoreSet: true,
					});
				}
				if (props.justLoaded && fileKeys.length > 0) {
					deleteRoad("$defaultroad$");
				}
				if (fileKeys.includes(params.road)) {
					setActiveRoad(params.road);
				} else {
					// Redirect to first road if road cannot be found
					setActiveRoad(getRoadKeys()[0]);
					navigate(`/road/${getRoadKeys()[0]}`, { replace: true });
				}
				// Set list of unretrieved roads to all but first road ID
				setUnretrieved(fileKeys);
				if (fileKeys.length) {
					// Retrieves based on url and defaults to first road if unable to find it
					if (fileKeys.includes(params.road)) {
						return retrieveRoad(params.road);
					}
					return retrieveRoad(fileKeys[0]);
				}
			})
			.then(() => {
				setGettingUserData(false);
			})
			.catch((err) => {
				alert(err);
				setGettingUserData(false);
				if (err === "Token not valid") {
					alert("Your token has expired. Please log in again.");
				}
				logoutUser();
			});
	};

	const renumber = (name: string, otherNames: (string | undefined)[]) => {
		let newName: string | undefined;
		let copyIndex = 2;
		while (newName === undefined) {
			const copyName = `${name} (${copyIndex})`;
			if (otherNames.indexOf(copyName) === -1) {
				newName = copyName;
			}
			copyIndex++;
		}
		return newName;
	};

	const renumberRoads = (cloudFiles: {
		[key: string]: {
			name: string;
			agent: string;
			changed: string;
		};
	}) => {
		const cloudRoads = Object.keys(cloudFiles).map((id) => cloudFiles[id]);
		const cloudNames = cloudRoads.map((cr) => {
			try {
				return cr.name;
			} catch (err) {
				return undefined;
			}
		});
		for (const roadID in roads()) {
			const localName = roads()[roadID].name;
			if (cloudNames.indexOf(localName) >= 0) {
				const renumberedName = renumber(localName, cloudNames);
				setRoadName({
					id: roadID,
					name: renumberedName,
				});
			}
		}
	};

	const getAuthorizationToken = (code: string) => {
		fetch(
			`${import.meta.env.VITE_FIREROAD_URL}/fetch_token/?code=${code}`,
		).then((response) => {
			if (response.ok) {
				response.json().then((data) => {
					if (data.success) {
						if (cookiesAllowed()) {
							setAccessInfoCookie(data.access_info);
						}
						setAccessInfo(data.access_info);
						verify();
						setLoggedInInternal(true);
						getUserData();
					}
				});
			}
		});
	};

	const attemptLogin = () => {
		const code = searchParams.code;
		if (code && typeof code === "string") {
			window.history.pushState(
				"CourseRoad Home",
				"CourseRoad Home",
				`./#${activeRoad()}`,
			);
			getAuthorizationToken(code);
		} else if (hasLoggedInCookie() === true && !loggedIn()) {
			loginUser();
		}
	};

	const save = (roadID: string) => {
		if (cookiesAllowed()) {
			setNewRoadsCookie(getNewRoadData());
		}
		if (loggedIn()) {
			saveRemote(roadID);
		}
	};

	const getAgent = () => {
		const ua = UAParser(navigator.userAgent);
		// TODO: find alternative for this deprecation
		return `${navigator.platform} ${ua.browser.name} Tab ${tabID()}`;
	};

	// mostly lifitng from courseroad before for compatability
	const saveRemote = (roadID: string, override = false) => {
		setCurrentlySaving(true);
		setSaveWarnings([]);
		const assignKeys: { override: boolean; agent: string; id?: string } = {
			override,
			agent: getAgent(),
		};
		if (!roadID.includes("$")) {
			assignKeys.id = roadID;
		}
		const roadSubjects = flatten(roads()[roadID].contents.selectedSubjects);
		const formattedRoadContents = {
			...{
				coursesOfStudy: ["girs"],
				progressOverrides: [],
				progressAssertions: {},
			},
			...roads()[roadID].contents,
			selectedSubjects: roadSubjects,
		};
		const roadToSend = {
			...roads()[roadID],
			contents: formattedRoadContents,
			...assignKeys,
		} as SyncRoadPost;

		const savePromise = postSecure<SyncRoadResponse>(
			"/sync/sync_road/",
			roadToSend,
		).then((response) => {
			const newid = response.id !== undefined ? response.id : roadID;
			if (response.success === false) {
				setSaveWarnings((prev) => [
					...prev,
					{
						id: newid,
						error: response.error ?? "Unknown error",
						name: roads()[roadID].name,
					},
				]);
			}
			if (response.result === "conflict") {
				const conflictInfo = {
					id: roadID,
					other_name: response.other_name,
					other_agent: response.other_agent,
					other_date: response.other_date,
					other_contents: response.other_contents,
					this_agent: response.this_agent,
					this_date: response.this_date,
				} as Conflict;
				setRoadProp({
					id: roadID,
					prop: "agent",
					value: getAgent(),
					ignoreSet: true,
				});
				props.conflict(conflictInfo);

				return Promise.resolve({ oldid: roadID, state: "same" });
			}
			if (response.result === "update_local") {
				alert(
					"Server has more recent edits.  Overriding local road.  If this is unexpected, check that your computer clock is accurate.",
				);

				const updatedRoad = {
					downloaded: new Date().toISOString(),
					changed: response.changed,
					name: response.name,
					agent: getAgent(),
					contents: response.contents,
				};

				sanitizeRoad(updatedRoad as unknown as RoadFromResponse);

				setRoad({
					id: newid,
					road: updatedRoad,
					ignoreSet: true,
				});

				return Promise.resolve({
					oldid: roadID,
					newid: response.id,
					state: "same",
				});
			}
			setRoadProp({
				id: roadID,
				prop: "downloaded",
				value: new Date().toISOString(),
				ignoreSet: true,
			});

			if (response.id !== undefined) {
				if (roadID !== response.id.toString()) {
					resetID({
						oldid: roadID,
						newid: response.id,
					});
				}
				return Promise.resolve({
					oldid: roadID,
					newid: response.id,
					state: "changed",
				});
			}
			return Promise.resolve({
				oldid: roadID,
				newid: roadID,
				state: "same",
			});
		});
		savePromise
			.then((saveResult) => {
				if (saveResult?.state === "changed") {
					const oldIdIndex = newRoadsRef().indexOf(saveResult.oldid);
					if (oldIdIndex >= 0) {
						newRoadsRef().splice(oldIdIndex, 1);
					}
				}
				if (newRoadsCookie()) {
					setNewRoadsCookie(getNewRoadData());
				}
				setCurrentlySaving(false);
			})
			.catch((err) => {
				console.log(err);
				setCurrentlySaving(false);
			});
	};

	const getNewRoadData = () => {
		const newRoadData: Record<string, Road> = {};
		if (
			newRoadsRef().indexOf("$defaultroad$") === -1 &&
			"$defaultroad$" in roads()
		) {
			if (
				flatten(roads().$defaultroad$?.contents.selectedSubjects).length > 0 ||
				JSON.stringify(
					Array.from(roads().$defaultroad$?.contents.coursesOfStudy),
				) !== '["girs"]'
			) {
				newRoadsRef().push("$defaultroad$");
			}
		}
		for (let r = 0; r < newRoadsRef().length; r++) {
			const roadID = newRoadsRef()[r];
			if (roadID in roads()) {
				newRoadData[roadID] = roads()[roadID];
			}
		}
		return newRoadData;
	};

	const updateRemote = (roadID: string) => {
		saveRemote(roadID, true);
		props.resolveConflict();
	};

	const updateLocal = (roadID: string) => {
		if (props.conflictInfo) {
			const remoteRoad = {
				name: props.conflictInfo.other_name,
				agent: props.conflictInfo.other_agent,
				changed: props.conflictInfo.other_date,
				contents: props.conflictInfo.other_contents,
				downloaded: new Date().toISOString(),
			};
			sanitizeRoad(remoteRoad as unknown as RoadFromResponse);
			setRoad({
				id: roadID,
				road: remoteRoad,
				ignoreSet: false,
			});
		}
		props.resolveConflict();
	};

	const deleteRoadInternal = (roadID: string | number) => {
		if (activeRoad() === roadID) {
			const roadIndex = Object.keys(roads()).indexOf(roadID);
			const withoutRoad = Object.keys(roads())
				.slice(0, roadIndex)
				.concat(Object.keys(roads()).slice(roadIndex + 1));
			if (withoutRoad.length) {
				if (withoutRoad.length > roadIndex) {
					setActiveRoad(withoutRoad[roadIndex]);
				} else {
					setActiveRoad(withoutRoad[roadIndex - 1]);
				}
			} else {
				setActiveRoad("");
			}
		}
		deleteRoad(`${roadID}`);

		if (roadID in newRoadsRef()) {
			const roadIndex = newRoadsRef().indexOf(`${roadID}`);
			newRoadsRef().splice(roadIndex, 1);
		}

		if (loggedIn()) {
			if (typeof roadID === "number" || roadID.indexOf("$") < 0) {
				postSecure("/sync/delete_road/", { id: roadID });
			}
		}
	};

	const setTabID = () => {
		let tabs: number[];
		if (cookiesAllowed()) {
			if (sessionStorage.tabID !== undefined) {
				setTabIDInternal(sessionStorage.tabID);
				const tabNum = Number.parseInt(tabID());
				if (tabsCookie()) {
					tabs = tabsCookie().ids;
					if (tabs.indexOf(tabNum) === -1) {
						tabs.push(tabNum);
						setTabsCookie({ ids: tabs });
					}
				} else {
					setTabsCookie({ ids: [tabNum] });
				}
			} else {
				if (tabsCookie()?.ids) {
					tabs = tabsCookie().ids;
					const maxTab = Math.max(...tabs);
					const newTab = (maxTab + 1).toString();
					sessionStorage.tabID = newTab;
					setTabIDInternal(newTab);
					tabs.push(maxTab + 1);
					setTabsCookie({ ids: tabs });
				} else {
					sessionStorage.tabID = "1";
					setTabIDInternal("1");
					setTabsCookie({ ids: [1] });
				}
			}
		}
	};

	const changeSemester = (year: number) => {
		if (cookiesAllowed()) {
			setHasSetYearCookie(true);
		}
		const currentMonth = new Date().getMonth();
		const sem =
			currentMonth >= 5 && currentMonth <= 10 ? 1 + year * 3 : 3 + year * 3;
		postSecure<{ success: boolean }>("/set_semester/", {
			semester: sem + (currentMonth === 4 ? 1 : 0),
		})
			.then(() => {
				setCurrentSemester(sem);
			})
			.catch(() => {
				if (!accessInfo()?.access_token) {
					// not logged in
					setCurrentSemester(sem);
				}
			});
	};

	props.ref?.({
		deleteRoad: deleteRoadInternal,
		retrieveRoad,
		newRoads: newRoadsRef(),
		gettingUserData: gettingUserData(),
		setNewRoads: setNewRoadsRef,
		save,
	});

	return (
		<Flex flexDir="row" gap={2} alignItems="center">
			<Show
				when={!loggedIn()}
				fallback={
					<Button variant="outline" onClick={logoutUser}>
						Logout <LogOutIcon />
					</Button>
				}
			>
				<Button
					variant="outline"
					onClick={() => {
						// TODO: idk if this is the right thing to do? idk...
						allowCookies();
						loginUser();
					}}
				>
					Login <LogInIcon />
				</Button>
			</Show>
			<Tooltip.Root>
				<Tooltip.Trigger>
					<Icon
						color={saveColor()}
						asChild={(childProps) => (
							<Dynamic {...childProps} component={SaveIconComponent()} />
						)}
					/>
				</Tooltip.Trigger>
				<Tooltip.Positioner>
					<Tooltip.Arrow>
						<Tooltip.ArrowTip />
					</Tooltip.Arrow>
					<Tooltip.Content>
						<For each={saveWarnings()} fallback="All changes saved!">
							{(saveWarning) => `${saveWarning.name}: ${saveWarning.error}`}
						</For>
					</Tooltip.Content>
				</Tooltip.Positioner>
			</Tooltip.Root>
		</Flex>
	);
};

export default Auth;
