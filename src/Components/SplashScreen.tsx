import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LogoIcon from "./LogoIcon";
import AppName from "./AppName";
import { ApiService, API_BASE_URL } from "@/Services/api";

type Props = {
  onReady: () => void;
};

export default function SplashScreen({ onReady }: Props) {
  const [statusText, setStatusText] = useState("Conectando ao servidor...");
  const [showRetry, setShowRetry] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.95)).current;

  // Animação de entrada e pulso contínuo sutil
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.96,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [fadeAnim, pulseAnim]);

  // Ciclo de health check
  useEffect(() => {
    let isMounted = true;
    let timer: ReturnType<typeof setTimeout>;
    const startTime = Date.now();

    const check = async () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);

      if (elapsed > 35) {
        setStatusText("Quase lá! Finalizando a inicialização do servidor...");
        setShowRetry(true);
      } else if (elapsed > 18) {
        setStatusText("O servidor estava em hibernação (Render). Aguarde alguns instantes...");
      } else if (elapsed > 7) {
        setStatusText("Despertando a API na nuvem...");
      } else {
        setStatusText("Conectando ao servidor...");
      }

      const isAlive = await ApiService.checkHealth(6000);

      if (!isMounted) return;

      if (isAlive) {
        setStatusText("Servidor online! Entrando...");
        setTimeout(() => {
          if (isMounted) onReady();
        }, 600);
      } else {
        // Se ainda não acordou, tenta de novo após 3 segundos
        timer = setTimeout(check, 3000);
      }
    };

    check();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [onReady, attemptCount]);

  const handleManualRetry = () => {
    setShowRetry(false);
    setStatusText("Tentando novamente agora...");
    setAttemptCount((prev) => prev + 1);
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <View style={styles.brand}>
          <LogoIcon size={80} />
          <View style={styles.nameWrap}>
            <AppName size={160} />
          </View>
        </View>

        <Text style={styles.tagline}>Gestão e Locação de Jogos de Tabuleiro</Text>
      </Animated.View>

      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#7965DB" style={styles.spinner} />
        <Text style={styles.statusText}>{statusText}</Text>
        <Text style={styles.apiUrlText}>API: {API_BASE_URL.replace(/https?:\/\//, "")}</Text>

        {showRetry && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleManualRetry}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Forçar nova tentativa</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0c10",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  nameWrap: {
    marginTop: 8,
  },
  tagline: {
    marginTop: 20,
    fontSize: 14,
    color: "#8a8f98",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  footer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  spinner: {
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: "#e2e8f0",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  apiUrlText: {
    fontSize: 11,
    color: "#525866",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 10,
    backgroundColor: "#7965DB",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
});
