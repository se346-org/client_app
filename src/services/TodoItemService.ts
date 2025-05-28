import AsyncStorage from "@react-native-async-storage/async-storage";
import { ToDoItem } from "../types/ToDoItem";
import uuid from "react-native-uuid";

const TODO_ITEMS_KEY = "@todo_items";

export class TodoItemService {
  // Get all todo items for a specific user
  public async getTodoItems(userId: string): Promise<ToDoItem[]> {
    try {
      const items = await AsyncStorage.getItem(TODO_ITEMS_KEY);
      if (items) {
        const allItems: ToDoItem[] = JSON.parse(items);
        return allItems.filter((item) => item.userId === userId);
      }
      return [];
    } catch (error) {
      console.error("Error getting todo items:", error);
      return [];
    }
  }

  // Add a new todo item
  public async addTodoItem(
    todoItem: ToDoItem,
    userId: string
  ): Promise<ToDoItem> {
    try {
      const items = await AsyncStorage.getItem(TODO_ITEMS_KEY);
      const allItems: ToDoItem[] = items ? JSON.parse(items) : [];

      const newItem: ToDoItem = {
        ...todoItem,
        id: uuid.v4() as string, // Generate UUID v4
        userId: userId,
      };

      allItems.push(newItem);
      await AsyncStorage.setItem(TODO_ITEMS_KEY, JSON.stringify(allItems));
      return newItem;
    } catch (error) {
      console.error("Error adding todo item:", error);
      throw error;
    }
  }

  // Update an existing todo item
  public async updateTodoItem(todoItem: ToDoItem): Promise<ToDoItem> {
    try {
      const items = await AsyncStorage.getItem(TODO_ITEMS_KEY);
      if (!items) throw new Error("No items found");

      const allItems: ToDoItem[] = JSON.parse(items);
      const index = allItems.findIndex((item) => item.id === todoItem.id);

      if (index === -1) throw new Error("Item not found");

      allItems[index] = todoItem;
      await AsyncStorage.setItem(TODO_ITEMS_KEY, JSON.stringify(allItems));
      return todoItem;
    } catch (error) {
      console.error("Error updating todo item:", error);
      throw error;
    }
  }

  // Delete a todo item
  public async deleteTodoItem(id: string): Promise<void> {
    try {
      const items = await AsyncStorage.getItem(TODO_ITEMS_KEY);
      if (!items) return;

      const allItems: ToDoItem[] = JSON.parse(items);
      const filteredItems = allItems.filter((item) => item.id !== id);
      await AsyncStorage.setItem(TODO_ITEMS_KEY, JSON.stringify(filteredItems));
    } catch (error) {
      console.error("Error deleting todo item:", error);
      throw error;
    }
  }

  // Toggle todo item completion status
  public async toggleTodoItem(id: string): Promise<ToDoItem> {
    try {
      const items = await AsyncStorage.getItem(TODO_ITEMS_KEY);
      if (!items) throw new Error("No items found");

      const allItems: ToDoItem[] = JSON.parse(items);
      const index = allItems.findIndex((item) => item.id === id);

      if (index === -1) throw new Error("Item not found");

      allItems[index] = {
        ...allItems[index],
        completed: !allItems[index].completed,
      };

      await AsyncStorage.setItem(TODO_ITEMS_KEY, JSON.stringify(allItems));
      return allItems[index];
    } catch (error) {
      console.error("Error toggling todo item:", error);
      throw error;
    }
  }
}

const todoItemService = new TodoItemService();
export default todoItemService;
