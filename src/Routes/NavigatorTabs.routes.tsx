import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
//Screans
import Customers from "@/Views/Customers";
import Games from "@/Views/Games";
import Rentals from "@/Views/Rentals";
const Tab = createBottomTabNavigator();
export default function NavigatorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#7965DB",
          borderTopColor: "transparent",
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "800",
        },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#000000",
      }}
    >
      <Tab.Screen
        name="Customers"
        component={Customers}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" size={size} color={color} />
          ),
          tabBarLabel: "Clientes",
        }}
      />
      <Tab.Screen
        name="Games"
        component={Games}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="activity" size={size} color={color} />
          ),
          tabBarLabel: "Jogos",
        }}
      />
      <Tab.Screen
        name="Rentals"
        component={Rentals}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="shopping-cart" size={size} color={color} />
          ),
          tabBarLabel: "Locações",
        }}
      />
    </Tab.Navigator>
  );
}