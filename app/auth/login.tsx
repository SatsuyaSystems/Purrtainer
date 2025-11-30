import { NeonButton } from '@/components/NeonButton';
import { NeonCard } from '@/components/NeonCard';
import { OutlinedText } from '@/components/OutlinedText';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function LoginScreen() {
    const router = useRouter();
    const { setToken, setJwtToken, setServerUrl } = useAuthStore();

    const [url, setUrl] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!url) {
            Alert.alert('Error', 'Please enter server URL');
            return;
        }

        if (!username || !password || !apiKey) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            // Save server URL first
            setServerUrl(url);

            // Send auth request WITHOUT withCredentials to avoid CSRF checks
            // The API should accept API Key authentication
            const response = await axios.post(
                `${url}/api/auth`,
                {
                    username: username,
                    password: password,
                    apiKey: apiKey,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000,
                    // DO NOT use withCredentials - this triggers CSRF protection
                    withCredentials: false,
                }
            );

            if (response.data && response.data.jwt) {
                // Store JWT for WebSocket and HTTP requests
                setJwtToken(response.data.jwt);
                setToken(response.data.jwt);
                router.replace('/');
            } else {
                Alert.alert('Login Failed', 'Invalid response from server');
            }
        } catch (error: any) {
            console.error('Auth error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            Alert.alert('Login Failed', error.response?.data?.message || error.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <OutlinedText style={styles.title}>PURRTAINER</OutlinedText>
                    <OutlinedText style={styles.subtitle}>Portainer Mobile Client</OutlinedText>
                </View>

                <NeonCard style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <OutlinedText style={styles.label}>Server URL</OutlinedText>
                        <TextInput
                            style={styles.input}
                            placeholder="http://192.168.1.10:9000"
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            value={url}
                            onChangeText={setUrl}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="url"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <OutlinedText style={styles.label}>Username</OutlinedText>
                        <TextInput
                            style={styles.input}
                            placeholder="admin"
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <OutlinedText style={styles.label}>Password</OutlinedText>
                        <TextInput
                            style={styles.input}
                            placeholder="********"
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <OutlinedText style={styles.label}>API Key</OutlinedText>
                        <TextInput
                            style={styles.input}
                            placeholder="paste your API key here"
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            value={apiKey}
                            onChangeText={setApiKey}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <NeonButton
                        title={loading ? "Connecting..." : "Connect"}
                        onPress={handleLogin}
                        disabled={loading}
                        style={styles.button}
                    />
                </NeonCard>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DeepDarkPurple,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 40,
        color: Colors.VividMagenta,
        marginBottom: 10,
        textShadowColor: Colors.VividMagenta,
        textShadowRadius: 10,
    },
    subtitle: {
        fontSize: 18,
        opacity: 0.8,
    },
    formCard: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 20,
    },
    toggleSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.VividMagenta,
    },
    toggleLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    toggleActive: {
        color: Colors.VividMagenta,
        fontWeight: 'bold',
    },
    label: {
        marginBottom: 8,
        fontSize: 14,
    },
    input: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderColor: Colors.VividMagenta,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        color: Colors.PureWhite,
        fontSize: 16,
    },
    button: {
        marginTop: 10,
    },
});
