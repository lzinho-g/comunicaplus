import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, Pressable, Image,
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  TouchableWithoutFeedback, Keyboard
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker, MapPressEvent, Region } from "react-native-maps";
import { problemSchema, ProblemInput } from "../domain/problemSchema";
import { useProblems } from "../state/useProblems";
import { theme } from "../theme/theme";

const INITIAL_COORD = { latitude: -27.5953, longitude: -48.5485 };
const INITIAL_REGION: Region = {
  ...INITIAL_COORD,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const CATEGORY_OPTIONS = ["Buraco", "Iluminação", "Lixo", "Segurança", "Outros"];

export default function NewProblemScreen() {
  const [coord, setCoord] = useState(INITIAL_COORD);
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const [image, setImage] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProblemInput>({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: "",
      category: "Buraco",
      city: "",
      neighborhood: "",
      description: "",
      latitude: INITIAL_COORD.latitude,
      longitude: INITIAL_COORD.longitude,
      image: undefined,
    },
  });

  const { addProblem } = useProblems();

  const onMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const newCoord = { latitude, longitude };
    setCoord(newCoord);
    setRegion((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
    setValue("latitude", latitude);
    setValue("longitude", longitude);
  };

  const useMyLocation = async () => {
    const perm = await Location.requestForegroundPermissionsAsync();

    if (!perm.granted) {
      return Alert.alert(
        "Permissão necessária",
        "Ative o acesso à localização para usar esse recurso."
      );
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = pos.coords;
    const newCoord = { latitude, longitude };

    setCoord(newCoord);
    setRegion((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));

    setValue("latitude", latitude);
    setValue("longitude", longitude);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted)
      return Alert.alert("Permissão", "Ative o acesso à câmera.");

    const img = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!img.canceled) {
      const uri = img.assets[0].uri;
      setImage(uri);
      setValue("image", uri);
    }
  };

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted)
      return Alert.alert("Permissão", "Ative o acesso à galeria.");

    const img = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!img.canceled) {
      const uri = img.assets[0].uri;
      setImage(uri);
      setValue("image", uri);
    }
  };

  const submit = async (data: ProblemInput) => {
    await addProblem(data);

    Alert.alert("Sucesso!", "Problema salvo no aparelho.");

    reset({
      title: "",
      category: "Buraco",
      city: "",
      neighborhood: "",
      description: "",
      latitude: INITIAL_COORD.latitude,
      longitude: INITIAL_COORD.longitude,
      image: undefined,
    });

    setImage(null);
    setCoord(INITIAL_COORD);
    setRegion(INITIAL_REGION);
    setCategoryOpen(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.screenTitle}>Registrar problema</Text>

          {/* TÍTULO */}
          <Text style={styles.label}>Título</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { value, onChange } }) => (
              <TextInput
                placeholder="Ex: Buraco perigoso na Rua A"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
                value={value}
                onChangeText={onChange}
                returnKeyType="next"
              />
            )}
          />
          {errors.title && (
            <Text style={styles.error}>{errors.title.message}</Text>
          )}

          {/* CATEGORIA */}
          <Text style={[styles.label, { marginTop: 14 }]}>Categorias</Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { value, onChange } }) => (
              <View style={{ marginTop: 6 }}>
                {/* campo “fake input” */}
                <Pressable
                  style={styles.input}
                  onPress={() => setCategoryOpen((prev) => !prev)}
                >
                  <Text
                    style={
                      value
                        ? styles.inputText
                        : styles.placeholderText
                    }
                  >
                    {value || "Selecione a categoria"}
                  </Text>
                </Pressable>

                {/* dropdown escuro */}
                {categoryOpen && (
                  <View style={styles.dropdown}>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <Pressable
                        key={cat}
                        style={styles.dropdownItem}
                        onPress={() => {
                          onChange(cat);
                          setCategoryOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{cat}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}
          />
          {errors.category && (
            <Text style={styles.error}>{errors.category.message}</Text>
          )}

          {/* CIDADE */}
          <Text style={[styles.label, { marginTop: 14 }]}>Cidade</Text>
          <Controller
            control={control}
            name="city"
            render={({ field: { value, onChange } }) => (
              <TextInput
                placeholder="Ex: Florianópolis"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
                value={value}
                onChangeText={onChange}
                returnKeyType="next"
              />
            )}
          />
          {errors.city && (
            <Text style={styles.error}>{errors.city.message}</Text>
          )}

          {/* BAIRRO (opcional) */}
          <Text style={[styles.label, { marginTop: 14 }]}>
            Bairro <Text style={{ fontWeight: "400" }}>(opcional)</Text>
          </Text>
          <Controller
            control={control}
            name="neighborhood"
            render={({ field: { value, onChange } }) => (
              <TextInput
                placeholder="Ex: Centro"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
                value={value ?? ""}
                onChangeText={onChange}
                returnKeyType="next"
              />
            )}
          />

          {/* DESCRIÇÃO */}
          <Text style={[styles.label, { marginTop: 14 }]}>Descrição</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { value, onChange } }) => (
              <TextInput
                placeholder="Explique o problema e riscos..."
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.input, styles.textarea]}
                multiline
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.description && (
            <Text style={styles.error}>{errors.description.message}</Text>
          )}

          {/* MAPA */}
          <MapView
            style={{ height: 220, marginVertical: 10, borderRadius: 10 }}
            region={region}
            onRegionChangeComplete={setRegion}
            onPress={onMapPress}
          >
            <Marker
              coordinate={coord}
              draggable
              onDragEnd={(e) => {
                const c = e.nativeEvent.coordinate;
                setCoord(c);
                setRegion((prev) => ({
                  ...prev,
                  latitude: c.latitude,
                  longitude: c.longitude,
                }));
                setValue("latitude", c.latitude);
                setValue("longitude", c.longitude);
              }}
            />
          </MapView>

          <Text style={{ textAlign: "center", marginBottom: 6 }}>
            {coord.latitude.toFixed(5)}, {coord.longitude.toFixed(5)}
          </Text>

          <Pressable
            style={[styles.btn, styles.btnPrimary]}
            onPress={useMyLocation}
          >
            <Text style={styles.btnText}>Usar minha localização</Text>
          </Pressable>

          {/* FOTO (preview) */}
          {image && <Image source={{ uri: image }} style={styles.img} />}

          {/* AÇÕES DE IMAGEM */}
          <View style={styles.row}>
            <Pressable style={[styles.btn, styles.btnDark]} onPress={takePhoto}>
              <Text style={styles.btnText}>Tirar foto</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnDark]}
              onPress={pickFromGallery}
            >
              <Text style={styles.btnText}>Escolher da galeria</Text>
            </Pressable>
          </View>

          {/* ENVIAR */}
          <Pressable
            style={[styles.btn, styles.btnPrimary]}
            onPress={handleSubmit(submit)}
          >
            <Text style={styles.btnText}>Enviar</Text>
          </Pressable>

          <View style={{ height: 24 }} />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
    color: theme.colors.text,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 6,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  inputText: {
    color: theme.colors.text,
  },
  placeholderText: {
    color: theme.colors.textMuted,
  },
  textarea: {
    height: 110,
    textAlignVertical: "top",
  },
  dropdown: {
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dropdownItemText: {
    color: theme.colors.text,
  },
  img: { width: "100%", height: 180, borderRadius: 8, marginTop: 10 },
  row: { flexDirection: "row", gap: 10, marginTop: 12 },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
  btnDark: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  btnPrimary: { backgroundColor: theme.colors.primary, marginTop: 12 },
  btnText: { color: "#fff", fontWeight: "700" },
  error: { color: theme.colors.danger, fontSize: 12, marginTop: 4 },
});
