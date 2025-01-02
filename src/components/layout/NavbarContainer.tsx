import type { ParentComponent } from "solid-js";
import { type BoxProps, Container, Flex } from "styled-system/jsx";

const NavbarContainer: ParentComponent = (props) => {
	return (
		<Flex
			flexDir="column"
			position="fixed"
			top="0"
			width="full"
			background="bg.canvas"
			zIndex="sticky"
			borderBottomWidth={"1px"}
			borderColor={{ base: "border.subtle", _dark: "black" }}
			{...props}
		/>
	);
};

export default NavbarContainer;
