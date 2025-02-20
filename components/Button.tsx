import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  onPress: () => void;
  children: string;
  mode?: 'contained' | 'outlined';
  icon?: string;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function Button({
  onPress,
  children,
  mode = 'contained',
  icon,
  loading = false,
  style,
  textStyle,
  disabled = false,
}: ButtonProps) {
  const buttonStyles = [
    styles.button,
    mode === 'contained' ? styles.contained : styles.outlined,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    mode === 'contained' ? styles.containedText : styles.outlinedText,
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={mode === 'contained' ? '#fff' : '#007AFF'} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon as any}
              size={20}
              color={mode === 'contained' ? '#fff' : '#007AFF'}
              style={styles.icon}
            />
          )}
          <Text style={textStyles}>{children}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    minHeight: 54,
  },
  contained: {
    backgroundColor: '#007AFF',
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  containedText: {
    color: '#fff',
  },
  outlinedText: {
    color: '#007AFF',
  },
  disabledText: {
    color: '#8E8E93',
  },
  icon: {
    marginRight: 8,
  },
});