import { EnvironmentCard } from '@/components/EnvironmentCard';
import { NeonButton } from '@/components/NeonButton';
import { OutlinedText } from '@/components/OutlinedText';
import { Colors } from '@/constants/Colors';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Endpoint } from '@/types';
import { Redirect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from 'react-native';

export default function EnvironmentSelectionScreen() {
    const router = useRouter();
    const { token, logout } = useAuthStore();
    const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Only fetch if we have authentication
        if (token) {
            fetchEndpoints();
        } else {
            // Just stop loading, Redirect will handle the navigation
            setLoading(false);
        }
    }, [token]);

    const fetchEndpoints = async () => {
        try {
            const response = await api.get('/api/endpoints');
            setEndpoints(response.data);
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 401) {
                Alert.alert('Session Expired', 'Please login again.');
                logout();
            } else {
                Alert.alert('Error', 'Failed to fetch environments.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEnvironment = (id: number) => {
        router.push(`/dashboard/${id}`);
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                onPress: () => {
                    logout();
                    router.replace('/auth/login');
                },
                style: 'destructive',
            },
        ]);
    };

    // Redirect to login if no token
    if (!token && !loading) {
        return <Redirect href="/auth/login" />;
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.VividMagenta} />
                <OutlinedText style={styles.loadingText}>Loading Environments...</OutlinedText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerBar}>
                <OutlinedText style={styles.headerTitle}>Select Environment</OutlinedText>
                <NeonButton
                    title="Logout"
                    onPress={handleLogout}
                    style={styles.logoutButton}
                />
            </View>
            <FlatList
                data={endpoints}
                keyExtractor={(item) => item.Id.toString()}
                renderItem={({ item }) => (
                    <EnvironmentCard endpoint={item} onPress={handleSelectEnvironment} />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <OutlinedText style={styles.emptyText}>No environments found.</OutlinedText>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DeepDarkPurple,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: Colors.DeepDarkPurple,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    headerBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.VividMagenta,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
    },
    logoutButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    listContent: {
        padding: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        opacity: 0.6,
    },
});
