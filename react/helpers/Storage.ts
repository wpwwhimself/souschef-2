import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = new Storage({
  size: 1000, // Maximum capacity
  storageBackend: AsyncStorage, // AsyncStorage is required as a storage backend
  defaultExpires: null, // No expiration for items
});

const PASSWORD_KEY = 'magicWord';
const TOKEN_KEY = 'EANToken';

export const getPassword = async (): Promise<string | null> => {
  try {
    const password = await storage.load({ key: PASSWORD_KEY });
    return password;
  } catch (error) {
    throw new Error("No magic word found");
  }
};

export const setPassword = (password: string): void => {
  storage.save({
    key: PASSWORD_KEY,
    data: password,
  });
};

export const deletePassword = (): void => {
  storage.remove({
    key: PASSWORD_KEY,
  });
};

export const getEANToken = async (): Promise<string | null> => {
  try {
    const token = await storage.load({ key: TOKEN_KEY });
    return token;
  } catch (error) {
    console.log("No EAN API token");
    return undefined;
  }
}

export const setEANToken = (token: string): void => {
  storage.save({
    key: TOKEN_KEY,
    data: token,
  });
};