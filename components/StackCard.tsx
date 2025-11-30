import { Colors } from '@/constants/Colors';
import { Stack } from '@/types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { NeonCard } from './NeonCard';
import { OutlinedText } from './OutlinedText';

interface StackCardProps {
    stack: Stack;
    onPress: (id: number) => void;
}

export const StackCard: React.FC<StackCardProps> = ({ stack, onPress }) => {
    const isActive = stack.Status === 1;
    const isCompose = stack.Type === 1;

    // Format dates
    const createdDate = new Date(stack.CreationDate * 1000);
    const updatedDate = new Date(stack.UpdateDate * 1000);
    const now = new Date();

    const formatTimestamp = (date: Date) => {
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 30) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <TouchableOpacity onPress={() => onPress(stack.Id)} activeOpacity={0.8}>
            <NeonCard style={styles.card}>
                <View style={styles.header}>
                    <OutlinedText style={styles.name}>{stack.Name}</OutlinedText>
                    <View style={[styles.statusDot, { backgroundColor: isActive ? Colors.SuccessGreen : Colors.ErrorRed }]} />
                </View>

                <View style={styles.infoRow}>
                    <OutlinedText style={styles.badge}>
                        {isCompose ? '🐳 Compose' : '🐝 Swarm'}
                    </OutlinedText>
                    <OutlinedText style={styles.badge}>
                        {isActive ? '✅ Active' : '⏸ Inactive'}
                    </OutlinedText>
                </View>

                <View style={styles.footer}>
                    <OutlinedText style={styles.detail}>
                        👤 {stack.CreatedBy}
                    </OutlinedText>
                    <OutlinedText style={styles.detail}>
                        🕐 Updated {formatTimestamp(updatedDate)}
                    </OutlinedText>
                </View>
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
        marginBottom: 8,
    },
    name: {
        fontSize: 18,
        color: Colors.VividMagenta,
        flex: 1,
        marginRight: 8,
        fontWeight: 'bold',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Colors.PureWhite,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    badge: {
        fontSize: 12,
        color: Colors.PureWhite,
        backgroundColor: 'rgba(219, 39, 119, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    detail: {
        fontSize: 11,
        color: Colors.PureWhite,
        opacity: 0.6,
    },
});
