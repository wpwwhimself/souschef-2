import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = new Storage({
  size: 1000, // Maximum capacity
  storageBackend: AsyncStorage, // AsyncStorage is required as a storage backend
  defaultExpires: null, // No expiration for items
});

export const getKey = async (key: string) =>
  storage.load({ key: key })
    .then(res => res)
    .catch(err => {
      setKey(key, "");
      getKey(key);
    })

export const setKey = (key: string, new_val: any) => {
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
