import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Home, Heart, Building2, HelpCircle, Bell, User, Sun, Moon, Users } from 'lucide-react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { typography, spacing, radius } from '../../../src/theme';
import { useAppTheme, useThemeStore } from '../../../src/store/themeStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const navigation = useNavigation();
  const colors = useAppTheme();
  const { theme, toggleTheme } = useThemeStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setButtonStyleAsync(theme === 'dark' ? 'light' : 'dark').catch(() => {});
    }
  }, [theme]);

  return (
    <Tabs
      screenOptions={{
        header: () => (
          <View style={[
            styles.header, 
            { 
              backgroundColor: colors.surface, 
              borderBottomColor: colors.border,
              paddingTop: Math.max(insets.top, 20) + spacing.md
            }
          ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.greetingText}>Hola, </Text>
              <Text style={[styles.userName, { color: colors.primary }]}>Hugo</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
                {theme === 'dark' ? (
                  <Sun size={24} color={colors.text} />
                ) : (
                  <Moon size={24} color={colors.text} />
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Bell size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.avatarButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              >
                <User size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ),
        tabBarStyle: [
          styles.tabBar, 
          { 
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          }
        ],
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: { 
          fontSize: 10, 
          fontWeight: '600',
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="hearts"
        options={{
          title: 'Corazones',
          tabBarIcon: ({ color }) => <Heart size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="condos"
        options={{
          title: 'Condominios',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.middleButton, 
              { 
                backgroundColor: focused ? colors.primary : colors.background,
                borderColor: colors.surface
              }
            ]}>
              <Building2 size={28} color={focused ? '#fff' : colors.primaryDark} />
            </View>
          ),
          tabBarLabel: 'Condominios',
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Comunidad',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: 'Ayuda',
          tabBarIcon: ({ color }) => <HelpCircle size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  greetingText: {
    ...typography.caption,
    color: '#64748b', // static secondary for greeting
  },
  userName: {
    ...typography.h2,
    fontSize: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: spacing.md,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    borderTopWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
  middleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    top: -20,
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
