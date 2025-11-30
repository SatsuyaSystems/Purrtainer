import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

interface NeonCardProps extends ViewProps {
    children: React.ReactNode;
}

export const NeonCard: React.FC<NeonCardProps> = ({ style, children, ...props }) => {
    return (
        <View style={[styles.card, style]} {...props}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(45, 27, 78, 0.8)', // Slightly transparent DeepDarkPurple
        borderColor: Colors.VividMagenta,
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        shadowColor: Colors.VividMagenta,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
});
