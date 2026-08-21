import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthSuccess, logout as logoutAction, setUser, setLoading } from '../redux/authSlice';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading } = useSelector((state) => state.auth);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        dispatch(setAuthSuccess({ token: storedToken, user: parsedUser }));
        // Refresh profile from server
        try {
          const res = await authService.getCurrentUser();
          if (res?.user) {
            dispatch(setUser(res.user));
            await AsyncStorage.setItem('userData', JSON.stringify(res.user));
          }
        } catch (e) {
          console.log('Failed to refresh user profile on init');
        }
      }
    } catch (e) {
      console.error('Error loading stored auth:', e);
    } finally {
      setInitializing(false);
    }
  };

  const login = async (email, password) => {
    dispatch(setLoading(true));
    try {
      const res = await authService.login({ email, password });
      if (res?.token && res?.user) {
        await AsyncStorage.setItem('userToken', res.token);
        await AsyncStorage.setItem('userData', JSON.stringify(res.user));
        dispatch(setAuthSuccess({ token: res.token, user: res.user }));
        return { success: true, user: res.user };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err) {
      dispatch(setLoading(false));
      return { success: false, message: err.message };
    }
  };

  const googleLogin = async (data) => {
    dispatch(setLoading(true));
    try {
      const res = await authService.googleLogin(data);
      if (res?.token && res?.user) {
        await AsyncStorage.setItem('userToken', res.token);
        await AsyncStorage.setItem('userData', JSON.stringify(res.user));
        dispatch(setAuthSuccess({ token: res.token, user: res.user }));
        return { success: true, user: res.user };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err) {
      dispatch(setLoading(false));
      return { success: false, message: err.message };
    }
  };

  const appleLogin = async (data) => {
    dispatch(setLoading(true));
    try {
      const res = await authService.appleLogin(data);
      if (res?.token && res?.user) {
        await AsyncStorage.setItem('userToken', res.token);
        await AsyncStorage.setItem('userData', JSON.stringify(res.user));
        dispatch(setAuthSuccess({ token: res.token, user: res.user }));
        return { success: true, user: res.user };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err) {
      dispatch(setLoading(false));
      return { success: false, message: err.message };
    }
  };

  const register = async (userData) => {
    dispatch(setLoading(true));
    try {
      const res = await authService.register(userData);
      if (res?.token && res?.user) {
        await AsyncStorage.setItem('userToken', res.token);
        await AsyncStorage.setItem('userData', JSON.stringify(res.user));
        dispatch(setAuthSuccess({ token: res.token, user: res.user }));
        return { success: true, user: res.user };
      }
      return { success: false, message: 'Invalid registration response' };
    } catch (err) {
      dispatch(setLoading(false));
      return { success: false, message: err.message };
    }
  };

  const sendOtp = async (email) => {
    dispatch(setLoading(true));
    try {
      const res = await authService.sendOtp(email);
      dispatch(setLoading(false));
      return { success: true, message: res?.message || 'OTP sent' };
    } catch (err) {
      dispatch(setLoading(false));
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {}
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    dispatch(logoutAction());
  };

  const updateAvatar = async (imageUri) => {
    try {
      const res = await authService.uploadAvatar(imageUri);
      if (res?.user) {
        dispatch(setUser(res.user));
        await AsyncStorage.setItem('userData', JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
      return { success: false, message: 'Failed to update avatar' };
    } catch (err) {
      return { success: false, message: err.message || 'Avatar upload failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        initializing,
        login,
        googleLogin,
        appleLogin,
        sendOtp,
        register,
        logout,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
