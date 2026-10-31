import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Header from "@/Components/Header";
import NavigatorStackRoutes from "@/Routes/NavigatorStack.routes";
import SplashScreen from "@/Components/SplashScreen";

export default function App() {
  const [isReady, setIsReady] = useState(false);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {!isReady ? (
        <SplashScreen onReady={() => setIsReady(true)} />
      ) : (
        <NavigationContainer>
          <Header />
          <NavigatorStackRoutes />
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}
