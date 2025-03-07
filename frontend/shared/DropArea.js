import { StyleSheet, View, Text} from 'react-native';
import { useState } from 'react';
import Penny from "./Penny.js";

export default function DropArea ({title, elements, status, setActiveCoin }) {
  return (
    <View style={styles.dropArea}>
        <Text style={styles.dropAreaTitle}>{title}</Text>
        <View style={styles.coinContainer}>
            {elements.map(
                (element, index) =>
                    (
                        <Penny key={index} index={element.index} setActiveCoin={setActiveCoin} />
                    )
            )}
        </View>
    </View>

  );
}

const styles = StyleSheet.create({
    dropArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '45%',
        margin: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 20,
      },
      dropAreaTitle: {
        fontSize: 18,
        marginBottom: 10,
        fontWeight: 'bold',
      },
      coinContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
      },
});