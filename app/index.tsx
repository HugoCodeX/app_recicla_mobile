import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { router } from 'expo-router';
import { Input } from '../src/components/ui/Input';
import { Button } from '../src/components/ui/Button';
import { spacing, typography } from '../src/theme';
import { useAppTheme } from '../src/store/themeStore';
import api from '../src/api';
import { useAuthStore } from '../src/store/authStore';

export default function LoginScreen() {
  const colors = useAppTheme();
  const styles = getStyles(colors);
  
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const setToken = useAuthStore((state) => state.setToken);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setLoading = useAuthStore((state) => state.setLoading);
  const globalError = useAuthStore((state) => state.error);
  const setError = useAuthStore((state) => state.setError);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/sign-in/email', {
        email: data.email,
        password: data.password,
      });

      // Assuming the token is in response.data.token or similar
      // The exact path depends on the API implementation. Adjusting to standard response:
      const token = response.data?.token || response.data?.accessToken;
      if (token) {
        await setToken(token);
        router.replace('/(app)/(tabs)' as any);
      } else {
        // Fallback for different response structure or error handling
        Alert.alert('Éxito', 'Inicio de sesión correcto pero no se recibió token.', [
          { text: 'OK', onPress: () => router.replace('/(app)/(tabs)' as any) }
        ]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>¡Bienvenido de nuevo!</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
        </View>

        <View style={styles.form}>
          {globalError ? <Text style={styles.globalError}>{globalError}</Text> : null}

          <Controller
            control={control}
            rules={{
              required: 'El correo electrónico es requerido',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Correo electrónico inválido'
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Correo Electrónico"
                placeholder="ejemplo@correo.com"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
            name="email"
          />

          <Controller
            control={control}
            rules={{
              required: 'La contraseña es requerida',
              minLength: {
                value: 6,
                message: 'La contraseña debe tener al menos 6 caracteres'
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Contraseña"
                placeholder="Ingresa tu contraseña"
                isPassword
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message as string}
              />
            )}
            name="password"
          />

          <Button 
            title="Iniciar Sesión" 
            onPress={handleSubmit(onSubmit)} 
            loading={isLoading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
  },
  form: {
    width: '100%',
  },
  globalError: {
    color: colors.error,
    backgroundColor: '#fee2e2',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: '500',
  },
  submitButton: {
    marginTop: spacing.lg,
  },
});
