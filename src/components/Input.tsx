import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export interface InputProps extends TextInputProps {
  icon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  error?: string;
}

const Input = ({
  icon,
  rightIcon,
  onRightIconPress,
  error,
  style,
  ...props
}: InputProps) => {
  return (
    <View style={[styles.container, error && styles.errorContainer, style]}>
      {icon && (
        <Icon name={icon} size={24} color="#666" style={styles.icon} />
      )}
      <TextInput
        style={[styles.input, error && styles.errorInput]}
        placeholderTextColor="#666"
        {...props}
      />
      {rightIcon && (
        <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
          <Icon name={rightIcon} size={24} color="#666" />
        </TouchableOpacity>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  errorContainer: {
    borderColor: '#FF3B30',
  },
  icon: {
    marginRight: 10,
  },
  rightIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#000',
  },
  errorInput: {
    color: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 5,
  },
});

export default Input; 