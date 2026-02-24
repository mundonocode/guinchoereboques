import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, Map, Moon, Bell, Maximize, Navigation, MapPin } from 'lucide-react-native';

export default function AppSettingsScreen() {
    const router = useRouter();

    // Rotas e Navegação (Opção A)
    const [gpsPreferido, setGpsPreferido] = useState('waze'); // waze, maps, apple
    const [raioAtuacao, setRaioAtuacao] = useState('30'); // 30, 50, ilimitado
    const [darkMode, setDarkMode] = useState(false);

    // Alertas e Corridas (Opção B)
    const [alarmePersistente, setAlarmePersistente] = useState(true);
    const [piscarTela, setPiscarTela] = useState(false);

    useEffect(() => {
        carregarConfiguracoes();
    }, []);

    const carregarConfiguracoes = async () => {
        try {
            const keys = ['@gps_preferido', '@raio_atuacao', '@dark_mode', '@alarme_persistente', '@piscar_tela'];
            const valores = await AsyncStorage.multiGet(keys);

            valores.forEach(([chave, valor]) => {
                if (valor !== null) {
                    switch (chave) {
                        case '@gps_preferido': setGpsPreferido(valor); break;
                        case '@raio_atuacao': setRaioAtuacao(valor); break;
                        case '@dark_mode': setDarkMode(valor === 'true'); break;
                        case '@alarme_persistente': setAlarmePersistente(valor === 'true'); break;
                        case '@piscar_tela': setPiscarTela(valor === 'true'); break;
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao carregar configurações', error);
        }
    };

    const salvarConfiguracao = async (chave: string, valor: string) => {
        try {
            await AsyncStorage.setItem(chave, valor);
        } catch (error) {
            console.error(`Erro ao salvar ${chave}`, error);
        }
    };

    const toggleDarkMode = (value: boolean) => {
        setDarkMode(value);
        salvarConfiguracao('@dark_mode', String(value));
    };

    const toggleAlarme = (value: boolean) => {
        setAlarmePersistente(value);
        salvarConfiguracao('@alarme_persistente', String(value));
    };

    const togglePiscar = (value: boolean) => {
        setPiscarTela(value);
        salvarConfiguracao('@piscar_tela', String(value));
    };

    const selecionarGps = (gps: string) => {
        setGpsPreferido(gps);
        salvarConfiguracao('@gps_preferido', gps);
    };

    const selecionarRaio = (raio: string) => {
        setRaioAtuacao(raio);
        salvarConfiguracao('@raio_atuacao', raio);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.replace('/(motorista)/profile')} style={styles.backButton}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ajustes do App</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>

                {/* SESSÃO DE ROTAS */}
                <Text style={styles.sectionTitle}>Rotas e Navegação</Text>
                <View style={styles.card}>

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Map color="#4B5563" size={20} style={styles.settingIcon} />
                            <View>
                                <Text style={styles.settingTitle}>GPS Padrão</Text>
                                <Text style={styles.settingDesc}>Abrir rotas automaticamente neste app</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.optionsRowButtonGroup}>
                        <TouchableOpacity
                            style={[styles.segmentBtn, gpsPreferido === 'waze' && styles.segmentBtnActive]}
                            onPress={() => selecionarGps('waze')}
                        >
                            <Text style={[styles.segmentBtnText, gpsPreferido === 'waze' && styles.segmentBtnTextActive]}>Waze</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.segmentBtn, gpsPreferido === 'maps' && styles.segmentBtnActive]}
                            onPress={() => selecionarGps('maps')}
                        >
                            <Text style={[styles.segmentBtnText, gpsPreferido === 'maps' && styles.segmentBtnTextActive]}>Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.segmentBtn, gpsPreferido === 'apple' && styles.segmentBtnActive]}
                            onPress={() => selecionarGps('apple')}
                        >
                            <Text style={[styles.segmentBtnText, gpsPreferido === 'apple' && styles.segmentBtnTextActive]}>Apple</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <MapPin color="#4B5563" size={20} style={styles.settingIcon} />
                            <View>
                                <Text style={styles.settingTitle}>Raio Máximo de Atuação</Text>
                                <Text style={styles.settingDesc}>Não receber chamadas além desta distância</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.optionsRowButtonGroup}>
                        <TouchableOpacity
                            style={[styles.segmentBtn, raioAtuacao === '30' && styles.segmentBtnActive]}
                            onPress={() => selecionarRaio('30')}
                        >
                            <Text style={[styles.segmentBtnText, raioAtuacao === '30' && styles.segmentBtnTextActive]}>30 km</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.segmentBtn, raioAtuacao === '50' && styles.segmentBtnActive]}
                            onPress={() => selecionarRaio('50')}
                        >
                            <Text style={[styles.segmentBtnText, raioAtuacao === '50' && styles.segmentBtnTextActive]}>50 km</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.segmentBtn, raioAtuacao === 'ilimitado' && styles.segmentBtnActive]}
                            onPress={() => selecionarRaio('ilimitado')}
                        >
                            <Text style={[styles.segmentBtnText, raioAtuacao === 'ilimitado' && styles.segmentBtnTextActive]}>Ilimitado</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.settingRowToggle}>
                        <View style={styles.settingInfo}>
                            <Moon color="#4B5563" size={20} style={styles.settingIcon} />
                            <View>
                                <Text style={styles.settingTitle}>Forçar Modo Escuro</Text>
                                <Text style={styles.settingDesc}>Ideal para não ofuscar a visão à noite</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: "#D1D5DB", true: "#111" }}
                            thumbColor={"#FFFFFF"}
                            onValueChange={toggleDarkMode}
                            value={darkMode}
                        />
                    </View>

                </View>

                {/* SESSÃO DE ALERTAS */}
                <Text style={styles.sectionTitle}>Alertas e Urgência</Text>
                <View style={styles.card}>

                    <View style={styles.settingRowToggle}>
                        <View style={styles.settingInfo}>
                            <Bell color="#4B5563" size={20} style={styles.settingIcon} />
                            <View style={{ flex: 1, paddingRight: 10 }}>
                                <Text style={styles.settingTitle}>Alarme Persistente</Text>
                                <Text style={styles.settingDesc}>Tocar som sem parar até aceitar/recusar a chamada (ignora modo silencioso)</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: "#D1D5DB", true: "#111" }}
                            thumbColor={"#FFFFFF"}
                            onValueChange={toggleAlarme}
                            value={alarmePersistente}
                        />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.settingRowToggle}>
                        <View style={styles.settingInfo}>
                            <Maximize color="#4B5563" size={20} style={styles.settingIcon} />
                            <View style={{ flex: 1, paddingRight: 10 }}>
                                <Text style={styles.settingTitle}>Piscar Tela</Text>
                                <Text style={styles.settingDesc}>Piscar a tela brilhante ao receber uma nova viagem</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: "#D1D5DB", true: "#111" }}
                            thumbColor={"#FFFFFF"}
                            onValueChange={togglePiscar}
                            value={piscarTela}
                        />
                    </View>

                </View>

                <View style={styles.infoFooter}>
                    <Text style={styles.infoFooterText}>
                        Essas configurações são salvas automaticamente apenas neste dispositivo.
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    container: {
        flexGrow: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
        paddingHorizontal: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    settingRow: {
        padding: 16,
    },
    settingRowToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingIcon: {
        marginRight: 12,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    settingDesc: {
        fontSize: 13,
        color: '#6B7280',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginHorizontal: 16,
    },
    optionsRowButtonGroup: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 8,
    },
    segmentBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    segmentBtnActive: {
        backgroundColor: '#DCFCE7',
        borderColor: '#111',
    },
    segmentBtnText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4B5563',
    },
    segmentBtnTextActive: {
        color: '#166534',
        fontWeight: '700',
    },
    infoFooter: {
        marginTop: 8,
        alignItems: 'center',
    },
    infoFooterText: {
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
    }
});
