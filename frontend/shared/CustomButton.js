import React from 'react';
import { Button } from 'react-native-elements';

export default function CustomButton({ title, onPress, isLoading = false, style = {} }) {
  return (
    <Button
      title={title}
      onPress={onPress}
      loading={isLoading}
      buttonStyle={{
        backgroundColor: '#4CAF50',
        borderRadius: 10,
        paddingVertical: 12,
        // ...style.button,
      }}
      titleStyle={{
        fontWeight: 'bold',
        fontSize: 16,
        color: '#fff',
        // ...style.title,
      }}
      containerStyle={{
        marginVertical: 10,
        alignSelf: 'center',
        width: '80%',
        ...style,
      }}
    />
  );
}
