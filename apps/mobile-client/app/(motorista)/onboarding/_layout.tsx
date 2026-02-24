import { Stack } from 'expo-router';

export default function OnboardingLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: '#111' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Stack.Screen
                name="step1-personal"
                options={{
                    title: '1. Cadastro Profissional',
                    headerLeft: () => null,
                }}
            />
            <Stack.Screen
                name="step2-recebimentos"
                options={{
                    title: '2. Recebimentos',
                }}
            />
            <Stack.Screen
                name="step3-documents"
                options={{
                    title: '3. Envio de Documentos',
                }}
            />
        </Stack>
    );
}
