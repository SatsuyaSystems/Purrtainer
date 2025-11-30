import { OutlinedText } from '@/components/OutlinedText';
import { Colors } from '@/constants/Colors';
import api from '@/services/api';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function LogsScreen() {
    const { id, endpointId } = useLocalSearchParams();
    const [logs, setLogs] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        fetchLogs();
    }, [id, endpointId]);

    const fetchLogs = async () => {
        try {
            // Fetch last 100 lines of stdout and stderr
            const response = await api.get(`/api/endpoints/${endpointId}/docker/containers/${id}/logs`, {
                params: {
                    stdout: 1,
                    stderr: 1,
                    tail: 100,
                    timestamps: 0,
                },
                responseType: 'text', // Logs come as text/stream
            });

            // Docker logs often have binary headers (8 bytes) per frame. 
            // For a simple MVP, we might just display raw text, or try to strip headers if they appear garbage.
            // Portainer API usually returns raw text if not using TTY, but let's see.
            // If response.data is a string, we just use it.
            setLogs(response.data);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch logs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <OutlinedText style={styles.title}>Container Logs</OutlinedText>
            {loading ? (
                <ActivityIndicator size="large" color={Colors.VividMagenta} />
            ) : (
                <ScrollView
                    style={styles.logsContainer}
                    ref={scrollViewRef}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    <Text style={styles.logText}>{logs || 'No logs found.'}</Text>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DeepDarkPurple,
        padding: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
    },
    logsContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 8,
        padding: 10,
        borderColor: Colors.VividMagenta,
        borderWidth: 1,
    },
    logText: {
        color: Colors.PureWhite,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 12,
    },
});
