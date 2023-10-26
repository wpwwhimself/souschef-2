import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = new Storage({
  size: 1000, // Maximum capacity
  storageBackend: AsyncStorage, // AsyncStorage is required as a storage backend
  defaultExpires: null, // No expiration for items
});

export const getKey = async (key: string) => {
  try {
    const data = await storage.load({ key: key });
    return data;
  } catch (error) {
    throw new Error(`Could not fetch ${key} from storage`);
  }
}

export const saveKey = (key: string, new_val: any) => {
  storage.save({
    key: key,
    data: new_val,
  });
};

export const deleteKey = (key: string) => {
  storage.remove({
    key: key
  });
};
