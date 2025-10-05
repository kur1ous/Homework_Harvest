import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RainDrop {
  id: string;
  x: number;
  y: Animated.Value;
  speed: number;
  sprite: number;
}

interface FloorSplash {
  id: string;
  x: number;
  y: number;
  opacity: Animated.Value;
  sprite: number;
}

export default function Rain({ 
  isRaining = false,
  intensity = 50 
}: {
  isRaining?: boolean;
  intensity?: number;
}) {
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);
  const [floorSplashes, setFloorSplashes] = useState<FloorSplash[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const dropCounterRef = useRef(0);

  // Rain drop sprites
  const dropSprites = [
    require('@/assets/images/rain/drops/0.png'),
    require('@/assets/images/rain/drops/1.png'),
    require('@/assets/images/rain/drops/2.png'),
  ];

  // Floor splash sprites
  const floorSprites = [
    require('@/assets/images/rain/floor/0.png'),
    require('@/assets/images/rain/floor/1.png'),
    require('@/assets/images/rain/floor/2.png'),
  ];

  // Create a new rain drop
  const createRainDrop = (): RainDrop => {
    return {
      id: `drop_${dropCounterRef.current++}`,
      x: Math.random() * SCREEN_WIDTH,
      y: new Animated.Value(-20),
      speed: 3 + Math.random() * 4, // Speed between 3-7
      sprite: Math.floor(Math.random() * 3),
    };
  };

  // Create a floor splash
  const createFloorSplash = (x: number): FloorSplash => {
    return {
      id: `splash_${Date.now()}_${Math.random()}`,
      x: x,
      y: SCREEN_HEIGHT - 100, // Near bottom of screen
      opacity: new Animated.Value(1),
      sprite: Math.floor(Math.random() * 3),
    };
  };

  // Animate rain drops falling
  useEffect(() => {
    if (!isRaining) {
      setRainDrops([]);
      setFloorSplashes([]);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const animate = () => {
      setRainDrops(currentDrops => {
        const newDrops = [...currentDrops];
        
        // Add new drops based on intensity
        if (Math.random() < intensity / 100) {
          newDrops.push(createRainDrop());
        }

        // Update existing drops
        const updatedDrops = newDrops.map(drop => {
          const currentY = (drop.y as any)._value;
          const newY = currentY + drop.speed;
          
          if (newY > SCREEN_HEIGHT) {
            // Drop hit the ground, create splash
            setFloorSplashes(currentSplashes => {
              const splash = createFloorSplash(drop.x);
              
              // Fade out splash after creation
              Animated.timing(splash.opacity, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
              }).start();

              // Clean up old splashes
              const newSplashes = [...currentSplashes, splash];
              setTimeout(() => {
                setFloorSplashes(prev => prev.filter(s => s.id !== splash.id));
              }, 1000);

              return newSplashes;
            });
            
            return null; // Remove this drop
          }
          
          drop.y.setValue(newY);
          return drop;
        }).filter(Boolean) as RainDrop[];

        return updatedDrops;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRaining, intensity]);

  if (!isRaining) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Rain Drops */}
      {rainDrops.map(drop => (
        <Animated.View
          key={drop.id}
          style={[
            styles.rainDrop,
            {
              left: drop.x,
              top: drop.y,
            },
          ]}
        >
          <Image source={dropSprites[drop.sprite]} style={styles.dropImage} />
        </Animated.View>
      ))}

      {/* Floor Splashes */}
      {floorSplashes.map(splash => (
        <Animated.View
          key={splash.id}
          style={[
            styles.floorSplash,
            {
              left: splash.x,
              top: splash.y,
              opacity: splash.opacity,
            },
          ]}
        >
          <Image source={floorSprites[splash.sprite]} style={styles.splashImage} />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 1000, // Above everything else
  },
  rainDrop: {
    position: 'absolute',
    width: 8,
    height: 16,
  },
  dropImage: {
    width: 8,
    height: 16,
    resizeMode: 'contain',
  },
  floorSplash: {
    position: 'absolute',
    width: 16,
    height: 16,
  },
  splashImage: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
});