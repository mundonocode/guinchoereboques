import { Tabs } from 'expo-router';
import { Navigation, Wallet, User } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function MotoristaLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#111', // Black theme for Guincheiro
                tabBarInactiveTintColor: '#999',
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: '#eee',
                    elevation: 0,
                    shadowOpacity: 0,
                    height: Platform.OS === 'ios' ? 88 : 64,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Mapa',
                    tabBarIcon: ({ color }) => <Navigation size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="earnings"
                options={{
                    title: 'Ganhos',
                    tabBarIcon: ({ color }) => <Wallet size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color }) => <User size={24} color={color} />,
                }}
            />
            {/* Esconder a rota de onboarding das tabs */}
            <Tabs.Screen
                name="onboarding"
                options={{
                    href: null,
                }}
            />
            {/* Esconder a rota de manage-vehicles das tabs */}
            <Tabs.Screen
                name="manage-vehicles"
                options={{
                    href: null,
                }}
            />
            {/* Esconder a rota de gerenciar documentos das tabs */}
            <Tabs.Screen
                name="manage-documents"
                options={{
                    href: null,
                }}
            />
            {/* Esconder a rota de editar perfil das tabs */}
            <Tabs.Screen
                name="edit-profile"
                options={{
                    href: null,
                }}
            />
            {/* Esconder a rota de ajustes das tabs */}
            <Tabs.Screen
                name="app-settings"
                options={{
                    href: null,
                }}
            />
            {/* Esconder o fluxo do active ride das tabs */}
            <Tabs.Screen
                name="active-ride/[id]"
                options={{
                    href: null,
                    tabBarStyle: { display: 'none' }
                }}
            />
            <Tabs.Screen
                name="active-ride/checklist"
                options={{
                    href: null,
                    tabBarStyle: { display: 'none' }
                }}
            />
        </Tabs>
    );
}
