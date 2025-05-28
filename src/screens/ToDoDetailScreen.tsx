import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import todoItemService from "../services/TodoItemService";
import React, { useEffect, useState } from "react";
import { ToDoItem } from "../types/ToDoItem";

type ToDoDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'ToDoDetail'>;

export default function ToDoDetailScreen({ route, navigation }: ToDoDetailScreenProps) {
    const { username, toDoId } = route.params;
    const [toDo, setToDo] = useState<ToDoItem | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<ToDoItem | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    
    useEffect(() => {
        loadTodoItem();
    }, [toDoId]);

    const loadTodoItem = async () => {
        try {
            const toDos = await todoItemService.getTodoItems(username);
            const foundTodo = toDos.find((todo) => todo.id === toDoId) || null;
            setToDo(foundTodo);
            setFormData(foundTodo);
        } catch (error) {
            console.error('Error loading todo item:', error);
            Alert.alert('Error', 'Failed to load todo item');
        }
    };

    const handleSave = async () => {
        if (!formData) return;
        
        try {
            await todoItemService.updateTodoItem(formData);
            setToDo(formData);
            setIsEditing(false);
            setHasChanges(false);
            Alert.alert('Success', 'Todo item updated successfully');
        } catch (error) {
            console.error('Error saving todo item:', error);
            Alert.alert('Error', 'Failed to save todo item');
        }
    };
    
    const handleCancel = () => {
        setFormData(toDo);
        setIsEditing(false);
        setHasChanges(false);
    };
    
    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleDelete = async () => {
        try {
            await todoItemService.deleteTodoItem(toDoId);
            navigation.navigate('ToDoList', { username });
        } catch (error) {
            console.error('Error deleting todo item:', error);
            Alert.alert('Error', 'Failed to delete todo item');
        }
    };

    const handleFormChange = (field: keyof ToDoItem, value: string) => {
        if (!formData) return;
        setFormData({ ...formData, [field]: value });
        setHasChanges(true);
    };

    function renderContent(): React.JSX.Element | null {
        if (!toDo || !formData) return null;

        return (
            <>
                <View style={styles.header}>
                    <View style={styles.headerInfo}>
                        <Text style={styles.employeeId}>ID: {toDo.title}</Text>
                    </View>
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
                    <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Mô tả:</Text>
                        <TextInput
                            style={[
                                styles.input,
                                !isEditing && styles.inputDisabled
                            ]}
                            value={formData.description}
                            onChangeText={(text) => handleFormChange('description', text)}
                            editable={isEditing}
                            multiline
                        />
                    </View>
                    <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Độ ưu tiên:</Text>
                        <TextInput
                            style={[
                                styles.input,
                                !isEditing && styles.inputDisabled
                            ]}
                            value={formData.priority}
                            onChangeText={(text) => handleFormChange('priority', text)}
                            editable={isEditing}
                        />
                    </View>
                    <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Trạng thái:</Text>
                        {isEditing ? (
                            <TouchableOpacity 
                                style={styles.checkboxContainer}
                                onPress={() => {
                                    setFormData({ ...formData, completed: !formData.completed });
                                    setHasChanges(true);
                                }}
                            >
                                <View style={[
                                    styles.checkbox,
                                    formData.completed && styles.checkboxChecked
                                ]}>
                                    {formData.completed && (
                                        <Text style={styles.checkboxCheck}>✓</Text>
                                    )}
                                </View>
                                <Text style={styles.checkboxLabel}>
                                    {formData.completed ? 'Hoàn thành' : 'Chưa hoàn thành'}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={styles.statusText}>
                                {formData.completed ? 'Hoàn thành' : 'Chưa hoàn thành'}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    {isEditing ? (
                        <>
                            <TouchableOpacity 
                                style={[
                                    styles.button, 
                                    styles.saveButton,
                                    !hasChanges && styles.buttonDisabled
                                ]} 
                                onPress={handleSave}
                                disabled={!hasChanges}
                            >
                                <Text style={styles.buttonText}>Lưu</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[
                                    styles.button, 
                                    styles.cancelButton
                                ]} 
                                onPress={() => {
                                    if (hasChanges) {
                                        Alert.alert(
                                            "Xác nhận",
                                            "Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn hủy không?",
                                            [
                                                {
                                                    text: "Tiếp tục chỉnh sửa",
                                                    style: "cancel"
                                                },
                                                {
                                                    text: "Hủy thay đổi",
                                                    onPress: handleCancel
                                                }
                                            ]
                                        );
                                    } else {
                                        handleCancel();
                                    }
                                }}
                            >
                                <Text style={[styles.buttonText, styles.cancelButtonText]}>Hủy</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity 
                                style={[styles.button, styles.editButton]} 
                                onPress={handleEdit}
                            >
                                <Text style={styles.buttonText}>Chỉnh sửa</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.button, styles.deleteButton]} 
                                onPress={() => {
                                    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa công việc này không?", [
                                        {
                                            text: "Hủy",
                                            style: "cancel"
                                        },
                                        { text: "Xóa", onPress: handleDelete }
                                    ]);
                                }}
                            >
                                <Text style={[styles.buttonText, styles.deleteButtonText]}>Xóa</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {renderContent()}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  employeeId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  employeeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    marginVertical: 4,
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#eee',
    color: '#666',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  inputLabel: {
    width: 80,
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#4CD964',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#8E8E93',
  },
  cancelButtonText: {
    color: '#8E8E93',
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
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#4CD964',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
  },
  deleteButtonText: {
    color: '#fff',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#4CD964',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CD964',
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#666',
  },
});