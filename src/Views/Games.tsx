import { StyleSheet, Text, View } from "react-native";

export default function Games() {
    return (
        <View style={styles.container}>
            <Text>Games</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
