// TODO: find out how to do this without so many type assertions
import { cva, type RecipeVariant } from "styled-system/css";

export const validCourses = [
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"11",
	"12",
	"14",
	"15",
	"16",
	"17",
	"18",
	"20",
	"21",
	"21A",
	"21G",
	"21H",
	"21L",
	"21M",
	"21T",
	"21W",
	"22",
	"24",
	"CC",
	"CMS",
	"CSB",
	"EC",
	"EM",
	"ES",
	"HST",
	"IDS",
	"MAS",
	"SCM",
	"STS",
	"WGS",
	"SP",
	"SWE",
	"AS",
	"MS",
	"NS",
] as const;
export const validGeneric = [
	"PHY1",
	"PHY2",
	"CHEM",
	"BIOL",
	"CAL1",
	"CAL2",
	"LAB",
	"REST",
	"HASS-A",
	"HASS-H",
	"HASS-S",
	"HASS-E",
	"CI-H",
	"CI-HW",
];

export const colorClasses = cva({
	base: {
		color: "#ffffff",
	},
	defaultVariants: {
		types: "course-none",
	},
	variants: {
		types: {
			"course-none": { background: "#999999" },
			"course-1": { background: "#de4343" },
			"course-2": { background: "#de7643" },
			"course-3": { background: "#4369de" },
			"course-4": { background: "#57b563" },
			"course-5": { background: "#43deaf" },
			"course-6": { background: "#4390de" },
			"course-7": { background: "#5779b5" },
			"course-8": { background: "#8157b5" },
			"course-9": { background: "#8143de" },
			"course-10": { background: "#b55757" },
			"course-11": { background: "#b55773" },
			"course-12": { background: "#43de4f" },
			"course-14": { background: "#de9043" },
			"course-15": { background: "#b55c57" },
			"course-16": { background: "#43b2de" },
			"course-17": { background: "#de43b7" },
			"course-18": { background: "#575db5" },
			"course-20": { background: "#57b56e" },
			"course-21": { background: "#57b573" },
			"course-21A": { background: "#57b573" },
			"course-21G": { background: "#57b599" },
			"course-21H": { background: "#57b5a5" },
			"course-21L": { background: "#57b5b2" },
			"course-21M": { background: "#57acb5" },
			"course-21T": { background: "#5e9da6" },
			"course-21W": { background: "#57b580" },
			"course-22": { background: "#b55757" },
			"course-24": { background: "#7657b5" },
			"course-CC": { background: "#4fde43" },
			"course-CMS": { background: "#57b58c" },
			"course-CSB": { background: "#579ab5" },
			"course-EC": { background: "#76b557" },
			"course-EM": { background: "#576eb5" },
			"course-ES": { background: "#5a57b5" },
			"course-HST": { background: "#5779b5" },
			"course-IDS": { background: "#57b586" },
			"course-MAS": { background: "#57b55a" },
			"course-SCM": { background: "#57b573" },
			"course-STS": { background: "#8f57b5" },
			"course-WGS": { background: "#579fb5" },
			"course-SP": { background: "#4343de" },
			"course-SWE": { background: "#b56b57" },
			"course-AS": { background: "#b0b0b0" },
			"course-MS": { background: "#b0b0b0" },
			"course-NS": { background: "#b0b0b0" },

			"generic-GIR": { background: "#bf6139" },
			"generic-HASS-E": { background: "#39bf97" },
			"generic-HASS-A": { background: "#3997bf" },
			"generic-HASS-H": { background: "#3946bf" },
			"generic-HASS-S": { background: "#7c39bf" },
			"generic-CI-H": { background: "#bf39b1" },
			"generic-CI-HW": { background: "#bf3961" },

			"custom_color-0": { background: "#b55757" },
			"custom_color-1": { background: "#b58657" },
			"custom_color-2": { background: "#b5b557" },
			"custom_color-3": { background: "#86b557" },
			"custom_color-4": { background: "#57b557" },
			"custom_color-5": { background: "#57b586" },
			"custom_color-6": { background: "#de4343" },
			"custom_color-7": { background: "#de9043" },
			"custom_color-8": { background: "#dede43" },
			"custom_color-9": { background: "#90de43" },
			"custom_color-10": { background: "#43de43" },
			"custom_color-11": { background: "#43de90" },
			"custom_color-12": { background: "#b51616" },
			"custom_color-13": { background: "#b56516" },
			"custom_color-14": { background: "#b5b516" },
			"custom_color-15": { background: "#65b516" },
			"custom_color-16": { background: "#16b516" },
			"custom_color-17": { background: "#16b565" },
			"custom_color-18": { background: "#57b5b5" },
			"custom_color-19": { background: "#5786b5" },
			"custom_color-20": { background: "#5757b5" },
			"custom_color-21": { background: "#8657b5" },
			"custom_color-22": { background: "#b557b5" },
			"custom_color-23": { background: "#b55786" },
			"custom_color-24": { background: "#43dede" },
			"custom_color-25": { background: "#4390de" },
			"custom_color-26": { background: "#4343de" },
			"custom_color-27": { background: "#9043de" },
			"custom_color-28": { background: "#de43de" },
			"custom_color-29": { background: "#de4390" },
			"custom_color-30": { background: "#16b5b5" },
			"custom_color-31": { background: "#1665b5" },
			"custom_color-32": { background: "#1616b5" },
			"custom_color-33": { background: "#6516b5" },
			"custom_color-34": { background: "#b516b5" },
			"custom_color-35": { background: "#b51665" },
			"custom_color-36": { background: "#000000" },
			"custom_color-37": { background: "#262626" },
			"custom_color-38": { background: "#4d4d4d" },
			"custom_color-39": { background: "#737373" },
			"custom_color-40": { background: "#999999" },
			"custom_color-41": { background: "#bfbfbf" },
		},
	},
});

export const getColorClass = (courseColor?: string) => {
	return colorClasses({
		types: courseColor as RecipeVariant<typeof colorClasses>["types"],
	});
};

// courseColor takes in subject
export const courseColor = (subject: {
	custom_color?: string;
	id?: string;
	subject_id: string;
}): RecipeVariant<typeof colorClasses>["types"] => {
	// Custom course have custom_color component
	if (subject.custom_color) {
		return `custom_color-${subject.custom_color.slice(1)}` as RecipeVariant<
			typeof colorClasses
		>["types"];
	}
	// Otherwise it's normal class which id determines color
	return courseColorFromId(subject.id || subject.subject_id);
};

// Takes a subject ID directly
export const courseColorFromId = (
	id: string,
): RecipeVariant<typeof colorClasses>["types"] => {
	if (id !== undefined) {
		let course = id.split(".")[0];
		if (course.indexOf("GIR:") >= 0) {
			course =
				course.substring(0, course.indexOf("GIR:")) +
				course.substring(course.indexOf("GIR:") + 4);
		}
		const girAttrs = course
			.split(" ")
			.filter((c) => validGeneric.indexOf(c) >= 0);
		if (validCourses.indexOf(course as (typeof validCourses)[0]) !== -1) {
			return `course-${course}` as RecipeVariant<typeof colorClasses>["types"];
		}
		if (girAttrs.length > 0) {
			if (girAttrs.length === 1) {
				const attr = girAttrs[0];
				if (attr.indexOf("HASS") === 0) {
					return `generic-${course}` as RecipeVariant<
						typeof colorClasses
					>["types"];
				}
				if (attr.indexOf("CI") === 0) {
					return `generic-${course}` as RecipeVariant<
						typeof colorClasses
					>["types"];
				}
			}
			return "generic-GIR";
		}
	}
	return "course-none";
};
