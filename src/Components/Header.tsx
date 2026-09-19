import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LogoIcon from "./LogoIcon";
import AppName from "./AppName";

export default function Header() {
	const insets = useSafeAreaInsets();
	return (
		<View style={[styles.header, { paddingTop: insets.top + 10 }]}>
			<LogoIcon size={40} />
			<AppName size={80} />
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		width: "100%",
		height: 80,
		backgroundColor: "#0f1115",
		flexDirection: "row",
		paddingBottom: 10,
		paddingHorizontal: 24,
		alignItems: "center",
	},
});