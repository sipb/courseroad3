import { type Component, type JSXElement, splitProps } from "solid-js";
import { css } from "styled-system/css";

import { Button, type ButtonProps } from "~/components/ui/button";
import { IconButton, type IconButtonProps } from "~/components/ui/icon-button";

interface ResponsiveButtonProps extends ButtonProps, IconButtonProps {
	text: string;
	icon: JSXElement;
	iconOnDesktop?: boolean;
}

const ResponsiveButton: Component<ResponsiveButtonProps> = (props) => {
	const [local, others] = splitProps(props, [
		"text",
		"icon",
		"iconOnDesktop",
		"class",
	]);

	return (
		<>
			<Button class={`${css({ hideBelow: "md" })} ${local.class}`} {...others}>
				{local.text} {local.iconOnDesktop === false ? null : local.icon}
			</Button>
			<IconButton
				class={`${css({ hideFrom: "md" })} ${local.class}`}
				{...others}
			>
				{local.icon}
			</IconButton>
		</>
	);
};

export default ResponsiveButton;
