import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import todoItemService from '../services/TodoItemService';
import { ToDoItem } from '../types/ToDoItem';

type CreateToDoScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateToDo'>;

export default function CreateToDoScreen({ route, navigation }: CreateToDoScreenProps) {
    const { username } = route.params;
    const [formData, setFormData] = useState<ToDoItem>({
        id: '',
        title: '',
        description: '',
        priority: '',
        completed: false,
        userId: username
    });

    async function handleCreate() {
        // Validate required fields
        if (!formData.title.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề công việc');
            return;
        }

        if (!formData.description.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mô tả công việc');
            return;
        }

        if (!formData.priority.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập độ ưu tiên');
            return;
        }

        try {
            await todoItemService.addTodoItem(formData, username);
            Alert.alert('Thành công', 'Tạo công việc mới thành công', [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('ToDoList', { username })
                }
            ]);
        } catch (error) {
            console.error('Error creating todo item:', error);
            Alert.alert('Lỗi', 'Không thể tạo công việc mới');
        }
    };

    async function handleCancel() {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn hủy tạo công việc mới?',
            [
                {
                    text: 'Tiếp tục chỉnh sửa',
                    style: 'cancel'
                },
                {
                    text: 'Hủy',
                    onPress: () => navigation.goBack()
                }
            ])
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Tạo công việc mới</Text>
                
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Tiêu đề:</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.title}
                        onChangeText={(text) => setFormData({ ...formData, title: text })}
                        placeholder="Nhập tiêu đề công việc"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Mô tả:</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        placeholder="Nhập mô tả công việc"
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Độ ưu tiên:</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.priority}
                        onChangeText={(text) => setFormData({ ...formData, priority: text })}
                        placeholder="Nhập độ ưu tiên (Cao/Trung bình/Thấp)"
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.button, styles.createButton]}
                        onPress={handleCreate}
                    >
                        <Text style={styles.buttonText}>Tạo mới</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.button, styles.cancelButton]}
                        onPress={handleCancel}
                    >
                        <Text style={[styles.buttonText, styles.cancelButtonText]}>Hủy</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        marginHorizontal: 8,
    },
    createButton: {
        backgroundColor: '#4CD964',
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#8E8E93',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    cancelButtonText: {
        color: '#8E8E93',
    },
});