import { makePersisted } from "@solid-primitives/storage";
import localforage from "localforage";
import { createResource, type ParentComponent } from "solid-js";
import { createStore, produce, reconcile } from "solid-js/store";
import { isServer } from "solid-js/web";

import {
	CourseDataContext,
	type defaultActions,
	defaultState,
} from "~/context/create";
import type { Subject, SubjectFull } from "~/context/types";

const CourseDataProvider: ParentComponent = (props) => {
	const [store, setStore, init] = makePersisted(
		createStore(structuredClone(defaultState)),
		{
			name: "courseRoadStore",
			storage: !isServer ? localforage : undefined,
		},
	);

	createResource(() => init)[0]();

	const actions = {
		setStore,
		resetState: () => {
			setStore(reconcile(defaultState));
		},
		addClass: (newClass) => {
			setStore(
				"roads",
				produce((roads) => {
					roads[store.activeRoad].contents.selectedSubjects[
						newClass.semester
					].push(newClass);
					roads[store.activeRoad].changed = new Date().toISOString();
				}),
			);
		},
		addFromCard: (newClass) => {
			setStore("addingFromCard", true);
			setStore("itemAdding", newClass);
		},
		addReq(event: string) {
			setStore(
				"roads",
				produce((roads) => {
					roads[store.activeRoad].contents.coursesOfStudy.push(event);
					roads[store.activeRoad].changed = new Date().toISOString();
				}),
			);
			setStore("fulfillmentNeeded", event);
		},
		migrateOldSubjects: (roadID) => {
			setStore(
				"roads",
				produce((roads) => {
					for (let i = 0; i < 16; i++) {
						for (
							let j = 0;
							j < roads[roadID].contents.selectedSubjects[i].length;
							j++
						) {
							const subject = roads[roadID].contents.selectedSubjects[i][j];

							const subjectIndex = store.subjectsIndex[subject.subject_id];
							const genericIndex = store.genericIndex[subject.subject_id];

							const notInCatalog =
								subjectIndex === undefined && genericIndex === undefined;
							const isHistorical =
								subjectIndex !== undefined &&
								store.subjectsInfo[subjectIndex].is_historical;

							if (notInCatalog || isHistorical) {
								// Look for subject with old ID
								const oldSubjects = store.subjectsInfo.filter((subj) => {
									return subj.old_id === subject.subject_id;
								});

								if (oldSubjects.length > 0) {
									const oldSubject = oldSubjects[0];
									subject.subject_id = oldSubject.subject_id;
									subject.title = oldSubject.title;
									subject.units = oldSubject.total_units;
								}
							}
						}
					}
				}),
			);
		},
		allowCookies: () => {
			setStore("cookiesAllowed", true);
		},
		cancelAddFromCard() {
			setStore("addingFromCard", false);
			setStore("itemAdding", undefined);
		},
		cancelEditCustomClass() {
			setStore("customClassEditing", undefined);
		},
		clearClassInfoStack() {
			setStore("classInfoStack", reconcile([]));
		},
		disallowCookies() {
			setStore("cookiesAllowed", false);
		},
		deleteRoad(id) {
			setStore("ignoreRoadChanges", true);
			setStore(
				"roads",
				produce((roads) => {
					// biome-ignore lint/style/noNonNullAssertion: <explanation>
					roads[id] = undefined!;
				}),
			);
		},
		dragStartClass: (event: {
			classInfo?: SubjectFull;
			basicClass: Subject;
		}) => {
			let classInfo = event.classInfo;
			if (classInfo === undefined) {
				if (event.basicClass.subject_id in store.subjectsIndex) {
					classInfo =
						store.subjectsInfo[
							store.subjectsIndex[event.basicClass.subject_id]
						];
				} else if (event.basicClass.subject_id in store.genericIndex) {
					classInfo =
						store.genericCourses[
							store.genericIndex[event.basicClass.subject_id]
						];
				}
			}

			setStore("itemAdding", reconcile(classInfo));
			setStore("addingFromCard", false);
		},
		editCustomClass: (classInfo) => {
			setStore("customClassEditing", reconcile(classInfo));
		},
		finishEditCustomClass: (newClass) => {
			setStore(
				"customClassEditing",
				produce((customClassEditing) => {
					if (customClassEditing !== undefined) {
						customClassEditing.subject_id = newClass.subject_id;
						customClassEditing.title = newClass.title;
						customClassEditing.out_of_class_hours = newClass.out_of_class_hours;
						customClassEditing.in_class_hours = newClass.in_class_hours;
						customClassEditing.custom_color = newClass.custom_color;
						customClassEditing.public = newClass.public;
						customClassEditing.offered_fall = newClass.offered_fall;
						customClassEditing.offered_IAP = newClass.offered_IAP;
						customClassEditing.offered_spring = newClass.offered_spring;
						customClassEditing.offered_summer = newClass.offered_summer;
						customClassEditing.units = newClass.units;
					}
				}),
			);

			setStore("customClassEditing", undefined);
		},
		moveClass: ({ currentClass, classIndex, semester }) => {},
		overrideWarnings: (payload) => {},
		setPASubstitutions: ({ uniqueKey, newReqs }) => {},
		setPAIgnore: ({ uniqueKey, isIgnored }) => {},
		setUnretrieved: (roadIDs) => {
			setStore("unretrieved", reconcile(roadIDs));
		},
		setRetrieved: (roadID) => {
			setStore(
				"unretrieved",
				produce((unretrieved) => {
					const roadIDIndex = unretrieved.indexOf(roadID);

					if (roadIDIndex >= 0) {
						unretrieved.splice(roadIDIndex, 1);
					}
				}),
			);
		},
		parseGenericCourses: () => {
			setStore(
				"genericCourses",
				produce((genericCourses) => {
					// clears array
					genericCourses.length = 0;

					const girAttributes = {
						PHY1: ["Physics 1 GIR", "p1"],
						PHY2: ["Physics 2 GIR", "p2"],
						CHEM: ["Chemistry GIR", "c"],
						BIOL: ["Biology GIR", "b"],
						CAL1: ["Calculus I GIR", "m1"],
						CAL2: ["Calculus II GIR", "m2"],
						LAB: ["Lab GIR", "l1"],
						REST: ["REST GIR", "r"],
					} as const;

					const hassAttributes = {
						"HASS-A": ["HASS Arts", "ha"],
						"HASS-S": ["HASS Social Sciences", "hs"],
						"HASS-H": ["HASS Humanities", "hh"],
						"HASS-E": ["HASS Elective", "ht"],
					} as const;

					const ciAttributes = {
						"CI-H": ["Communication Intensive", "hc"],
						"CI-HW": ["Communication Intensive with Writing", "hw"],
					} as const;

					const baseGeneric = {
						description:
							"Use this generic subject to indicate that you are fulfilling a requirement, but do not yet have a specific subject selected.",
						total_units: 12,
					} as const;

					const baseurl =
						"http://student.mit.edu/catalog/search.cgi?search=&style=verbatim&when=*&termleng=4&days_offered=*&start_time=*&duration=*&total_units=*" as const;

					for (const gir in girAttributes) {
						const offeredGir = actions.getMatchingAttributes(
							gir,
							undefined,
							undefined,
						);

						genericCourses.push({
							...baseGeneric,
							...offeredGir,

							gir_attribute: gir as keyof typeof girAttributes,
							title: `Generic ${girAttributes[gir as keyof typeof girAttributes][0]}`,
							subject_id: gir,
							url: `${baseurl}&cred=${girAttributes[gir as keyof typeof girAttributes][1]}&commun_int=*`,
						});
					}

					for (const hass in hassAttributes) {
						const offeredHass = actions.getMatchingAttributes(
							undefined,
							hass,
							undefined,
						);

						genericCourses.push({
							...baseGeneric,
							...offeredHass,
							hass_attribute: hass as keyof typeof hassAttributes,
							title: `Generic ${hass}`,
							subject_id: hass,
							url: `${baseurl}&cred=${hassAttributes[hass as keyof typeof hassAttributes][1]}&commun_int=*`,
						});

						const offeredHassCI = actions.getMatchingAttributes(
							undefined,
							hass,
							"CI-H",
						);

						genericCourses.push({
							...baseGeneric,
							...offeredHassCI,
							hass_attribute: hass as keyof typeof hassAttributes,
							communication_requirement: "CI-H",
							title: `Generic CI-H ${hass}`,
							subject_id: `CI-H ${hass}`,
							url: `${baseurl}&cred=${hassAttributes[hass as keyof typeof hassAttributes][1]}&commun_int=${ciAttributes["CI-H"][1]}`,
						});
					}

					for (const ci in ciAttributes) {
						const offeredCI = actions.getMatchingAttributes(
							undefined,
							undefined,
							ci,
						);

						genericCourses.push({
							...baseGeneric,
							...offeredCI,
							communication_requirement: ci as keyof typeof ciAttributes,
							title: `Generic ${ci}`,
							hass_attribute: "HASS",
							subject_id: ci as keyof typeof ciAttributes,
							url: `${baseurl}&cred=*&commun_int=${ciAttributes[ci as keyof typeof ciAttributes][1]}`,
						});
					}
				}),
			);
		},
		parseGenericIndex: () => {
			setStore(
				"genericIndex",
				reconcile(
					store.genericCourses.reduce(
						(obj, item, index) => {
							obj[item.subject_id] = index;
							return obj;
						},
						{} as Record<string, number>,
					),
				),
			);
		},
		parseSubjectsIndex: () => {},
		popClassStack: () => {},
		pushClassStack: (id) => {},
		removeClass: ({ classInfo, classIndex }) => {},
		removeReq: (event) => {
			const reqIndex =
				store.roads[store.activeRoad].contents.coursesOfStudy.indexOf(event);

			if (reqIndex === -1) {
				console.log(
					"Attempted to remove a requirement not in the requirements list.",
				);
			} else {
				setStore(
					"roads",
					produce((roads) => {
						roads[store.activeRoad].contents.coursesOfStudy.splice(reqIndex, 1);
						roads[store.activeRoad].changed = new Date().toISOString();
					}),
				);
				setStore("fulfillmentNeeded", "none");
			}
		},
		removeProgressAssertion: (uniqueKey) => {},
		resetID: ({ oldid, newid }) => {},
		setActiveRoad: (activeRoad) => {
			setStore("activeRoad", activeRoad);
		},
		setFullSubjectsInfoLoaded: (isFull) => {
			setStore("fullSubjectsInfoLoaded", isFull);
		},
		setLoggedIn: (newLoggedIn) => {
			setStore("loggedIn", newLoggedIn);
		},
		setHideIAP: (value) => {
			setStore("hideIAP", value);
		},
		setRoadProp: ({ id, prop, value, ignoreSet }) => {},
		setRoad: ({ id, road, ignoreSet }) => {
			if (ignoreSet) {
				setStore("ignoreRoadChanges", true);
			}
			if (store.activeRoad !== id) {
				setStore("fulfillmentNeeded", "none");
			}
			setStore(
				"roads",
				produce((roads) => {
					roads[id] = road;
				}),
			);
		},
		setRoads: (roads) => {
			setStore("roads", reconcile(roads));
		},
		setRoadName: ({ id, name }) => {
			setStore(
				"roads",
				produce((roads) => {
					roads[id].name = name;
					roads[id].changed = new Date().toISOString();
				}),
			);
		},
		setSubjectsInfo: (data) => {
			setStore("subjectsInfo", reconcile(data));
		},
		setCurrentSemester: (sem) => {
			setStore("currentSemester", Math.max(1, sem));
		},
		updateProgress: (progress) => {},
		// setFromLocalStorage: (localStore) => {},
		updateRoad: (id, road) => {},
		watchRoadChanges: () => {},
		// Reset fulfillment needed to default of all
		resetFulfillmentNeeded: () => {
			setStore("fulfillmentNeeded", "all");
		},
		setLoadSubjectsPromise: (promise) => {
			setStore("loadSubjectsPromise", promise);
		},
		setSubjectsLoaded: () => {
			setStore("subjectsLoaded", true);
		},
		queueRoadMigration: (roadID) => {},
		clearMigrationQueue: () => {
			setStore("roadsToMigrate", reconcile([]));
		},
		loadAllSubjects: async () => {
			const promise = fetch(
				`${import.meta.env.VITE_FIREROAD_URL}/courses/all?full=true`,
			).then((response) => response.json() as Promise<SubjectFull[]>);

			actions.setLoadSubjectsPromise(promise);
			const response = await promise;
			actions.setSubjectsLoaded();
			actions.setSubjectsInfo(response);
			actions.setFullSubjectsInfoLoaded(true);
			actions.parseGenericCourses();
			actions.parseGenericIndex();
			actions.parseSubjectsIndex();
			for (const roadID of store.roadsToMigrate) {
				actions.migrateOldSubjects(roadID);
			}
			actions.clearMigrationQueue();
		},
		addAtPlaceholder: (index) => {},
		waitLoadSubjects: async () => {},
		waitAndMigrateOldSubjects: (roadID) => {},

		getUserYear: () => {
			return Math.floor((store.currentSemester - 1) / 3);
		},

		getRoadKeys: () => {
			return Object.getOwnPropertyNames(store.roads).filter(
				(key) => store.roads[key] !== undefined,
			);
		},

		getMatchingAttributes: (gir, hass, ci) => {
			const matchingClasses = store.subjectsInfo.filter((subject) => {
				if (gir !== undefined && subject.gir_attribute !== gir) {
					return false;
				}
				if (hass !== undefined && subject.hass_attribute !== hass) {
					return false;
				}
				return !(ci !== undefined && subject.communication_requirement !== ci);
			});

			const totalObject = matchingClasses.reduce(
				(accumObject, nextClass) => {
					return {
						offered_spring:
							accumObject.offered_spring || nextClass.offered_spring,
						offered_summer:
							accumObject.offered_summer || nextClass.offered_summer,
						offered_IAP: accumObject.offered_IAP || nextClass.offered_IAP,
						offered_fall: accumObject.offered_fall || nextClass.offered_fall,
						in_class_hours:
							accumObject.in_class_hours +
							(nextClass.in_class_hours !== undefined
								? nextClass.in_class_hours
								: 0),
						out_of_class_hours:
							accumObject.out_of_class_hours +
							(nextClass.out_of_class_hours !== undefined
								? nextClass.out_of_class_hours
								: 0),
					};
				},
				{
					offered_spring: false,
					offered_summer: false,
					offered_IAP: false,
					offered_fall: false,
					in_class_hours: 0,
					out_of_class_hours: 0,
				},
			);
			totalObject.in_class_hours /= matchingClasses.length;
			totalObject.out_of_class_hours /= matchingClasses.length;
			return totalObject;
		},
	} satisfies typeof defaultActions;

	return (
		<CourseDataContext.Provider value={[store, actions]}>
			{props.children}
		</CourseDataContext.Provider>
	);
};

export default CourseDataProvider;
