import { View, StyleSheet } from "react-native"
import { Text } from "@components/nativewindui/Text"

const CreateChannelForm = () => {
    return (
        <View style={styles.container}>
            <Text>Create Channel</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
})

export default CreateChannelForm