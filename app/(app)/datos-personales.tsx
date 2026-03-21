import { useRouter } from 'expo-router';
import { ChevronLeft, FileText, Mail, MapPin, Phone, Save, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../src/api';
import { useAppTheme } from '../../src/store/themeStore';
import { radius, spacing, typography } from '../../src/theme';

export default function DatosPersonalesScreen() {
  const colors = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({
    nombre: '',
    rut: '',
    correo: '',
    telefono: '',
    direccion: '',
  });
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await api.get('/auth/get-session');
        const user = data.user || data || {};

        setForm({
          nombre: user.name || user.nombre || '',
          rut: user.rut || '',
          correo: user.email || user.correo || '',
          telefono: user.phone || user.telefono || '',
          direccion: user.address || user.direccion || '',
        });
      } catch (error) {
        console.error('Error cargando sesion:', error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchSession();
  }, []);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Format RUT as XX.XXX.XXX-X while typing
  const handleRutChange = (value: string) => {
    const clean = value.replace(/[^0-9kK]/g, '');
    let formatted = clean;
    if (clean.length > 1) {
      const body = clean.slice(0, -1);
      const dv = clean.slice(-1);
      formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
    }
    handleChange('rut', formatted);
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/auth/update-user', {
        name: form.nombre,
        rut: form.rut,
        email: form.correo,
        phone: form.telefono,
        address: form.direccion
      });
      Alert.alert('Éxito', 'Datos guardados correctamente.');
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      Alert.alert('Error', 'No se pudieron guardar los datos.');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    {
      key: 'nombre' as const,
      label: 'Nombre',
      icon: User,
      placeholder: 'Tu nombre completo',
      keyboardType: 'default' as const,
      autoCapitalize: 'words' as const,
    },
    {
      key: 'rut' as const,
      label: 'RUT',
      icon: FileText,
      placeholder: '12.345.678-9',
      keyboardType: 'default' as const,
      autoCapitalize: 'none' as const,
      onChangeText: handleRutChange,
    },
    {
      key: 'correo' as const,
      label: 'Correo Electrónico',
      icon: Mail,
      placeholder: 'correo@ejemplo.com',
      keyboardType: 'email-address' as const,
      autoCapitalize: 'none' as const,
    },
    {
      key: 'telefono' as const,
      label: 'Teléfono',
      icon: Phone,
      placeholder: '+56 9 1234 5678',
      keyboardType: 'phone-pad' as const,
      autoCapitalize: 'none' as const,
    },
    {
      key: 'direccion' as const,
      label: 'Dirección',
      icon: MapPin,
      placeholder: 'Calle, número, ciudad',
      keyboardType: 'default' as const,
      autoCapitalize: 'sentences' as const,
    },
  ];

  const styles = getStyles(colors);

  if (loadingData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Datos Personales</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar placeholder */}
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
            <User size={40} color={colors.primary} />
          </View>

          {/* Form fields */}
          <View style={styles.form}>
            {fields.map(field => {
              const Icon = field.icon;
              return (
                <View key={field.key} style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{field.label}</Text>
                  <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Icon size={18} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder={field.placeholder}
                      placeholderTextColor={colors.textSecondary}
                      value={form[field.key]}
                      onChangeText={field.onChangeText ?? ((v) => handleChange(field.key, v))}
                      keyboardType={field.keyboardType}
                      autoCapitalize={field.autoCapitalize}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Save size={18} color="#fff" />
                <Text style={styles.saveButtonText}>Guardar cambios</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 18,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  avatarContainer: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  form: {
    gap: spacing.lg,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
