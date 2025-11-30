import { Colors } from '@/constants/Colors';
import { Endpoint } from '@/types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { NeonCard } from './NeonCard';
import { OutlinedText } from './OutlinedText';

interface EnvironmentCardProps {
    endpoint: Endpoint;
    onPress: (id: number) => void;
}

export const EnvironmentCard: React.FC<EnvironmentCardProps> = ({ endpoint, onPress }) => {
    const isUp = endpoint.Status === 1;

    return (
        <TouchableOpacity onPress={() => onPress(endpoint.Id)} activeOpacity={0.8}>
            <NeonCard style={styles.card}>
                <View style={styles.header}>
                    <OutlinedText style={styles.name}>{endpoint.Name}</OutlinedText>
                    <View style={[styles.statusDot, { backgroundColor: isUp ? Colors.SuccessGreen : Colors.ErrorRed }]} />
                </View>
                <OutlinedText style={styles.url}>{endpoint.URL}</OutlinedText>
                <OutlinedText style={styles.type}>Type: {endpoint.Type}</OutlinedText>
            </NeonCard>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    name: {
        fontSize: 20,
        color: Colors.VividMagenta,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: Colors.PureWhite,
    },
    url: {
        fontSize: 14,
        color: Colors.PureWhite,
        opacity: 0.8,
        marginBottom: 4,
    },
    type: {
        fontSize: 12,
        color: Colors.PureWhite,
        opacity: 0.6,
    },
});
