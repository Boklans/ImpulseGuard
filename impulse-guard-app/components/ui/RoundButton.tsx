import React from 'react';
import {
    Image,
    GestureResponderEvent,
    ViewStyle,
    StyleSheet,
    ImageSourcePropType,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { AnimatedPressable } from './AnimatedPressable';

type RoundButtonProps = {
    icon: ImageSourcePropType;
    onPress: (event: GestureResponderEvent) => void;
    disabled?: boolean;
    style?: ViewStyle;
};

const RoundButton: React.FC<RoundButtonProps> = ({ icon, onPress, disabled, style }) => {
    return (
        <AnimatedPressable
            onPress={onPress}
            disabled={disabled}
            style={[styles.button, style]}
            scaleValue={0.9}
        >
            <Image style={styles.icon} source={icon} />
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 64,
        width: 64,
        backgroundColor: Colors.light.tabIconSelected,
        borderRadius: 99,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        height: 32,
        width: 32,
        objectFit: 'contain',
        marginLeft: 4,
        marginBottom: 4,
    },
});

export default RoundButton;