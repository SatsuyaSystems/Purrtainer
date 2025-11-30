import { Colors } from '@/constants/Colors';
import { Container } from '@/types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { NeonCard } from './NeonCard';
import { OutlinedText } from './OutlinedText';

interface ContainerCardProps {
    container: Container;
    onPress: (id: string) => void;
}

export const ContainerCard: React.FC<ContainerCardProps> = ({ container, onPress }) => {
    const isRunning = container.State === 'running';
    const name = container.Names[0].replace(/^\//, '');

    // Format created date
    const createdDate = new Date(container.Created * 1000);
    const now = new Date();
    const diffMs = now.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const createdText = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;

    return (
        <TouchableOpacity onPress={() => onPress(container.Id)} activeOpacity={0.8}>
            <NeonCard style={styles.card}>
                <View style={styles.header}>
                    <OutlinedText style={styles.name}>{name}</OutlinedText>
                    <View style={[styles.statusDot, { backgroundColor: isRunning ? Colors.SuccessGreen : Colors.ErrorRed }]} />
                </View>
                <OutlinedText style={styles.image}>📦 {container.Image}</OutlinedText>
                <View style={styles.footer}>
                    <OutlinedText style={styles.status}>
                        {isRunning ? '▶ Running' : '⏸ Stopped'}
                    </OutlinedText>
                    <OutlinedText style={styles.created}>
                        🕐 {createdText}
                    </OutlinedText>
                </View>
                {container.Status && (
                    <OutlinedText style={styles.statusDetail}>{container.Status}</OutlinedText>
                )}
            </NeonCard>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        padding: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    name: {
        fontSize: 18,
        color: Colors.VividMagenta,
        flex: 1,
        marginRight: 8,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Colors.PureWhite,
    },
    image: {
        fontSize: 13,
        color: Colors.PureWhite,
        opacity: 0.8,
        marginBottom: 6,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    status: {
        fontSize: 12,
        color: Colors.PureWhite,
        opacity: 0.7,
    },
    created: {
        fontSize: 12,
        color: Colors.PureWhite,
        opacity: 0.6,
    },
    statusDetail: {
        fontSize: 11,
        color: Colors.PureWhite,
        opacity: 0.5,
        marginTop: 4,
    },
});
