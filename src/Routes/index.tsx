import { NavigationContainer, useRoute } from "@react-navigation/native";
import NavigatorTabs from "@/Routes/NavigatorTabs.routes";
export default function Router() {
	return (
		<NavigationContainer>
			<NavigatorTabs />
		</NavigationContainer>
	);
}
