import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Text,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

export interface InputProps<T extends FieldValues = FieldValues> extends Omit<TextInputProps, 'onChange'> {
  icon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
  error?: string;
  containerStyle?: ViewStyle;
  name: Path<T>;
  control: Control<T>;
  rules?: object;
}

const Input = <T extends FieldValues>({
  icon,
  rightIcon,
  onRightIconPress,
  error,
  containerStyle,
  style,
  name,
  control,
  rules,
  ...props
}: InputProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value, onBlur }, fieldState: { error: fieldError } }) => (
        <View style={[styles.wrapper, containerStyle]}>
          <View style={[
            styles.container,
            (error || fieldError) && styles.errorContainer,
            style
          ]}>
            {icon && (
              <MaterialIcons name={icon} size={24} color={(error || fieldError) ? '#FF3B30' : '#666'} style={styles.icon} />
            )}
            <TextInput
              style={[styles.input, (error || fieldError) && styles.errorInput]}
              placeholderTextColor={(error || fieldError) ? '#FF3B30' : '#666'}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              {...props}
            />
            {rightIcon && (
              <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
                <MaterialIcons 
                  name={rightIcon} 
                  size={24} 
                  color={(error || fieldError) ? '#FF3B30' : '#666'} 
                />
              </TouchableOpacity>
            )}
          </View>
          {(error || fieldError) && (
            <Text style={styles.errorText}>{error || fieldError?.message}</Text>
          )}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 15,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
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
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input; 