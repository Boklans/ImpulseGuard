//TODO think of better naming

import React, { FC } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import RoundButton from "@/components/ui/RoundButton";
import { SvgProps } from "react-native-svg";
import { Colors } from "@/constants/Colors";
import { EmptyView } from "@/components/ui/EmptyView";

type InputProps = {
    isEmpty: boolean;
    children: React.ReactNode;
    title: string;
    description: string;
    icon: FC<SvgProps>;
    style?: ViewStyle;
};

const EmptyStateWrapper: React.FC<InputProps> = ({
                                                     isEmpty,
                                                     children,
                                                     title,
                                                     description,
                                                     icon,
                                                     style,
                                                 }) => {
    return (<View style={[styles.container]}>
            {!isEmpty ? (
                <>{children}</>
            ) : (
                <EmptyView title={title} icon={icon} description={description} />
            )}
        </View>);
};

const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: "100%",
    },
});


export default EmptyStateWrapper;
