import { Tabs } from 'expo-router';
import { MapPin, Clock, User } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function ClienteLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#111',
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
                    tabBarIcon: ({ color }) => <MapPin size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'Histórico',
                    tabBarIcon: ({ color }) => <Clock size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color }) => <User size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    href: null,
                    tabBarStyle: { display: 'none' }
                }}
            />
            <Tabs.Screen
                name="edit-profile"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="request-details"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="vehicle-problem"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="location-type"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="request-payment"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}
