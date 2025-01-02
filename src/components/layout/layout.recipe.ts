import { sva } from "styled-system/css";

export const recipe = sva({
	className: "layout",
	slots: ["aside", "main"],
	base: {
		aside: {
			bg: {
				base: "gray.2",
				_dark: "#0e0e0e",
			},
			borderRightWidth: "1px",
			position: "fixed",
			top: "0",
			bottom: "0",
			display: { base: "none", md: "block" },
			ps: "max(32px, calc((100vw - (1440px - 64px)) / 2))",
			pe: "8",
			minWidth: "272px",
			overflow: "auto",
			width: {
				base: "272px",
				lg: "calc((100vw - (1440px - 64px)) / 2 + 272px - 32px)",
			},
		},
		main: {
			minWidth: "0",
			flex: "1",
			ps: {
				base: "0",
				md: "max(calc((100vw - 1440px) / 2 + 272px), 272px)",
			},
			// pe: "calc((100vw - 1440px) / 2)",
		},
	},
});
