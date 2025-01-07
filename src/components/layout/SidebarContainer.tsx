import type { ParentComponent } from "solid-js";

const SidebarContainer: ParentComponent<{ class?: string }> = (props) => {
	return <aside class={props.class}>{props.children}</aside>;
};

export default SidebarContainer;
