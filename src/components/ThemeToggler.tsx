import { createUserTheme } from "@solid-primitives/cookies";
import { usePrefersDark } from "@solid-primitives/media";
import { defer } from "@solid-primitives/utils";
import { useHead } from "@solidjs/meta";

import { MoonIcon, SunIcon, SunMoonIcon } from "lucide-solid";
import {
	type Component,
	createEffect,
	createUniqueId,
	Match,
	Switch,
} from "solid-js";
import { IconButton } from "~/components/ui/icon-button";

const ThemeToggler: Component = () => {
	const [theme, setTheme] = createUserTheme("theme");
	const prefersDark = usePrefersDark();

	// inspiration from https://github.com/solidjs-community/solid-primitives/blob/main/site/src/components/Header/ThemeBtn.tsx
	const handleClick = () => {
		switch (theme()) {
			case "dark":
				{
					if (prefersDark()) {
						document.documentElement.classList.add("dark");
						setTheme(undefined);
					} else {
						document.documentElement.classList.remove("dark");
						setTheme("light");
					}
				}
				break;
			case "light":
				{
					if (prefersDark()) {
						document.documentElement.classList.add("dark");
						setTheme("dark");
					} else {
						setTheme(undefined);
					}
				}
				break;
			default: {
				if (!prefersDark()) {
					document.documentElement.classList.add("dark");
					setTheme("dark");
				} else {
					document.documentElement.classList.remove("dark");
					setTheme("light");
				}
			}
		}
	};

	createEffect(
		defer(prefersDark, (prefersDark) => {
			if (theme() !== undefined) return;

			if (prefersDark) {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
		}),
	);

	useHead({
		tag: "script",
		props: {
			children: `
				// This script is used to set the theme based on the user's preference or the user's cookie
				// using window.themeCookie to avoid HMR issues
				window.themeCookie = document.cookie
					.split("; ")
					.find((row) => row.startsWith("theme"))
					?.split("=")[1];
				
				if (window.themeCookie === 'dark' || ((!window.themeCookie || window.themeCookie === "undefined") && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
					document.documentElement.classList.add('dark')
				} else {
					document.documentElement.classList.remove('dark')
				}`,
		},
		setting: { close: true },
		id: createUniqueId(),
	});

	return (
		<>
			<IconButton
				variant="ghost"
				onClick={handleClick}
				aria-label="Toggle Theme"
			>
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
