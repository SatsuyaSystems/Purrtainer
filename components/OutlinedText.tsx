import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

interface OutlinedTextProps extends TextProps {
    children: React.ReactNode;
}

export const OutlinedText: React.FC<OutlinedTextProps> = ({ style, children, ...props }) => {
    return (
        <Text style={[styles.text, style]} {...props}>
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    text: {
        color: Colors.PureWhite,
        textShadowColor: Colors.Black,
        textShadowRadius: 3,
        textShadowOffset: { width: 1, height: 1 },
        fontWeight: 'bold',
    },
});
