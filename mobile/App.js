import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { SocketProvider } from './src/context/SocketContext';
import { ToastProvider } from './src/context/ToastContext';
import { useTheme } from './src/hooks/useTheme';
import RootNavigator from './src/navigation/RootNavigator';

const ThemeStatusBar = () => {
  const { theme } = useTheme();

  return <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} backgroundColor={theme.colors.background} />;
};

const AppContent = () => (
  <ToastProvider>
    <ThemeStatusBar />
    <RootNavigator />
  </ToastProvider>
);

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AuthProvider>
          <ThemeProvider>
            <NotificationProvider>
              <SocketProvider>
                <AppContent />
              </SocketProvider>
            </NotificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
