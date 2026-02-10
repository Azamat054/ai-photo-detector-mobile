import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Button, Image, Platform, StyleSheet, Text, View } from "react-native";

const API_URL = "https://ai-photo-detector-backend-production.up.railway.app"; // ❗ замени на IP сервера

export default function Test() {
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!res.canceled) {
      const file = res.assets[0];
      setPreview(file.uri);
      sendFile(file, "/predict");
    }
  };

  const pickVideo = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    });

    if (!res.canceled) {
      const file = res.assets[0];
      sendFile(file, "/predict-video");
    }
  };

  const sendFile = async (file, endpoint) => {
    const data = new FormData();

    try {
      if (Platform.OS === "web") {
        const resp = await fetch(file.uri);
        const blob = await resp.blob();
        const name = file.fileName || (file.uri && file.uri.split("/").pop()) || "file";
        data.append("file", blob, name);
      } else {
        const name = file.fileName || (file.uri && file.uri.split("/").pop()) || "file";
        const type = file.type || file.mimeType || "application/octet-stream";
        data.append("file", {
          uri: file.uri,
          name,
          type,
        });
      }

      const response = await fetch(API_URL + endpoint, {
        method: "POST",
        body: data,
      });

      const json = await response.json();
      setResult(json);
    } catch (err) {
      setResult({ error: err.message });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Detector</Text>

      <Button title="📷 Выбрать фото" onPress={pickImage} />
      <View style={{ height: 10 }} />
      <Button title="🎥 Выбрать видео" onPress={pickVideo} />

      {preview && <Image source={{ uri: preview }} style={styles.image} />}

      {result && (
        <Text style={styles.result}>
          {JSON.stringify(result, null, 2)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
  image: { width: 200, height: 200, alignSelf: "center", marginTop: 15 },
  result: { marginTop: 20, fontSize: 14 },
});