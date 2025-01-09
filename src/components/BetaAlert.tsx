import { A } from "@solidjs/router";
import type { Component } from "solid-js";

import { InfoIcon } from "lucide-solid";
import { Alert } from "~/components/ui/alert";
import { Link } from "~/components/ui/link";

const BetaAlert: Component<Alert.RootProps> = (props) => {
	return (
		<Alert.Root {...props}>
			<Alert.Icon asChild={(iconProps) => <InfoIcon {...iconProps()} />} />
			<Alert.Content>
				<Alert.Title>
					This is currently a work-in-progress beta for a new version of
					CourseRoad.{" "}
					<Link
						fontWeight="bold"
						asChild={(linkProps) => (
							<a {...linkProps} href="mailto:courseroad@mit.edu">
								Let us know what you think!
							</a>
						)}
					/>
				</Alert.Title>
			</Alert.Content>
		</Alert.Root>
	);
};

export default BetaAlert;
