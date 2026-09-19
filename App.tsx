import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Header from "@/Components/Header";
import NavigatorStackRoutes from "@/Routes/NavigatorStack.routes";

export default function App() {
	return (
		<SafeAreaProvider>
			<NavigationContainer>
				<Header />
				<NavigatorStackRoutes />
			</NavigationContainer>
		</SafeAreaProvider>
	);
}
