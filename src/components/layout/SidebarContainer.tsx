import type { ParentComponent } from "solid-js";
import { Box } from "styled-system/jsx";

const SidebarContainer: ParentComponent<{ class?: string }> = (props) => {
	return <aside class={props.class}>{props.children}</aside>;
};

export default SidebarContainer;
