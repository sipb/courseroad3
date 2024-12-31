import { createContext, useContext } from "solid-js";
import type {
	CustomSubject,
	Road,
	SelectedSubjects,
	Subject,
	SubjectFull,
} from "./types";

export const defaultState = {
	versionNumber: "2.0.0", // change when making backwards-incompatible changes
	currentSemester: 1,
	activeRoad: "$defaultroad$" as string,
	addingFromCard: false,
	classInfoStack: [] as string[],
	cookiesAllowed: undefined as undefined | boolean,
	customClassEditing: undefined as undefined | CustomSubject,
	fullSubjectsInfoLoaded: false,
	genericCourses: [] as SubjectFull[],
	genericIndex: {} as Record<string, number>,
	itemAdding: undefined as undefined | SubjectFull | CustomSubject,
	loggedIn: false,
	hideIAP: false,
	roads: {
		$defaultroad$: {
			downloaded: new Date().toISOString(),
			changed: new Date().toISOString(),
			name: "My First Road",
			agent: "",
			contents: {
				coursesOfStudy: ["girs"],
				selectedSubjects: Array.from(Array(16), () => []),
				progressOverrides: {},
				progressAssertions: {},
			},
		},
	} as Record<string, Road>,
	subjectsIndex: {} as Record<string, number>,
	subjectsInfo: [] as SubjectFull[],
	ignoreRoadChanges: false,
	// When changes are made to roads, different levels of fulfillment need to be update in the audit
	// all: update audit for all majors (for changes like adding a class)
	// {specific major}: update audit for a specific major (for changes like adding a major)
	// none: no update to audit is needed (for changes like road name)
	fulfillmentNeeded: "all" as "any" | "all" | "none",
	// list of road IDs that have not been retrieved from the server yet
	unretrieved: [] as string[],
	loadSubjectsPromise: undefined as Promise<SubjectFull[]> | undefined,
	subjectsLoaded: false,
	roadsToMigrate: [] as string[],

	// getters
	get userYear() {
		return Math.floor((this.currentSemester - 1) / 3);
	},

	getMatchingAttributes(gir?: string, hass?: string, ci?: string) {
		const matchingClasses = this.subjectsInfo.filter((subject) => {
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
};

export const defaultActions = {
	resetState: () => {},
	addClass: (newClass: SelectedSubjects) => {},
	addFromCard: (newClass: SubjectFull) => {},
	addReq: (event: "any" | "all" | "none") => {},
	migrateOldSubjects: (roadID: string) => {},
	allowCookies: () => {},
	cancelAddFromCard: () => {},
	cancelEditCustomClass: () => {},
	clearClassInfoStack: () => {},
	disallowCookies: () => {},
	deleteRoad: (id: string) => {},
	dragStartClass: (event: {
		classInfo?: SubjectFull;
		basicClass: Subject;
	}) => {},
	editCustomClass: (classInfo: CustomSubject) => {},
	finishEditCustomClass: (newClass: CustomSubject) => {},
	moveClass: () => {},
	overrideWarnings: () => {},
	setPASubstitutions: () => {},
	setPAIgnore: () => {},
	setUnretrieved: () => {},
	setRetrieved: () => {},
	parseGenericCourses: () => {},
	parseGenericIndex: () => {},
	parseSubjectsIndex: () => {},
	popClassStack: () => {},
	pushClassStack: () => {},
	removeClass: () => {},
	removeReq: () => {},
	removeProgressAssertion: () => {},
	resetID: () => {},
	setActiveRoad: () => {},
	setFullSubjectsInfoLoaded: () => {},
	setLoggedIn: () => {},
	setHideIAP: () => {},
	setRoadProp: () => {},
	setRoad: () => {},
	setRoads: () => {},
	setRoadName: () => {},
	setSubjectsInfo: () => {},
	setCurrentSemester: () => {},
	updateProgress: () => {},
	setFromLocalStorage: () => {},
	updateRoad: () => {},
	watchRoadChanges: () => {},
	resetFulfillmentNeeded: () => {},
	setLoadSubjectsPromise: () => {},
	setSubjectsLoaded: () => {},
	queueRoadMigration: () => {},
	clearMigrationQueue: () => {},
	loadSubjects: async () => {},
	addAtPlaceholder: () => {},
	waitLoadSubjects: async () => {},
	waitAndMigrateOldSubjects: () => {},
};

export const CourseDataContext = createContext<
	[state: typeof defaultState, actions: typeof defaultActions]
>([defaultState, defaultActions]);

export const useCourseDataContext = () => useContext(CourseDataContext);
