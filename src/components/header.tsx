import Button from "./ui/button";
import { useAuth } from "../context/auth-context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";

export default function Header() {
	const { user, googleLogin, logoutUser } = useAuth();

	if (user) {
		return (
			<>
				<Button variant="ghost" className="!text-base">
					<img src={user.photoURL} alt={user.displayName} className="size-6" />
					{user.displayName}
				</Button>

				<Button className="hover:!bg-red-500/20 hover:!text-red-500" onClick={logoutUser}>
					<FontAwesomeIcon icon={faRightFromBracket} className="text-base" />
					Logout
				</Button>
			</>
		);
	}

	return (
		<>
			<a href="http://github.com/alihamasdev" target="_blank" rel="noopener noreferrer">
				<Button variant="ghost">
					<FontAwesomeIcon icon={faGithub} className="text-lg" />
					alihamasdev
				</Button>
			</a>

			<Button onClick={googleLogin}>
				<FontAwesomeIcon icon={faGoogle} className="text-base" />
				Sign In
			</Button>
		</>
	);
}
