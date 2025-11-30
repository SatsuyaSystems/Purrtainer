import { ContainerCard } from '@/components/ContainerCard';
import { NeonButton } from '@/components/NeonButton';
import { OutlinedText } from '@/components/OutlinedText';
import { Colors } from '@/constants/Colors';
import api from '@/services/api';
import { Container } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TextInput, View } from 'react-native';

export default function DashboardScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [containers, setContainers] = useState<Container[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchContainers();
    }, [id]);

    const fetchContainers = async () => {
        try {
            const response = await api.get(`/api/endpoints/${id}/docker/containers/json?all=1`);
            setContainers(response.data);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch containers.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchContainers();
    };

    const handleSelectContainer = (containerId: string) => {
        router.push({
            pathname: '/container/[id]',
            params: { id: containerId, endpointId: id },
        });
    };

    // Filter containers based on search query
    const filteredContainers = containers.filter((container) => {
        const name = container.Names[0]?.replace(/^\//, '') || '';
        const image = container.Image || '';
        const query = searchQuery.toLowerCase();
        return name.toLowerCase().includes(query) || image.toLowerCase().includes(query);
    });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.VividMagenta} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredContainers}
                keyExtractor={(item) => item.Id}
                renderItem={({ item }) => (
                    <ContainerCard container={item} onPress={handleSelectContainer} />
                )}
                contentContainerStyle={styles.listContent}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListHeaderComponent={
                    <View>
                        <OutlinedText style={styles.headerTitle}>Containers</OutlinedText>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search containers..."
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <NeonButton
                            title="View Stacks"
                            onPress={() => router.push({ pathname: '/dashboard/[id]/stacks', params: { id } })}
                            style={styles.stacksButton}
                        />
                    </View>
                }
                ListEmptyComponent={
                    <OutlinedText style={styles.emptyText}>No containers found.</OutlinedText>
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
    listContent: {
        padding: 16,
    },
    headerTitle: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
    },
    searchInput: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderColor: Colors.VividMagenta,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        color: Colors.PureWhite,
        fontSize: 16,
        marginBottom: 16,
    },
    stacksButton: {
        marginBottom: 20,
        backgroundColor: '#4B0082', // Indigo
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        opacity: 0.6,
    },
});
