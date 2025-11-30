import { ContainerCard } from '@/components/ContainerCard';
import { NeonCard } from '@/components/NeonCard';
import { OutlinedText } from '@/components/OutlinedText';
import { Colors } from '@/constants/Colors';
import api from '@/services/api';
import { Container, Stack } from '@/types';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';

export default function StackDetailsScreen() {
    const { id, endpointId } = useLocalSearchParams();
    const router = useRouter();
    const navigation = useNavigation();
    const [stack, setStack] = useState<Stack | null>(null);
    const [containers, setContainers] = useState<Container[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStackDetails();
    }, [id]);

    useEffect(() => {
        if (stack) {
            navigation.setOptions({ title: stack.Name });
        }
    }, [stack, navigation]);

    const fetchStackDetails = async () => {
        try {
            const response = await api.get(`/api/stacks/${id}`);
            setStack(response.data);
            // Fetch containers after we have stack info
            await fetchStackContainers(response.data);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch stack details.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStackContainers = async (stackData: Stack) => {
        try {
            // Fetch all containers for this endpoint
            const response = await api.get(`/api/endpoints/${endpointId}/docker/containers/json?all=1`);
            const allContainers = response.data;

            // Filter containers that belong to this stack by checking labels
            const stackContainers = allContainers.filter((container: Container) => {
                const stackLabel = container.Labels?.['com.docker.compose.project'];
                const stackName = stackData.Name.toLowerCase();
                return stackLabel && stackLabel.toLowerCase().includes(stackName);
            });

            setContainers(stackContainers);
        } catch (error: any) {
            console.error('Error fetching containers:', error);
        }
    };

    const handleSelectContainer = (containerId: string) => {
        router.push({
            pathname: '/container/[id]',
            params: { id: containerId, endpointId },
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.VividMagenta} />
            </View>
        );
    }

    if (!stack) {
        return (
            <View style={styles.container}>
                <OutlinedText>Stack not found.</OutlinedText>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <OutlinedText style={styles.title}>{stack.Name}</OutlinedText>

            <NeonCard style={styles.infoCard}>
                <View style={styles.row}>
                    <OutlinedText style={styles.label}>Type:</OutlinedText>
                    <OutlinedText style={styles.value}>{stack.Type === 1 ? 'Compose' : 'Swarm'}</OutlinedText>
                </View>
                <View style={styles.row}>
                    <OutlinedText style={styles.label}>Status:</OutlinedText>
                    <OutlinedText style={[styles.value, { color: stack.Status === 1 ? Colors.SuccessGreen : Colors.ErrorRed }]}>
                        {stack.Status === 1 ? 'Active' : 'Inactive'}
                    </OutlinedText>
                </View>
                <View style={styles.row}>
                    <OutlinedText style={styles.label}>Created By:</OutlinedText>
                    <OutlinedText style={styles.value}>{stack.CreatedBy}</OutlinedText>
                </View>
            </NeonCard>

            <OutlinedText style={styles.sectionTitle}>Containers ({containers.length})</OutlinedText>
            {containers.length > 0 ? (
                containers.map((container) => (
                    <ContainerCard
                        key={container.Id}
                        container={container}
                        onPress={handleSelectContainer}
                    />
                ))
            ) : (
                <OutlinedText style={styles.emptyText}>No containers found for this stack.</OutlinedText>
            )}
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
    sectionTitle: {
        fontSize: 20,
        color: Colors.VividMagenta,
        marginTop: 20,
        marginBottom: 12,
    },
    emptyText: {
        textAlign: 'center',
        opacity: 0.6,
        fontStyle: 'italic',
    },
});
