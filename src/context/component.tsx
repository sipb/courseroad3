import { makePersisted, storageSync } from "@solid-primitives/storage";
import { type ParentComponent, createResource } from "solid-js";
import { createStore, produce, reconcile, unwrap } from "solid-js/store";

import { CourseDataContext, type defaultActions, defaultState } from "./create";
import type { Subject, SubjectFull } from "./types";

const CourseDataProvider: ParentComponent = (props) => {
	const [store, setStore, init] = makePersisted(
		createStore(structuredClone(defaultState)),
		{
			name: "courseRoadStore",
			sync: storageSync,
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
		addReq(event: "any" | "all" | "none") {
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
					delete roads[id];
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
		parseGenericCourses: () => {},
		parseGenericIndex: () => {},
		parseSubjectsIndex: () => {},
		popClassStack: () => {},
		pushClassStack: (id) => {},
		removeClass: ({ classInfo, classIndex }) => {},
		removeReq: (event) => {},
		removeProgressAssertion: (uniqueKey) => {},
		resetID: ({ oldid, newid }) => {},
		setActiveRoad: (activeRoad) => {
			setStore("activeRoad", activeRoad);
		},
		setFullSubjectsInfoLoaded: (isFull) => {},
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
		setSubjectsInfo: (data) => {},
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
		setLoadSubjectsPromise: (promise) => {},
		setSubjectsLoaded: () => {},
		queueRoadMigration: (roadID) => {},
		clearMigrationQueue: () => {},
		loadSubjects: async () => {},
		addAtPlaceholder: (index) => {},
		waitLoadSubjects: async () => {},
		waitAndMigrateOldSubjects: (roadID) => {},

		getUserYear: () => {
			return Math.floor((store.currentSemester - 1) / 3);
		},

		getRoadKeys: () => {
			if (!store.roads) return [];
			return Object.keys(store.roads);
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
