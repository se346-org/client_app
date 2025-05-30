import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import Input from '../components/Input';
import Button from '../components/Button';
import LanguageSwitcher from '../components/LanguageSwitcher';

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      // TODO: Implement register logic
      console.log('Register data:', data);
      navigation.navigate('Login');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LanguageSwitcher />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t('common.createAccount')}</Text>
            <Text style={styles.subtitle}>{t('common.registerSubtitle')}</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="fullName"
              rules={{
                required: t('validation.required', { field: t('common.fullName') }),
                minLength: {
                  value: 2,
                  message: t('validation.minLength', { field: t('common.fullName'), min: 2 }),
                },
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  name="fullName"
                  control={control}
                  icon="person"
                  placeholder={t('common.fullName')}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              rules={{
                required: t('validation.required', { field: t('common.email') }),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('validation.invalidEmail'),
                },
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  name="email"
                  control={control}
                  icon="email"
                  placeholder={t('common.email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              rules={{
                required: t('validation.required', { field: t('common.password') }),
                minLength: {
                  value: 6,
                  message: t('validation.minLength', { field: t('common.password'), min: 6 }),
                },
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  name="password"
                  control={control}
                  icon="lock"
                  placeholder={t('common.password')}
                  secureTextEntry={!showPassword}
                  rightIcon={showPassword ? 'visibility' : 'visibility-off'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: t('validation.required', { field: t('common.confirmPassword') }),
                validate: (value) =>
                  value === password || t('validation.passwordMismatch'),
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  name="confirmPassword"
                  control={control}
                  icon="lock"
                  placeholder={t('common.confirmPassword')}
                  secureTextEntry={!showConfirmPassword}
                  rightIcon={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              )}
            />

            <Button
              title={t('common.signUp')}
              onPress={handleSubmit(onSubmit)}
              icon="person-add"
              loading={loading}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>{t('common.haveAccount')} </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>{t('common.signIn')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    flex: 1,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default RegisterScreen; 