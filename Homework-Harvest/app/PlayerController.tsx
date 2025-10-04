import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useState, useRef } from 'react';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PlayerController() {
  const [position, setPosition] = useState({ x: SCREEN_WIDTH / 2 - 20, y: SCREEN_HEIGHT / 2 - 20 });
  const animatedX = useRef(new Animated.Value(SCREEN_WIDTH / 2 - 20)).current;
  const animatedY = useRef(new Animated.Value(SCREEN_HEIGHT / 2 - 20)).current;

  const MOVE_SPEED = 20;
  const CHARACTER_SIZE = 40;

  const moveLeft = () => {
    setPosition(prev => {
      const newX = Math.max(0, prev.x - MOVE_SPEED);
      Animated.timing(animatedX, {
        toValue: newX,
        duration: 100,
        useNativeDriver: false,
      }).start();
      return { ...prev, x: newX };
    });
  };

  const moveRight = () => {
    setPosition(prev => {
      const newX = Math.min(SCREEN_WIDTH - CHARACTER_SIZE, prev.x + MOVE_SPEED);
      Animated.timing(animatedX, {
        toValue: newX,
        duration: 100,
        useNativeDriver: false,
      }).start();
      return { ...prev, x: newX };
    });
  };

  const moveUp = () => {
    setPosition(prev => {
      const newY = Math.max(0, prev.y - MOVE_SPEED);
      Animated.timing(animatedY, {
        toValue: newY,
        duration: 100,
        useNativeDriver: false,
      }).start();
      return { ...prev, y: newY };
    });
  };

  const moveDown = () => {
    setPosition(prev => {
      const newY = Math.min(SCREEN_HEIGHT - CHARACTER_SIZE - 150, prev.y + MOVE_SPEED);
      Animated.timing(animatedY, {
        toValue: newY,
        duration: 100,
        useNativeDriver: false,
      }).start();
      return { ...prev, y: newY };
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.gameArea}>
        <Animated.View
          style={[
            styles.character,
            {
              left: animatedX,
              top: animatedY,
            },
          ]}
        >
          <Text style={styles.characterText}>🧑</Text>
        </Animated.View>
      </View>
      <View style={styles.controlsContainer}>
        <View style={styles.arrowContainer}>
          <View style={styles.arrowRow}>
            <TouchableOpacity style={styles.arrowButton} onPress={moveUp}>
              <Text style={styles.arrow}>↑</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.arrowRow}>
            <TouchableOpacity style={styles.arrowButton} onPress={moveLeft}>
              <Text style={styles.arrow}>←</Text>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity style={styles.arrowButton} onPress={moveRight}>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.arrowRow}>
            <TouchableOpacity style={styles.arrowButton} onPress={moveDown}>
              <Text style={styles.arrow}>↓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#90EE90',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  character: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterText: {
    fontSize: 40,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
  },
  arrowContainer: {
    alignItems: 'center',
  },
  arrowRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginVertical: 5,
  },
  arrowButton: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  arrow: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  spacer: {
    width: 60,
  },
});