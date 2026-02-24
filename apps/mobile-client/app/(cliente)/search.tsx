import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useLocation } from '../../src/hooks/useLocation';

const { width } = Dimensions.get('window');
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function ClienteSearchModal() {
    const router = useRouter();
    const { location } = useLocation();

    // Prepare query parameters with location bias if available
    const queryParams: any = {
        key: GOOGLE_MAPS_API_KEY,
        language: 'pt-BR',
        components: 'country:br', // Limit to Brazil
    };

    if (location) {
        // Bias results to a ~50km radius around the user
        queryParams.location = `${location.coords.latitude},${location.coords.longitude}`;
        queryParams.radius = '50000';
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color="#111827" size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <GooglePlacesAutocomplete
                    placeholder="Para onde vamos levar o veículo?"
                    onPress={(data, details = null) => {
                        if (details) {
                            // Convert back to index with the selected destination parameters
                            router.replace({
                                pathname: '/(cliente)',
                                params: {
                                    destinationLat: details.geometry.location.lat,
                                    destinationLng: details.geometry.location.lng,
                                    destinationAddress: data.description,
                                }
                            });
                        }
                    }}
                    query={queryParams}
                    fetchDetails={true}
                    styles={{
                        textInputContainer: styles.textInputContainer,
                        textInput: styles.textInput,
                        listView: styles.listView,
                        row: styles.row,
                        separator: styles.separator,
                        description: styles.description,
                    }}
                    textInputProps={{
                        placeholderTextColor: '#9CA3AF',
                        autoFocus: true,
                    }}
                    debounce={300} // Prevent spamming Google API
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: 50, // Safe area approx
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    searchContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    textInputContainer: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderTopWidth: 0,
        borderBottomWidth: 0,
    },
    textInput: {
        height: 48,
        fontSize: 16,
        color: '#111827',
        backgroundColor: 'transparent',
    },
    listView: {
        backgroundColor: '#FFFFFF',
    },
    row: {
        paddingVertical: 16,
        paddingHorizontal: 4,
        flexDirection: 'row',
    },
    separator: {
        height: 1,
        backgroundColor: '#F3F4F6',
    },
    description: {
        fontSize: 15,
        color: '#374151',
    }
});
