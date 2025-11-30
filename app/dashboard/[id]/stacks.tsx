import { OutlinedText } from '@/components/OutlinedText';
import { StackCard } from '@/components/StackCard';
import { Colors } from '@/constants/Colors';
import api from '@/services/api';
import { useStackFilterStore } from '@/store/stackFilterStore';
import { Stack } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

export default function StacksScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [stacks, setStacks] = useState<Stack[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const { hiddenStacks, toggleStack, isStackHidden } = useStackFilterStore();

    useEffect(() => {
        fetchStacks();
    }, [id]);

    const fetchStacks = async () => {
        try {
            const response = await api.get('/api/stacks', {
                params: {
                    filters: JSON.stringify({ EndpointID: Number(id) })
                }
            });

            let endpointStacks = response.data;
            if (Array.isArray(response.data)) {
                endpointStacks = response.data.filter((s: Stack) => s.EndpointId === Number(id));
            }

            setStacks(endpointStacks);
        } catch (error: any) {
            try {
                const fallbackResponse = await api.get('/api/stacks');
                const filtered = fallbackResponse.data.filter((s: Stack) => s.EndpointId === Number(id));
                setStacks(filtered);
            } catch (fallbackError: any) {
                Alert.alert('Error', 'Failed to fetch stacks.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectStack = (stackId: number) => {
        router.push({
            pathname: '/stack/[id]',
            params: { id: stackId, endpointId: id },
        });
    };

    // Filter out hidden stacks
    const visibleStacks = stacks.filter(stack => !isStackHidden(stack.Id));

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.VividMagenta} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {showFilterMenu ? (
                <View style={styles.filterMenu}>
                    <View style={styles.filterHeader}>
                        <OutlinedText style={styles.filterTitle}>Filter Stacks</OutlinedText>
                        <TouchableOpacity onPress={() => setShowFilterMenu(false)}>
                            <OutlinedText style={styles.doneButton}>Done</OutlinedText>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={stacks}
                        keyExtractor={(item) => item.Id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.filterItem}>
                                <OutlinedText style={styles.filterStackName}>{item.Name}</OutlinedText>
                                <Switch
                                    value={!isStackHidden(item.Id)}
                                    onValueChange={() => toggleStack(item.Id)}
                                    trackColor={{ false: Colors.ErrorRed, true: Colors.SuccessGreen }}
                                    thumbColor={Colors.PureWhite}
                                />
                            </View>
                        )}
                        contentContainerStyle={styles.filterList}
                    />
                </View>
            ) : (
                <FlatList
                    data={visibleStacks}
                    keyExtractor={(item) => item.Id.toString()}
                    renderItem={({ item }) => (
                        <StackCard stack={item} onPress={handleSelectStack} />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <View>
                            <OutlinedText style={styles.headerTitle}>
                                Stacks ({visibleStacks.length}/{stacks.length})
                            </OutlinedText>
                            <TouchableOpacity
                                style={styles.filterButton}
                                onPress={() => setShowFilterMenu(true)}
                            >
                                <OutlinedText style={styles.filterButtonText}>
                                    🔍 Filter Stacks
                                </OutlinedText>
                            </TouchableOpacity>
                        </View>
                    }
                    ListEmptyComponent={
                        <OutlinedText style={styles.emptyText}>
                            {stacks.length > 0
                                ? 'All stacks are hidden. Use the filter to show them.'
                                : 'No stacks found for this environment.'}
                        </OutlinedText>
                    }
                />
            )}
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
        marginBottom: 12,
        textAlign: 'center',
    },
    filterButton: {
        backgroundColor: 'rgba(219, 39, 119, 0.2)',
        borderColor: Colors.VividMagenta,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        alignItems: 'center',
    },
    filterButtonText: {
        color: Colors.VividMagenta,
        fontSize: 16,
    },
    filterMenu: {
        flex: 1,
        backgroundColor: Colors.DeepDarkPurple,
    },
    filterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.VividMagenta,
    },
    filterTitle: {
        fontSize: 20,
        color: Colors.VividMagenta,
    },
    doneButton: {
        fontSize: 16,
        color: Colors.SuccessGreen,
    },
    filterList: {
        padding: 16,
    },
    filterItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        backgroundColor: 'rgba(219, 39, 119, 0.1)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.VividMagenta,
    },
    filterStackName: {
        flex: 1,
        fontSize: 16,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        opacity: 0.6,
    },
});
