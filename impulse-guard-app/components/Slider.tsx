import {SafeAreaView, ScrollView, StyleSheet, View, Text, ViewStyle} from "react-native";
import {Gesture, GestureDetector, GestureHandlerRootView} from 'react-native-gesture-handler';
import {runOnJS, useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated";
import Animated from 'react-native-reanimated';
import React, { Children, ForwardedRef, forwardRef, RefObject, useImperativeHandle, useState } from "react";
import {Color} from "ansi-fragments/build/fragments/Color";
import {Colors} from "@/constants/Colors";
import { black } from "colorette";


type SliderProps = {
    children: React.ReactNode;
    style?: ViewStyle;
    isNotCycled?: boolean;
    onChangeSlide?: (slide: number) => void
};

export interface SliderRef {
    goToNextSlide: () => void;
}

export const Slider = React.forwardRef((
    { children, style, onChangeSlide, isNotCycled }: SliderProps,
    ref: ForwardedRef<SliderRef>) => {

    const childrenCount = React.Children.count(children);
    const grabPosition = useSharedValue(0);
    const startPosition = useSharedValue(0);
    const slide = useSharedValue(0);
    const THRESHOLD = 30;
    const [width, setWidth] = useState(0);
    const xCord = useSharedValue(0);
    const currentSlide = useSharedValue(0);
    const [reactiveSlide, setReactiveSlide] = useState(0);
    const GAP = 32;

    const handleLayout = ( event: { nativeEvent: { layout: { width: any; }; }; } ) => {
        const { width } = event.nativeEvent.layout;
        setWidth(width);
    };

    useImperativeHandle(ref, () => ({
        goToNextSlide: () => {
            const nextSlide = (slide.value + 1) % childrenCount;
            slide.value = nextSlide;
            xCord.value = withTiming(-nextSlide * (width + GAP), { duration: 300 });
            onChangeSlide && onChangeSlide(nextSlide);
            setReactiveSlide(nextSlide);
        },
    }));

    // It wasn't ChatGPT, I came up with all those ideas of signum function and mods on my own, and I am PROUD of that!!!!
    const panGesture = Gesture.Pan()
        .onStart(( e ) => {
            grabPosition.value = e.x;
            startPosition.value = e.absoluteX;
        })
        .onEnd(( e ) => {
            const delta = e.absoluteX - startPosition.value;

            if ( Math.abs(delta) < THRESHOLD ) {
                xCord.value = withTiming(-( currentSlide.value * ( width + GAP ) ), { duration: 300 });
                return;
            }

            if ( !isNotCycled ) {
                slide.value -= Math.sign(delta)
                let nextSlide = slide.value % childrenCount

                if ( nextSlide < 0 ) nextSlide += childrenCount

                onChangeSlide && runOnJS(onChangeSlide)(nextSlide);
                xCord.value = withTiming(-( nextSlide * ( width + GAP ) ), { duration: 300 });
                currentSlide.value = nextSlide;
                runOnJS(setReactiveSlide)(currentSlide.value)
                return;
            }

            if ( Math.sign(delta) != 1 && ( slide.value + 1 ) != childrenCount ) {
                slide.value++
                runOnJS(setReactiveSlide)(slide.value)
                onChangeSlide && runOnJS(onChangeSlide)(slide.value);
            }
            xCord.value = withTiming(-( slide.value * ( width + GAP ) ), { duration: 300 });

        }).onUpdate(( e ) => {
            xCord.value = e.absoluteX - grabPosition.value;
        })

    const animatedStyle = useAnimatedStyle(() => ( {
        transform: [{ translateX: xCord.value }],
    } ));

    return (
        <View style={[styles.container, style]}>
            <GestureHandlerRootView style={{}} >
                <GestureDetector gesture={panGesture}>
                    <Animated.View
                        onLayout={handleLayout}
                        style={[{
                            flexDirection: 'row',
                            gap: GAP,
                        }, animatedStyle]}
                    >
                        {children}
                    </Animated.View>
                </GestureDetector>
            </GestureHandlerRootView>
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                {Array.from({ length: childrenCount }).map(( _, i ) => ( <View
                    key={i}
                    style={{
                        borderRadius: 9999,
                        height: 10,
                        aspectRatio: 1,
                        backgroundColor: i == reactiveSlide ? Colors.light.primary : Colors.light.pale,
                        marginHorizontal: 5,
                    }}
                /> ))}
            </View>
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 16,
    }
})