import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface InputProps extends TextInputProps {
  icon?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  icon,
  containerStyle,
  inputStyle,
  error,
  ...props
}) => {
  return (
    <View style={[styles.container, error && styles.errorContainer, containerStyle]}>
      {icon && <Icon name={icon} size={24} color="#666" style={styles.icon} />}
      <TextInput
        style={[styles.input, inputStyle]}
        placeholderTextColor="#999"
        {...props}
      />
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
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#000',
  },
});

export default Input; 