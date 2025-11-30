import { NeonButton } from '@/components/NeonButton';
import { NeonCard } from '@/components/NeonCard';
import { OutlinedText } from '@/components/OutlinedText';
import { Colors } from '@/constants/Colors';
import api from '@/services/api';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';

export default function ContainerDetailsScreen() {
    const { id, endpointId } = useLocalSearchParams();
    const router = useRouter();
    const navigation = useNavigation();
    const [container, setContainer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchContainerDetails();
    }, [id, endpointId]);

    useEffect(() => {
        if (container) {
            const name = container.Name.replace(/^\//, '');
            navigation.setOptions({ title: name });
        }
    }, [container, navigation]);

    const fetchContainerDetails = async () => {
        try {
            const response = await api.get(`/api/endpoints/${endpointId}/docker/containers/${id}/json`);
            setContainer(response.data);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch container details.');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: string) => {
        setActionLoading(true);
        try {
            console.log(`Attempting ${action} on container ${id} on endpoint ${endpointId}`);
            const endpoint = `/api/endpoints/${endpointId}/docker/containers/${id}/${action}`;
            console.log('Endpoint:', endpoint);
            
            let response;
            if (action === 'start') {
                // Start action requires empty body, not JSON
                response = await api.post(endpoint, null, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: null
                });
            } else {
                response = await api.post(endpoint);
            }
            
            console.log('Response:', response.data);
            Alert.alert('Success', `Container ${action}ed successfully.`);
            fetchContainerDetails();
        } catch (error: any) {
            console.error('Action error:', error);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            console.error('Error message:', error.message);
            Alert.alert('Error', `Failed to ${action} container. ${error.response?.data?.message || error.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.VividMagenta} />
            </View>
        );
    }

    if (!container) {
        return (
            <View style={styles.container}>
                <OutlinedText>Container not found.</OutlinedText>
            </View>
        );
    }

    const isRunning = container.State.Running;
    const name = container.Name.replace(/^\//, '');

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <OutlinedText style={styles.title}>{name}</OutlinedText>

            <NeonCard style={styles.infoCard}>
                <View style={styles.row}>
                    <OutlinedText style={styles.label}>State:</OutlinedText>
                    <OutlinedText style={[styles.value, { color: isRunning ? Colors.SuccessGreen : Colors.ErrorRed }]}>
                        {container.State.Status.toUpperCase()}
                    </OutlinedText>
                </View>
                <View style={styles.row}>
                    <OutlinedText style={styles.label}>Image:</OutlinedText>
                    <OutlinedText style={styles.value}>{container.Config.Image}</OutlinedText>
                </View>
                <View style={styles.row}>
                    <OutlinedText style={styles.label}>IP Address:</OutlinedText>
                    <OutlinedText style={styles.value}>
                        {container.NetworkSettings.IPAddress || 'N/A'}
                    </OutlinedText>
                </View>
            </NeonCard>

            <View style={styles.actions}>
                <View style={styles.secondaryActions}>
                    <NeonButton
                        title="Attach"
                        onPress={() => router.push({ pathname: '/container/[id]/attach', params: { id, endpointId, containerName: name } })}
                        style={[styles.button, styles.thirdButton, { backgroundColor: '#2E8B57' }]}
                    />
                    <NeonButton
                        title="Logs"
                        onPress={() => router.push({ pathname: '/container/[id]/logs', params: { id, endpointId } })}
                        style={[styles.button, styles.thirdButton, { backgroundColor: '#4B0082' }]}
                    />
                    <NeonButton
                        title="Console"
                        onPress={() => router.push({ pathname: '/container/[id]/console', params: { id, endpointId } })}
                        style={[styles.button, styles.thirdButton, { backgroundColor: '#4B0082' }]}
                    />
                </View>

                {isRunning ? (
                    <>
                        <NeonButton
                            title="Stop"
                            onPress={() => handleAction('stop')}
                            disabled={actionLoading}
                            style={[styles.button, { backgroundColor: Colors.ErrorRed }]}
                        />
                        <NeonButton
                            title="Restart"
                            onPress={() => handleAction('restart')}
                            disabled={actionLoading}
                            style={[styles.button, { backgroundColor: '#FFA500' }]}
                        />
                        <NeonButton
                            title="Kill"
                            onPress={() => handleAction('kill')}
                            disabled={actionLoading}
                            style={[styles.button, { backgroundColor: '#8B0000' }]}
                        />
                    </>
                ) : (
                    <NeonButton
                        title="Start"
                        onPress={() => handleAction('start')}
                        disabled={actionLoading}
                        style={[styles.button, { backgroundColor: Colors.SuccessGreen }]}
                    />
                )}
            </View>
        </ScrollView>
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
    content: {
        padding: 20,
    },
    title: {
        fontSize: 32,
        color: Colors.VividMagenta,
        marginBottom: 20,
        textAlign: 'center',
    },
    infoCard: {
        marginBottom: 30,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10,
        flexWrap: 'wrap',
    },
    label: {
        fontWeight: 'bold',
        marginRight: 10,
        minWidth: 80,
    },
    value: {
        flex: 1,
        opacity: 0.9,
    },
    actions: {
        gap: 16,
    },
    secondaryActions: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    button: {
        marginBottom: 10,
    },
    thirdButton: {
        flex: 1,
    },
});
