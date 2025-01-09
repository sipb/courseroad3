import { sva } from "styled-system/css";

export const recipe = sva({
	className: "layout",
	slots: ["main", "sidebar", "sidebarHeader", "sidebarBody", "sidebarFooter"],
	base: {
		sidebar: {
			bg: {
				base: "gray.2",
				_dark: "#0e0e0e",
			},
			borderRightWidth: "1px",
			position: "fixed",
			top: "0",
			bottom: "0",
			display: { base: "none", md: "grid" },
			p: "4",
			minWidth: "272px",
			overflow: "auto",
			width: {
				base: "272px",
				lg: "calc((100vw - (1440px - 64px)) / 2 + 272px - 32px)",
			},
			gridTemplateColumns: "1fr",
			gridTemplateRows: "auto 1fr auto",
			gridTemplateAreas: "'header' 'main' 'footer'",
			gridGap: "2",
			height: "100%",
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
		sidebarHeader: {
			gridArea: "header",
		},
		sidebarBody: {
			gridArea: "main",
		},
		sidebarFooter: {
			gridArea: "footer",
		},
	},
});
