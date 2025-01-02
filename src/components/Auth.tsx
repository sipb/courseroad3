import { type Component, Show, createSignal, mergeProps } from "solid-js";

import { LogInIcon, LogOutIcon } from "lucide-solid";
import { Button } from "~/components/ui/button";
import { Tooltip } from "~/components/ui/tooltip";

import type { Conflict } from "~/context/types";

export type AuthRef = {
	(props: {
		deleteRoad: (roadName: string) => void;
		retrieveRoad: (roadName: string) => void;
		newRoads: string[];
		setNewRoads: (newRoads: string[]) => void;
	}): void;
	deleteRoad: (roadName: string) => void;
	retrieveRoad: (roadName: string) => void;
	newRoads: string[];
	setNewRoads: (newRoads: string[]) => void;
};

const Auth: Component<{
	justLoaded: boolean;
	conflictInfo?: Partial<Conflict>;
	ref?: AuthRef;
}> = (props) => {
	const finalProps = mergeProps({ conflictInfo: {} }, props);

	const [accessInfo, setAccessInfo] = createSignal(
		undefined as
			| undefined
			| {
					username: string;
					current_semester: string;
					access_token: string;
					success: boolean;
					academic_id: string;
			  },
	);
	const [loggedIn, setLoggedIn] = createSignal(false);
	const [newRoadsRef, setNewRoadsRef] = createSignal([] as string[]);
	const [saveWarnings, setSaveWarnings] = createSignal(
		[] as {
			id: string;
			error: string;
			name: string;
		}[],
	);
	const [gettingUserData, setGettingUserData] = createSignal(false);
	const [currentlySaving, setCurrentlySaving] = createSignal(false);
	const [tabID, setTabID] = createSignal(
		Math.floor(Math.random() * 16 ** 10).toString(16),
	);

	const deleteRoad = (roadName: string) => {
		console.log("Deleting road", roadName);
		// TODO: IMPLEMENT
	};

	const retrieveRoad = (roadName: string) => {
		console.log("Retrieving road", roadName);
		// TODO: IMPLEMENT
	};

	props.ref?.({
		deleteRoad,
		retrieveRoad,
		newRoads: newRoadsRef(),
		setNewRoads: setNewRoadsRef,
	});

	return (
		<div>
			<Show when={!loggedIn()}>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<Button variant="outline">
							Login <LogInIcon />
						</Button>
					</Tooltip.Trigger>
					<Tooltip.Positioner>
						<Tooltip.Arrow>
							<Tooltip.ArrowTip />
						</Tooltip.Arrow>
						<Tooltip.Content>
							If you are experiencing difficulties logging in, please clear your
							cookies or log in with an incognito tab.
						</Tooltip.Content>
					</Tooltip.Positioner>
				</Tooltip.Root>
			</Show>
			<Show when={loggedIn()}>
				<Button variant="outline">
					Logout <LogOutIcon />
				</Button>
			</Show>
		</div>
	);
};

export default Auth;
