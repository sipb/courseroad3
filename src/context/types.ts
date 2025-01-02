export interface Subject {
	subject_id: string;
	title: string;
	total_units: number;
	offered_fall: boolean;
	offered_IAP: boolean;
	offered_spring: boolean;
	offered_summer: boolean;
	public: boolean;
	semester?: number; // specifically for when in a road...
	units?: number; // is manually set in some places
	index?: number; // is also manually set idk why
	overrideWarnings?: boolean; // is also manually set by user
	level?: "U" | "G";
	is_historical?: boolean;
	source_semester?: string;
	joint_subjects?: Subject["subject_id"][];
	equivalent_subjects?: Subject["subject_id"][];
	meets_with_subjects?: Subject["subject_id"][];
	quarter_information?: string;
	not_offered_year?: string;
	instructors?: string[];
	communication_requirement?: "CI-H" | "CI-HW";
	hass_attribute?: "HASS-A" | "HASS-E" | "HASS-H" | "HASS-S";
	gir_attribute?:
		| "BIOL"
		| "CAL1"
		| "CAL2"
		| "CHEM"
		| "LAB"
		| "LAB2"
		| "GIR:PHY1"
		| "GIR:PHY2"
		| "GIR:REST";
	children?: Subject["subject_id"][];
	parent?: Subject["subject_id"];
	prereqs?: string;
	virtual_status?: "In-Person" | "Virtual";
	old_id: string;
}

export interface SubjectFull extends Subject {
	lecture_units: number;
	lab_units: number;
	design_units: number;
	preparation_units: number;
	is_variable_units: boolean;
	is_half_class: boolean;
	has_final: boolean;
	description?: string;
	prerequisites?: string;
	corequisites?: string;
	schedule?: string;
	url?: string;
	related_subjects?: Subject["subject_id"][];
	rating?: number;
	enrollment_number?: number;
	in_class_hours?: number;
	out_of_class_hours?: number;
}

export interface CourseRequirements {
	"list-id": string;
	"short-title": string;
	"medium-title": string;
	"title-no-degree": string;
	title: string;
	desc?: string;
	req?: string;
	"plain-string": boolean;
	reqs?: Reqs[];
	"connection-type": "any" | "all" | "none";
	threshold?: Threshold;
	"distinct-threshold"?: Threshold;
	"threshold-desc"?: string;
}

export interface Reqs {
	req?: string;
	"connection-type": "any" | "all" | "none";
	threshold?: Threshold;
	"distinct-threshold"?: Threshold;
	"threshold-desc"?: string;
	reqs?: Reqs[];
	title?: string;
}

interface Threshold {
	type: "LT" | "GT" | "LTE" | "GTE";
	cutoff: number;
	criterion: "subjects" | "units";
}

export interface Progress extends CourseRequirements {
	fulfilled: boolean;
	progress: number;
	max: number;
	percent_fullfilled: number;
	sat_courses: Subject["subject_id"][];
	is_bypassed: boolean;
	assertion: ProgressAssertions;
}

interface ProgressAssertions {
	override?: number;
	ignore?: boolean;
	substitutions?: Subject["subject_id"][];
}

export type RoadResponse = RoadResponseSuccess | RoadResponseError;

interface RoadResponseSuccess {
	success: true;
	file: RoadFromResponse;
}

interface RoadResponseError {
	success: false;
	error_msg: string;
}

export interface RoadFromResponse {
	name: string;
	changed: string;
	agent: string;
	downloaded: string;
	id?: number;
	contents: RoadContentsResponse;
}

export interface Road {
	name: string;
	changed: string;
	agent: string;
	downloaded: string;
	id?: number;
	contents: RoadContents;
}

interface RoadContentsResponse {
	coursesOfStudy: string[];
	selectedSubjects: SelectedSubjects[];
	progressOverrides: {
		[key: string]: number;
	};
	progressAssertions: {
		[key: string]: ProgressAssertions;
	};
}

interface RoadContents {
	coursesOfStudy: string[];
	selectedSubjects: SimplifiedSelectedSubjects;
	progressOverrides: {
		[key: string]: number;
	};
	progressAssertions: {
		[key: string]: ProgressAssertions;
	};
}

export interface SelectedSubjects {
	units: number;
	semester: number;
	overrideWarnings: boolean;
	subject_id: string;
	title: string;
	id?: string;
}

export type SimplifiedSelectedSubjects = SelectedSubjects[][];

export interface CustomSubject {
	subject_id: string;
	title: string;
	in_class_hours: number;
	out_of_class_hours: number;
	custom_color: string;
	public: boolean;
	offered_fall: boolean;
	offered_IAP: boolean;
	offered_spring: boolean;
	offered_summer: boolean;
	units?: number;
}
