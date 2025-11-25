import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../state/useAuth";
import { theme } from "../theme/theme";

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
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (
      !name.trim() ||
      !cpf.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      return Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
    }

    if (password !== confirm) {
      return Alert.alert("Atenção", "As senhas não conferem.");
    }

    // validação básica de tamanho de CPF (somente para não deixar muito errado)
    if (cpf.replace(/\D/g, "").length < 11) {
      return Alert.alert("Atenção", "Digite um CPF válido (11 dígitos).");
    }

    setLoading(true);
    await register({
      name: name.trim(),
      cpf: cpf.trim(),
      phone: phone.trim(),
      address: address.trim(),
      email: email.trim(),
      password,
    });
    setLoading(false);

    Alert.alert(
      "Cadastro criado",
      "Agora é só fazer login com seu e-mail e senha.",
      [{ text: "OK", onPress: () => navigation.navigate("Login") }]
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Criar cadastro</Text>
          <Text style={styles.subtitle}>
            Preencha seus dados para começar a usar o Comunica+.
          </Text>

          {/* NOME */}
          <Text style={styles.label}>Nome completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor={theme.colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          {/* CPF */}
          <Text style={[styles.label, { marginTop: 14 }]}>CPF *</Text>
          <TextInput
            style={styles.input}
            placeholder="Somente números"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="numeric"
            maxLength={14}
            value={cpf}
            onChangeText={setCpf}
          />

          {/* TELEFONE */}
          <Text style={[styles.label, { marginTop: 14 }]}>Telefone *</Text>
          <TextInput
            style={styles.input}
            placeholder="(xx) xxxxx-xxxx"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          {/* ENDEREÇO */}
          <Text style={[styles.label, { marginTop: 14 }]}>Endereço *</Text>
          <TextInput
            style={styles.input}
            placeholder="Rua, número, bairro, cidade"
            placeholderTextColor={theme.colors.textMuted}
            value={address}
            onChangeText={setAddress}
          />

          {/* E-MAIL */}
          <Text style={[styles.label, { marginTop: 14 }]}>E-mail *</Text>
          <TextInput
            style={styles.input}
            placeholder="seuemail@exemplo.com"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* SENHA */}
          <Text style={[styles.label, { marginTop: 14 }]}>Senha *</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* CONFIRMAR SENHA */}
          <Text style={[styles.label, { marginTop: 14 }]}>
            Confirmar senha *
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Repita a senha"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />

          <Pressable
            style={[styles.btn, styles.btnPrimary, { marginTop: 20 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.btnText}>
              {loading ? "Salvando..." : "Criar conta"}
            </Text>
          </Pressable>

          <Pressable
            style={{ marginTop: 18 }}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.link}>Já tem conta? Entrar</Text>
          </Pressable>

          <Text style={styles.obs}>* Campos obrigatórios</Text>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
    backgroundColor: theme.colors.bg,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 4,
    marginBottom: 24,
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
    borderRadius: theme.radius,
    marginTop: 6,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  btn: {
    paddingVertical: 12,
    borderRadius: theme.radius,
    alignItems: "center",
  },
  btnPrimary: {
    backgroundColor: theme.colors.primary,
  },
  btnText: {
    color: "#fff",
    fontWeight: "800",
  },
  link: {
    textAlign: "center",
    color: theme.colors.primary,
    fontWeight: "700",
  },
  obs: {
    marginTop: 10,
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
});
