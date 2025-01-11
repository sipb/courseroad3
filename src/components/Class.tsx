import type { Component } from "solid-js";

import type { Subject } from "~/context/types";

const Class: Component<{
	classIndex: number;
	classInfo: "placeholder" | Subject;
	semesterIndex: number;
	// warnings: string[];
}> = (props) => {
	return <div />;
};

export default Class;
