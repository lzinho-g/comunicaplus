import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { theme } from "../theme/theme";
import { useAuth } from "../state/useAuth";

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  async function handleRegister() {
    if (
      !name.trim() ||
      !cpf.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !email.trim() ||
      !password ||
      !confirm
    ) {
      return Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
    }

    if (password !== confirm) {
      return Alert.alert("Atenção", "As senhas não conferem.");
    }

    try {
      await register({
        name: name.trim(),
        cpf: cpf.trim(),
        phone: phone.trim(),
        address: address.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      // navega para login ou direto pro app, depende do seu fluxo:
      navigation.navigate("Login");
    } catch (e: any) {
      Alert.alert("Erro", e?.message ?? "Não foi possível criar sua conta.");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {/* TÍTULO */}
            <Text style={styles.title}>Criar cadastro</Text>
            <Text style={styles.subtitle}>
              Preencha seus dados para começar a usar o Comunica+.
            </Text>

            {/* NOME */}
            <Text style={styles.label}>
              Nome completo <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              placeholderTextColor={theme.colors.textMuted}
              value={name}
              onChangeText={setName}
              returnKeyType="next"
            />

            {/* CPF */}
            <Text style={styles.label}>
              CPF <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Somente números"
              placeholderTextColor={theme.colors.textMuted}
              value={cpf}
              onChangeText={setCpf}
              keyboardType="numeric"
              returnKeyType="next"
            />

            {/* TELEFONE */}
            <Text style={styles.label}>
              Telefone <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="(xx) xxxxx-xxxx"
              placeholderTextColor={theme.colors.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="next"
            />

            {/* ENDEREÇO */}
            <Text style={styles.label}>
              Endereço <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Rua, número, bairro, cidade"
              placeholderTextColor={theme.colors.textMuted}
              value={address}
              onChangeText={setAddress}
              returnKeyType="next"
            />

            {/* EMAIL */}
            <Text style={styles.label}>
              E-mail <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor={theme.colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />

            {/* SENHA */}
            <Text style={styles.label}>
              Senha <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="next"
            />

            {/* CONFIRMAR SENHA */}
            <Text style={styles.label}>
              Confirmar senha <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Repita a senha"
              placeholderTextColor={theme.colors.textMuted}
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
              returnKeyType="done"
            />

            {/* BOTÃO CRIAR CONTA */}
            <Pressable style={styles.primaryBtn} onPress={handleRegister}>
              <Text style={styles.primaryBtnText}>Criar conta</Text>
            </Pressable>

            {/* LINK "JÁ TEM CONTA?" – um pouco mais acima, longe da barra */}
            <Pressable
              style={styles.bottomLinkWrapper}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.bottomLinkText}>
                Já tem conta? <Text style={styles.bottomLinkHighlight}>Entrar</Text>
              </Text>
            </Pressable>

            {/* espaço extra para não colar na borda do aparelho */}
            <View style={{ height: 24 }} />

            <Text style={styles.requiredInfo}>* Campos obrigatórios</Text>

            {/* espaço final grande para garantir que nada fique escondido */}
            <View style={{ height: 40 }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40, // ajuda a afastar do fundo
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  required: {
    color: theme.colors.danger,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.text,
  },
  primaryBtn: {
    marginTop: 22,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  bottomLinkWrapper: {
    marginTop: 18,
    alignItems: "center",
  },
  bottomLinkText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  bottomLinkHighlight: {
    color: theme.colors.primary,
    fontWeight: "700",
  },
  requiredInfo: {
    textAlign: "center",
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 8,
  },
});
