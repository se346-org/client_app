import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { RootStackParamList } from '../../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ToDoItem } from '../types/ToDoItem';
import { useFocusEffect } from "@react-navigation/native";
import todoItemService from '../services/TodoItemService';

type ToDoListScreenProps = NativeStackScreenProps<RootStackParamList, 'ToDoList'>;

export default function ToDoListScreen({ route, navigation }: ToDoListScreenProps) {
  const { username } = route.params;
  const [toDoItems, setToDoItems] = useState<ToDoItem[]>([]);

  async function loadTodoItems() {
      try {
          const items = await todoItemService.getTodoItems(username);
          setToDoItems(items);
      } catch (error) {
          console.error('Error loading todo items:', error);
      }
  }
  useFocusEffect(
      useCallback(() => {
          loadTodoItems();
      }, [loadTodoItems])
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('CreateToDo', { username })}
      >
        <Text style={styles.addButtonText}>+ Thêm mới</Text>
      </TouchableOpacity>

      <FlatList
        data={toDoItems}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.toDoCard}
            onPress={() => navigation.navigate('ToDoDetail', { username, toDoId: item.id })}
          >
            <Text style={styles.toDoName}>Công việc: {item.title}</Text>
            <View style={styles.toDoInfo}>
              <Text style={styles.infoText}>Mô tả: {item.description}</Text>
              <Text style={styles.infoText}>Trạng thái: {item.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}</Text>
              <Text style={styles.infoText}>Độ ưu tiên: {item.priority}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  toDoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  toDoName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  toDoInfo: {
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#4CD964',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    marginBottom: 0,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});