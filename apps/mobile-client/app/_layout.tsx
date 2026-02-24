import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';

// Mantém a tela de splash visível durante o carregamento inicial de autenticação
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, userRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Remove a tela de splash quando o carregamento (sessão) for concluído
    // Pequeno delay para garantir uma transição suave e "premium"
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);

    // LOGICA DE REDIRECIONAMENTO (Movida para antes do cleanup return)
    if (!session) {
      // Sem sessão -> Tela de Login
      router.replace('/(auth)/login');
    } else {
      // Com sessão -> Verifica o tipo de conta (role)
      // Aguarde a role ser carregada antes de mover o usuário
      if (userRole === null) return;

      if (userRole === 'cliente') {
        router.replace('/(cliente)');
      } else if (userRole === 'motorista') {
        router.replace('/(motorista)');
      } else {
        // Fallback or generic role (could be redirected to setup or error)
        router.replace('/(cliente)');
      }
    }

    return () => clearTimeout(timer);
  }, [session, userRole, isLoading]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(cliente)" />
        <Stack.Screen name="(motorista)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
