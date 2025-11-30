import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';
import { OutlinedText } from './OutlinedText';

interface NeonButtonProps extends TouchableOpacityProps {
    title: string;
    style?: ViewStyle;
}

export const NeonButton: React.FC<NeonButtonProps> = ({ title, style, ...props }) => {
    return (
        <TouchableOpacity style={[styles.button, style]} activeOpacity={0.8} {...props}>
            <OutlinedText style={styles.text}>{title}</OutlinedText>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: Colors.VividMagenta,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.VividMagenta,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    text: {
        fontSize: 16,
        textTransform: 'uppercase',
    },
});
