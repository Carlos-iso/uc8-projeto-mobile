import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Header from "@/Components/Header";
import NavigatorStackRoutes from "@/Routes/NavigatorStack.routes";
import SplashScreen from "@/Components/SplashScreen";

// Em modo de build/produção (!__DEV__) ou via variável de ambiente,
// a tela de espera/splashscreen do React é desativada para entrar direto no app.
const shouldSkipSplash =
  !__DEV__ || process.env.EXPO_PUBLIC_DISABLE_SPLASH === "true";

export default function App() {
  const [isReady, setIsReady] = useState(shouldSkipSplash);

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
