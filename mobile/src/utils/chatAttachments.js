import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

const MAX_SIZE = 10 * 1024 * 1024;

const mimeFromName = (name = '') => {
  const extension = name.toLowerCase().split('.').pop();
  if (extension === 'pdf') return 'application/pdf';
  if (extension === 'png') return 'image/png';
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  return '';
};

const validate = (asset) => {
  const name = asset.name || asset.fileName || asset.uri?.split('/').pop() || 'attachment';
  const mimeType = asset.mimeType || mimeFromName(name) || (
    asset.type === 'image' ? 'image/jpeg' : asset.type
  );
  const supported = ['application/pdf', 'image/jpeg', 'image/png'].includes(mimeType);

  if (!supported) {
    Alert.alert('Unsupported file', 'Select a PDF, JPG, JPEG, or PNG file.');
    return null;
  }
  if (asset.fileSize > MAX_SIZE || asset.size > MAX_SIZE) {
    Alert.alert('File too large', 'Attachments must be 10 MB or smaller.');
    return null;
  }
  return { uri: asset.uri, name, mimeType, size: asset.fileSize || asset.size };
};

export const chooseChatAttachment = () =>
  new Promise((resolve) => {
    const finish = (asset) => {
      try {
        resolve(asset ? validate(asset) : null);
      } catch (error) {
        console.error('[chat attachment] File selection failed:', error);
        Alert.alert('File selection failed', 'Unable to read the selected file.');
        resolve(null);
      }
    };

    const chooseGallery = async () => {
      try {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission required', 'Allow photo access to select an X-ray image.');
          return finish(null);
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
          allowsEditing: false,
        });
        finish(result.canceled ? null : result.assets?.[0]);
      } catch (error) {
        console.error('[chat attachment] Gallery selection failed:', error);
        Alert.alert('Gallery error', 'Unable to open the photo library.');
        finish(null);
      }
    };

    const chooseFile = async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'image/jpeg', 'image/png'],
          multiple: false,
          copyToCacheDirectory: true,
        });
        finish(result.canceled ? null : result.assets?.[0]);
      } catch (error) {
        console.error('[chat attachment] File selection failed:', error);
        Alert.alert('File picker error', 'Unable to open the file browser.');
        finish(null);
      }
    };

    Alert.alert('Attach file', 'Choose where to select the attachment', [
      {
        text: 'Gallery',
        onPress: chooseGallery,
      },
      {
        text: 'Files',
        onPress: chooseFile,
      },
      { text: 'Cancel', style: 'cancel', onPress: () => finish(null) },
    ]);
  });
