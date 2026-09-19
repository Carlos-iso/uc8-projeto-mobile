import { createStackNavigator } from "@react-navigation/stack";
import NavigatorTabs from "@/Routes/NavigatorTabs.routes";
import { RootStackParamList } from "./types";
const Stack = createStackNavigator<RootStackParamList>();
export default function NavigatorStackRoutes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NavigatorTabs" component={NavigatorTabs} />
    </Stack.Navigator>
  );
}