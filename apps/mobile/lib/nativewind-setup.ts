import { cssInterop } from 'nativewind';
import { View, Text, ScrollView, Image, Pressable } from 'react-native';

// Set up cssInterop for React Native core components
// This is required for NativeWind v4 to work with className on native components
cssInterop(View, { className: 'style' });
cssInterop(Text, { className: 'style' });
cssInterop(ScrollView, { 
  className: 'style',
  contentContainerClassName: 'contentContainerStyle'
});
cssInterop(Image, { className: 'style' });
cssInterop(Pressable, { className: 'style' });