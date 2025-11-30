import { OutlinedText } from '@/components/OutlinedText';
import { Colors } from '@/constants/Colors';
import api from '@/services/api';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

export default function ConsoleScreen() {
    const { id, endpointId } = useLocalSearchParams();
    const [command, setCommand] = useState('');
    const [output, setOutput] = useState('$ Welcome to container console\n');
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const inputRef = useRef<TextInput>(null);

    // Auto-focus input when screen loads
    useEffect(() => {
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const handleRunCommand = async () => {
        if (!command.trim()) return;

        setLoading(true);
        setOutput((prev) => prev + `$ ${command}\n`);
        const currentCommand = command;
        setCommand('');

        try {
            // 1. Create Exec Instance
            const createExecRes = await api.post(
                `/api/endpoints/${endpointId}/docker/containers/${id}/exec`,
                {
                    AttachStdout: true,
                    AttachStderr: true,
                    Tty: false,
                    Cmd: ['/bin/sh', '-c', currentCommand],
                }
            );

            const execId = createExecRes.data.Id;
            console.log('Exec ID created:', execId);

            // 2. Start Exec Instance
            const startExecRes = await api.post(
                `/api/endpoints/${endpointId}/docker/exec/${execId}/start`,
                {
                    Detach: false,
                    Tty: false,
                },
                {
                    responseType: 'text',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Append output
            const result = startExecRes.data || '(no output)';
            setOutput((prev) => prev + result + '\n');

        } catch (error: any) {
            console.error('Console error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            let errorMsg = '[Error executing command';
            if (error.response?.status === 403) {
                errorMsg = '[Permission denied - check container exec permissions';
            } else if (error.response?.status === 404) {
                errorMsg = '[Container or exec session not found';
            } else if (error.response?.data) {
                errorMsg = `[Error: ${error.response.data}`;
            }
            errorMsg += ']\n';

            setOutput((prev) => prev + errorMsg);
            Alert.alert('Exec Error', 'Failed to execute command. Check console for details.');
        } finally {
            setLoading(false);
            // Refocus input
            inputRef.current?.focus();
        }
    };

    return (
        <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
            <View style={styles.container}>
                <OutlinedText style={styles.title}>Console (Exec)</OutlinedText>

                <ScrollView
                    style={styles.outputContainer}
                    ref={scrollViewRef}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    <Text style={styles.outputText}>{output}</Text>
                    <View style={styles.inputLine}>
                        <Text style={styles.prompt}>$ </Text>
                        <TextInput
                            ref={inputRef}
                            style={styles.input}
                            value={command}
                            onChangeText={setCommand}
                            autoCapitalize="none"
                            autoCorrect={false}
                            onSubmitEditing={handleRunCommand}
                            editable={!loading}
                            placeholder={loading ? "Processing..." : "type command and press enter"}
                            placeholderTextColor="rgba(255, 255, 255, 0.3)"
                        />
                    </View>
                </ScrollView>
            </View>
        </TouchableWithoutFeedback>
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
    outputContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: 8,
        padding: 10,
        borderColor: Colors.VividMagenta,
        borderWidth: 1,
    },
    outputText: {
        color: Colors.SuccessGreen,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 12,
    },
    inputLine: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    prompt: {
        color: Colors.VividMagenta,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 12,
        fontWeight: 'bold',
    },
    input: {
        flex: 1,
        color: Colors.PureWhite,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 12,
        padding: 0,
        margin: 0,
    },
});
