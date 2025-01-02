import { makePersisted } from "@solid-primitives/storage";
import { type ParentComponent, createResource } from "solid-js";
import { createStore, produce, reconcile } from "solid-js/store";

import { CourseDataContext, type defaultActions, defaultState } from "./create";
import type { Subject, SubjectFull } from "./types";

const CourseDataProvider: ParentComponent = (props) => {
	const [store, setStore, init] = makePersisted(createStore(defaultState), {
		name: "courseRoadStore",
	});

	createResource(() => init)[0]();

	const actions = {
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
		setUnretrieved: (roadIDs) => {},
		setRetrieved: (roadID) => {},
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
		setLoggedIn: (newLoggedIn) => {},
		setHideIAP: (value) => {},
		setRoadProp: ({ id, prop, value, ignoreSet }) => {},
		setRoad: ({ id, road, ignoreSet }) => {},
		setRoads: (roads) => {},
		setRoadName: ({ id, name }) => {},
		setSubjectsInfo: (data) => {},
		setCurrentSemester: (sem) => {},
		updateProgress: (progress) => {},
		// setFromLocalStorage: (localStore) => {},
		updateRoad: (id, road) => {},
		watchRoadChanges: () => {},
		resetFulfillmentNeeded: () => {},
		setLoadSubjectsPromise: (promise) => {},
		setSubjectsLoaded: () => {},
		queueRoadMigration: (roadID) => {},
		clearMigrationQueue: () => {},
		loadSubjects: async () => {},
		addAtPlaceholder: (index) => {},
		waitLoadSubjects: async () => {},
		waitAndMigrateOldSubjects: (roadID) => {},
	} satisfies typeof defaultActions;

	return (
		<CourseDataContext.Provider value={[store, actions]}>
			{props.children}
		</CourseDataContext.Provider>
	);
};

export default CourseDataProvider;
