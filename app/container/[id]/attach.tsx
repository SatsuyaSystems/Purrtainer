import { NeonButton } from '@/components/NeonButton';
import { OutlinedText } from '@/components/OutlinedText';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Utility function to strip ANSI escape codes from terminal output
const stripAnsiCodes = (text: string): string => {
    if (!text) return text;
    // Remove various ANSI escape sequences:
    // - CSI sequences: ESC [ ... (numbers, semicolons) ... letter
    // - OSC sequences: ESC ] ... BEL/ST
    // - Other escape sequences
    return text
        .replace(/\x1b\[[0-9;]*[a-zA-Z]?/g, '')      // CSI sequences
        .replace(/\u001b\[[0-9;]*[a-zA-Z]?/g, '')    // Unicode ESC variants
        .replace(/\x1b\][^\x07]*(\x07|\x1b\\)/g, '') // OSC sequences
        .replace(/\u001b\][^\u0007]*(\u0007|\u001b\\)/g, '') // Unicode OSC
        .replace(/\x1b[()][AB0UK]/g, '');             // Character set selection
};

export default function AttachScreen() {
    const { id, endpointId, containerName } = useLocalSearchParams();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { serverUrl, token, jwtToken } = useAuthStore();
    const [command, setCommand] = useState('');
    const [output, setOutput] = useState('');
    const [isAttached, setIsAttached] = useState(false);
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const inputRef = useRef<TextInput>(null);
    const [showInput, setShowInput] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (containerName) {
            navigation.setOptions({
                title: `Attach - ${containerName}`,
                headerShown: false,
            });
        }
    }, [containerName, navigation]);

    useEffect(() => {
        if (isAttached && showInput) {
            inputRef.current?.focus();
        }
    }, [isAttached, showInput]);

    const handleAttach = async () => {
        setLoading(true);
        try {
            setOutput('Connecting to container...\n$ ');
            setIsAttached(true);
        } catch (error: any) {
            console.error('Attach error:', error);
            Alert.alert('Error', 'Failed to attach to container.');
        } finally {
            setLoading(false);
        }
    };

    const handleRunCommand = async () => {
        if (!command.trim()) return;
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            Alert.alert('Error', 'WebSocket not connected. Please reconnect.');
            return;
        }

        setLoading(true);
        setOutput((prev) => prev + command + '\n');
        const currentCommand = command;
        setCommand('');

        try {
            // Send command through WebSocket
            wsRef.current.send(currentCommand + '\n');
        } catch (error: any) {
            let errorMsg = '[Error executing command]\n$ ';
            if (error.message) {
                errorMsg = `[Error: ${error.message}]\n$ `;
            }
            setOutput((prev) => prev + errorMsg);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const connectWebSocket = () => {
        if (!serverUrl || !endpointId || !id) {
            Alert.alert('Error', 'Missing required parameters');
            return;
        }

        // WebSocket requires JWT token, not API token
        const wsTokenToUse = jwtToken || token;
        if (!wsTokenToUse) {
            Alert.alert('Error', 'No authentication token available for WebSocket');
            return;
        }

        try {
            // Convert http/https to ws/wss and handle port
            const wsUrl = new URL(serverUrl);
            const protocol = wsUrl.protocol === 'https:' ? 'wss' : 'ws';
            const host = wsUrl.host; // includes port if present
            
            console.log('=== WebSocket Connection Debug ===');
            console.log('Server URL:', serverUrl);
            console.log('Protocol:', protocol);
            console.log('Host:', host);
            console.log('Endpoint ID:', endpointId);
            console.log('Using JWT token?', !!jwtToken);
            console.log('Token type:', typeof wsTokenToUse);
            console.log('Token length:', wsTokenToUse?.length);
            console.log('Token first 30 chars:', wsTokenToUse?.substring(0, 30));
            
            // Use the correct /websocket/attach endpoint from Portainer API
            // Container ID is sent as first message AFTER connection, not in URL
            const containerId = Array.isArray(id) ? id[0] : id;
            console.log('Container ID (original):', id);
            console.log('Container ID (processed):', containerId);
            console.log('Container ID length:', containerId?.length);
            
            // JWT tokens MUST be URL-encoded because they contain dots and special chars
            const encodedToken = encodeURIComponent(wsTokenToUse);
            console.log('Encoded token length:', encodedToken.length);
            console.log('Encoded token first 50 chars:', encodedToken.substring(0, 50));
            
            // Per Swagger spec, /websocket/attach takes endpointId and token
            // Try adding container ID as parameter (even though not in spec)
            const wsEndpoint = `${protocol}://${host}/api/websocket/attach?endpointId=${endpointId}&token=${encodedToken}&id=${containerId}`;
            
            console.log('Full WebSocket URL (first 200):', wsEndpoint.substring(0, 200));
            console.log('URL length:', wsEndpoint.length);
            console.log('=== Starting WebSocket Connection ===');
            
            const ws = new WebSocket(wsEndpoint);
            
            console.log('WebSocket created, readyState:', ws.readyState);
            
            // Set a timeout for connection
            const connectionTimeout = setTimeout(() => {
                console.log('Timeout check - readyState:', ws.readyState);
                if (ws.readyState === WebSocket.CONNECTING) {
                    console.warn('WebSocket connection timeout - force closing');
                    ws.close();
                    Alert.alert('Connection Timeout', 'WebSocket took too long to connect.');
                }
            }, 5000);
            
            ws.onopen = () => {
                clearTimeout(connectionTimeout);
                console.log('=== WebSocket OPENED ===');
                console.log('Connected! readyState:', ws.readyState);
                // DON'T send container ID - it's already in the URL parameter
                setOutput('');
                wsRef.current = ws;
            };
            
            ws.onmessage = (event) => {
                console.log('=== WebSocket MESSAGE ===');
                
                let messageData = '';
                
                if (event.data instanceof ArrayBuffer) {
                    const view = new Uint8Array(event.data);
                    messageData = new TextDecoder('utf-8').decode(view);
                } else if (event.data instanceof Blob) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        if (typeof reader.result === 'string') {
                            const cleanedData = stripAnsiCodes(reader.result);
                            setOutput((prev) => prev + cleanedData);
                        }
                    };
                    reader.readAsText(event.data);
                    return;
                } else {
                    messageData = event.data;
                }
                
                console.log('Message length:', messageData?.length);
                console.log('Raw message:', JSON.stringify(messageData?.substring(0, 100)));
                
                // Strip ANSI codes and display
                if (messageData) {
                    const cleanedData = stripAnsiCodes(messageData);
                    console.log('After stripping ANSI:', JSON.stringify(cleanedData.substring(0, 100)));
                    setOutput((prev) => prev + cleanedData);
                }
            };
            
            ws.onerror = (error) => {
                clearTimeout(connectionTimeout);
                console.log('=== WebSocket ERROR ===');
                console.log('Error type:', (error as any).type);
                console.log('Error bubbles:', (error as any).bubbles);
                console.log('ReadyState at error:', ws.readyState);
                console.log('URL that failed:', ws.url);
                Alert.alert(
                    'Connection Error',
                    'Failed to connect to container WebSocket. Check logs for details.'
                );
            };
            
            ws.onclose = (event) => {
                clearTimeout(connectionTimeout);
                console.log('=== WebSocket CLOSED ===');
                console.log('Close code:', event.code);
                console.log('Close reason:', event.reason);
                console.log('Was clean?', event.wasClean);
                setIsAttached(false);
                setOutput((prev) => prev + '\n[Connection closed]');
                wsRef.current = null;
            };
            
        } catch (error: any) {
            console.error('=== WebSocket Setup Exception ===');
            console.error('Exception message:', error.message);
            console.error('Exception stack:', error.stack);
            Alert.alert('Error', error.message || 'Failed to setup WebSocket connection');
        }
    };

    useEffect(() => {
        if (isAttached && !wsRef.current) {
            connectWebSocket();
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [isAttached]);

    const handleDetach = () => {
        setIsAttached(false);
        setOutput('');
        setCommand('');
        setShowInput(false);
    };

    const handleConsolePress = () => {
        setShowInput(!showInput);
        if (!showInput) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    if (loading && !isAttached) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.VividMagenta} />
                <OutlinedText style={styles.loadingText}>Attaching...</OutlinedText>
            </View>
        );
    }

    if (!isAttached) {
        return (
            <View style={styles.container}>
                <OutlinedText style={styles.title}>Container Attach</OutlinedText>
                <OutlinedText style={styles.description}>
                    Attach to the container and run commands interactively.
                    {'\n\n'}
                    This combines viewing output and executing commands.
                </OutlinedText>
                <NeonButton
                    title="Attach"
                    onPress={handleAttach}
                    style={styles.attachButton}
                />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        >
            <View style={styles.header}>
                <OutlinedText style={styles.headerTitle}>Attached</OutlinedText>
                <NeonButton
                    title="Detach"
                    onPress={handleDetach}
                    style={styles.detachButton}
                />
            </View>

            <TouchableOpacity
                onPress={handleConsolePress}
                activeOpacity={0.7}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.outputContainer}
                    ref={scrollViewRef}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    <Text style={styles.outputText}>{output}</Text>
                </ScrollView>
            </TouchableOpacity>
            {showInput && (
                <View style={styles.inputSection}>
                    <View style={styles.inputLine}>
                        <TextInput
                            ref={inputRef}
                            style={styles.input}
                            value={command}
                            onChangeText={setCommand}
                            autoCapitalize="none"
                            autoCorrect={false}
                            onSubmitEditing={handleRunCommand}
                            editable={!loading}
                            placeholder={loading ? "Running..." : "Enter command"}
                            placeholderTextColor="rgba(255, 255, 255, 0.3)"
                        />
                    </View>
                    <OutlinedText style={styles.hint}>
                        Tap console to close input
                    </OutlinedText>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DeepDarkPurple,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.DeepDarkPurple,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: Colors.VividMagenta,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        color: Colors.PureWhite,
    },
    description: {
        fontSize: 14,
        color: Colors.LightGray,
        marginBottom: 24,
        lineHeight: 20,
    },
    attachButton: {
        marginTop: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.PureWhite,
    },
    detachButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    outputContainer: {
        flex: 1,
        backgroundColor: Colors.DarkBackground,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: Colors.VividMagenta,
    },
    outputText: {
        color: Colors.PureWhite,
        fontSize: 12,
        fontFamily: 'monospace',
        lineHeight: 18,
    },
    inputLine: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 0,
        marginBottom: 8,
    },
    inputSection: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: Colors.DeepDarkPurple,
        borderTopWidth: 1,
        borderTopColor: Colors.VividMagenta,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.DarkBackground,
        color: Colors.PureWhite,
        borderColor: Colors.VividMagenta,
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        fontFamily: 'monospace',
        marginLeft: 4,
    },
    hint: {
        fontSize: 12,
        color: Colors.VividMagenta,
        textAlign: 'center',
        paddingVertical: 8,
        fontStyle: 'italic',
    },
});


