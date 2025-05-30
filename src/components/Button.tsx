import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  icon,
  style,
  textStyle,
  loading = false,
  disabled = false,
  variant = 'primary',
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#007AFF' : '#fff'} />
      ) : (
        <>
          {icon && (
            <Icon
              name={icon}
              size={24}
              color={variant === 'outline' ? '#007AFF' : '#fff'}
              style={styles.icon}
            />
          )}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#5856D6',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlineText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 10,
  },
});

export default Button; 