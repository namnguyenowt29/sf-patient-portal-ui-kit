import SessionTimeoutValidator from "../sessionTimeout/SessionTimeoutValidator";
import { AuthProvider } from "../context/AuthContext";
import AppLayout from "../../../AppLayout";

export default function AuthAppLayout() {
	return (
		<AuthProvider>
			<SessionTimeoutValidator basePath="" />
			<AppLayout />
		</AuthProvider>
	);
}
