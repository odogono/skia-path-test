import { useEffect } from "react";
import { Text, View } from "react-native";

export default function Index() {

  useEffect(() => {
    const uiManager = global?.nativeFabricUIManager ? 'Fabric' : 'Paper';
    console.log(`Using ${uiManager}`);
  }, []);
  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Skia Path Test</Text>
    </View>
  );
}
