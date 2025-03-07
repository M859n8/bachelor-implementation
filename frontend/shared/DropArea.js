import { StyleSheet} from 'react-native';
import { useState } from 'react';

export default function DropArea ({title, elements  }) {
  return (
      <section style={styles.container}>
        <h2>{title}</h2>
         

      </section>
  );
}

const styles = StyleSheet.create({
  container: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'red',
      margin: 10 
  },

});