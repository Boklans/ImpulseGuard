import {View, StyleSheet, Text, Image, ImageSourcePropType} from "react-native";


type AchievementCardProps = {
    image: ImageSourcePropType;
    title: string;
    description: string;
}

export function AchievementCard(props: AchievementCardProps) {
    const { image, description, title, } = props;


    return (
        <View style={styles.root}>
            <Image source={image} style={styles.image} />
            <Text style={styles.title}>
                {title}
            </Text>
            <Text style={styles.description}>
                {description}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        width: "48%",
        aspectRatio:1,
        backgroundColor: "white",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingBottom: 12,
        paddingTop: 6,
        marginBottom: 16,
    },
    title: {
        textAlign: "center",
        fontSize: 20,
        fontWeight: "medium",
    },
    description: {
        textAlign: "center",
        fontWeight: "light",
        fontSize: 14,
    },
    image: {
        flex: 1,
        height: 128,
        width: 100,
        resizeMode: "contain",
    }
})