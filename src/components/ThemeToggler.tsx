import { createUserTheme } from "@solid-primitives/cookies";
import { MoonIcon, SunIcon, SunMoonIcon } from "lucide-solid";
import { type Component, createEffect } from "solid-js";
import { Match, Switch } from "solid-js";
import { IconButton } from "~/components/ui/icon-button";

const ThemeToggler: Component = () => {
	const [theme, setTheme] = createUserTheme();

	const handleClick = () =>
		setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));

	const ThemeIcon: Component<{ themeValue: ReturnType<typeof theme> }> = ({
		themeValue,
	}) => {
		switch (themeValue) {
			case "light":
				return <SunIcon />;
			case "dark":
				return <MoonIcon />;
			default:
				return <SunMoonIcon />;
		}
	};

	createEffect(() => {
		// TODO: look for better ways of doing this...
		document.body.classList.toggle("dark", theme() === "dark");
	});

	return (
		<>
			<IconButton variant="ghost" onClick={handleClick}>
				<Switch fallback={<SunMoonIcon />}>
					<Match when={theme() === "light"}>
						<SunIcon />
					</Match>
					<Match when={theme() === "dark"}>
						<MoonIcon />
					</Match>
				</Switch>
			</IconButton>
		</>
	);
};

export default ThemeToggler;
