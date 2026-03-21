import { FontAwesome, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../src/components/ui/Button';
import { useAppTheme } from '../../../src/store/themeStore';
import { radius, spacing, typography } from '../../../src/theme';

export default function HelpScreen() {
  const colors = useAppTheme();
  const styles = getStyles(colors);

  const handleWhatsApp = () => {
    // Reemplaza con tu número de teléfono, ej: 'https://wa.me/1234567890'
    Linking.openURL('https://wa.me/'); 
  };

  const handleTicket = () => {
    // Aquí puedes navegar a tu pantalla de ticket de soporte o abrir otra URL
    console.log('Abrir ticket de soporte');
  };

  // Datos de ejemplo para los tickets recientes
  const recentTickets = [
    { id: 'TCK-1024', title: 'Problema con el acceso', status: 'En progreso', date: '20 Oct, 2023', statusColor: colors.warning },
    { id: 'TCK-1023', title: 'Consulta de facturación', status: 'Resuelto', date: '18 Oct, 2023', statusColor: colors.success },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Centro de Ayuda</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          ¿Tienes dudas o necesitas soporte? Estamos aquí para ayudarte.
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <Button 
          title="Contactar por WhatsApp" 
          onPress={handleWhatsApp}
          icon={<FontAwesome name="whatsapp" size={20} color={colors.surface} />}
          style={styles.button}
        />
        <Button 
          title="Abrir un Ticket" 
          outline
          onPress={handleTicket}
          icon={<Ionicons name="ticket-outline" size={20} color={colors.textSecondary} />}
          style={styles.button}
        />
      </View>

      <View style={styles.ticketsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tus Tickets Recientes</Text>
        
        {recentTickets.length > 0 ? (
          recentTickets.map((ticket) => (
            <TouchableOpacity key={ticket.id} style={styles.ticketCard} activeOpacity={0.7}>
              <View style={styles.ticketHeader}>
                <Text style={[styles.ticketId, { color: colors.text }]}>{ticket.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: ticket.statusColor + '20' }]}>
                  <Text style={[styles.statusText, { color: ticket.statusColor }]}>{ticket.status}</Text>
                </View>
              </View>
              <Text style={[styles.ticketTitle, { color: colors.text }]}>{ticket.title}</Text>
              <Text style={[styles.ticketDate, { color: colors.textSecondary }]}>{ticket.date}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="albums-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No tienes tickets abiertos en este momento.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
  },
  actionsContainer: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  button: {
    width: '100%',
  },
  ticketsSection: {
    width: '100%',
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  ticketCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ticketId: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.round,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  ticketTitle: {
    ...typography.subtitle,
    marginBottom: spacing.xs,
  },
  ticketDate: {
    ...typography.caption,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.md,
  }
});
