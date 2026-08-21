import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

export const requestMediaPermissions = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission to access gallery is required to upload X-rays or avatars!');
    return false;
  }
  return true;
};

export const requestLocationPermissions = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission to access location is required to find nearby dentists!');
    return false;
  }
  return true;
};
