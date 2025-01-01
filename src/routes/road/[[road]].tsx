import { useParams } from "@solidjs/router";
import { useCourseDataContext } from "~/context/create";

import { Flex } from "styled-system/jsx";
import About from "~/components/About";
import ThemeToggler from "~/components/ThemeToggler";
import NavbarContainer from "~/components/layout/NavbarContainer";
import SidebarContainer from "~/components/layout/SidebarContainer";
import { recipe as layoutRecipe } from "~/components/layout/layout.recipe";

const styles = layoutRecipe();

export default function RoadPage() {
	const params = useParams();
	const [store] = useCourseDataContext();
	return (
		<>
			<Flex pt={{ base: "28", md: "16" }}>
				<SidebarContainer class={styles.aside}>
					<About />
					<ThemeToggler />
				</SidebarContainer>
				<main class={styles.main}>
					<NavbarContainer>test</NavbarContainer>
					<div />
				</main>
			</Flex>
		</>
	);
}
