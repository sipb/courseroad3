import type { ParentComponent } from "solid-js";
import { Flex, type FlexProps } from "styled-system/jsx";

const NavbarContainer: ParentComponent<FlexProps> = (props) => {
	return (
		<Flex
			flexDir="column"
			position="sticky"
			top="0"
			right="0"
			width="100%"
			background="bg.canvas"
			zIndex="sticky"
			borderBottomWidth={"1px"}
			paddingTop={2}
			paddingRight={2}
			paddingLeft={2}
			gap={4}
			borderColor={{ base: "border.subtle", _dark: "black" }}
			{...props}
		/>
	);
};

export default NavbarContainer;
