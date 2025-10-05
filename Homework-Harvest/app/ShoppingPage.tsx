// shoppingPage.tsx
import { useCurrency } from '@/components/CurrencyContext';
import { Image } from 'expo-image';
import React from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ShoppingPageProps {
  onClose: () => void;
  onOutfitChange?: (outfit: string) => void; // optional callback
}

// Updated outfit IDs to match PlayerController costumeImages
const OUTFITS = [
  { id: 'alien', name: 'Alien', price: 50, image: require('@/assets/images/Alien Costume 2.png') },
  { id: 'wizard', name: 'Wizard', price: 70, image: require('@/assets/images/Wizard Costume 2.png') },
  { id: 'cat', name: 'Cat', price: 100, image: require('@/assets/images/Cat Costume 2.png') },
];

// Seeds inventory
const SEEDS = [
  { id: 'pumpkin', name: 'Pumpkin Seeds', price: 300, icon: '🎃', description: 'Doubles pumpkins from completed tasks!' },
  { id: 'pepper', name: 'Pepper Seeds', price: 400, icon: '🌶️', description: 'Makes you bigger for 2 tasks!' },
];

export default function ShoppingPage({
  onClose,
  onOutfitChange,
}: ShoppingPageProps) {
  const {
    currency,
    add_currency,
    ownedOutfits,
    setOwnedOutfits,
    currentOutfit,
    equipOutfit,
    ownedSeeds,
    setOwnedSeeds,
    useSeed,
    activePumpkinBoost,
    pepperEffect,
  } = useCurrency();

  const handlePurchase = (outfitId: string, price: number) => {
    if (ownedOutfits.includes(outfitId)) {
      Alert.alert('Already Owned', 'You already own this outfit.');
      return;
    }
    if ((currency ?? 0) < price) {
      Alert.alert('Not Enough Coins', 'You do not have enough coins.');
      return;
    }

    add_currency(-price);
    setOwnedOutfits(prev => [...prev, outfitId]);
  };

  const handleEquip = (outfitId: string) => {
    if (!ownedOutfits.includes(outfitId)) {
      Alert.alert('Not Owned', 'You need to buy this outfit first.');
      return;
    }
    const success = equipOutfit(outfitId);
    if (success && typeof onOutfitChange === 'function') onOutfitChange(outfitId);
  };

  const handleUnequip = () => {
    if (currentOutfit === 'default') {
      Alert.alert('Already Default', 'You are already wearing the default outfit.');
      return;
    }
    const success = equipOutfit('default');
    if (success && typeof onOutfitChange === 'function') onOutfitChange('default');
  };

  const handleSeedPurchase = (seedId: string, price: number) => {
    if ((currency ?? 0) < price) {
      Alert.alert('Not Enough Coins', 'You do not have enough coins.');
      return;
    }

    add_currency(-price);
    setOwnedSeeds(prev => ({ ...prev, [seedId]: (prev[seedId] || 0) + 1 }));
    Alert.alert('Purchase Successful', 'Seeds added to inventory!');
  };

  const renderOutfit = ({ item }: { item: typeof OUTFITS[0] }) => {
    const owned = ownedOutfits.includes(item.id);
    const equipped = currentOutfit === item.id;

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemContent}>
          <View style={styles.itemImageContainer}>
            <Image source={item.image} style={styles.costumeImage} />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>{item.price} coins</Text>
          </View>
          <View style={styles.buttonContainer}>
            {equipped ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.unequipButton]}
                onPress={handleUnequip}
              >
                <Text style={styles.buttonText}>Unequip</Text>
              </TouchableOpacity>
            ) : owned ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.equipButton]}
                onPress={() => handleEquip(item.id)}
              >
                <Text style={styles.buttonText}>Equip</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handlePurchase(item.id, item.price)}
              >
                <Text style={styles.buttonText}>Buy</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderSeed = ({ item }: { item: typeof SEEDS[0] }) => {
    const owned = ownedSeeds[item.id] || 0;
    const canUse = owned > 0;
    
    // Check if effect is already active
    const effectActive = item.id === 'pumpkin' ? activePumpkinBoost : 
                        item.id === 'pepper' ? pepperEffect.active : false;

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemContent}>
          <View style={styles.itemImageContainer}>
            <View style={styles.seedIconContainer}>
              <Text style={styles.seedIcon}>{item.icon}</Text>
            </View>
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>{item.price} coins</Text>
            <Text style={styles.seedDescription}>{item.description}</Text>
            {owned > 0 && <Text style={styles.ownedText}>Owned: {owned}</Text>}
            {effectActive && (
              <Text style={styles.activeEffectText}>
                {item.id === 'pumpkin' ? 'Effect Active!' : 
                 `Effect Active! (${pepperEffect.tasksRemaining} tasks left)`}
              </Text>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSeedPurchase(item.id, item.price)}
            >
              <Text style={styles.buttonText}>Buy</Text>
            </TouchableOpacity>
            {canUse && !effectActive && (
              <TouchableOpacity
                style={[styles.actionButton, styles.useButton]}
                onPress={() => useSeed(item.id)}
              >
                <Text style={styles.buttonText}>
                  {item.id === 'pumpkin' ? 'Use' : 'Eat'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top bar with coins + shop title */}
      <View style={styles.topBar}>
        <View style={styles.coinDisplay}>
          <Image source={require('@/assets/images/Coin.png')} style={styles.coinIcon} />
          <Text style={styles.currencyText}>{currency ?? 0} coins</Text>
        </View>
        <Text style={styles.shopTitle}>Shop</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Costumes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Costumes</Text>
          <FlatList
            data={OUTFITS}
            renderItem={renderOutfit}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.sectionContent}
          />
        </View>

        {/* Seeds Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seeds</Text>
          <FlatList
            data={SEEDS}
            renderItem={renderSeed}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.sectionContent}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5E6B8' // Warm beige background
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#D2A679', // Warm brown
    borderBottomWidth: 2,
    borderBottomColor: '#A0845C',
  },
  coinDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  coinIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  currencyText: { 
    color: '#8B4513', 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  shopTitle: {
    color: '#8B4513',
    fontSize: 24,
    fontWeight: 'bold',
  },
  spacer: {
    width: 60, // Same width as coinDisplay to balance layout
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 12,
    marginLeft: 8,
  },
  sectionContent: {
    gap: 8,
  },
  itemContainer: {
    backgroundColor: '#E6CC8A', // Light warm tan
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D2A679',
    overflow: 'hidden',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  costumeImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  seedIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#F5E6B8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D2A679',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seedIcon: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 14,
    color: '#A0845C',
    fontWeight: '600',
  },
  seedDescription: {
    fontSize: 12,
    color: '#8B4513',
    fontStyle: 'italic',
    marginTop: 2,
  },
  ownedText: {
    fontSize: 12,
    color: '#8B4513',
    fontStyle: 'italic',
    marginTop: 2,
  },
  activeEffectText: {
    fontSize: 12,
    color: '#228B22',
    fontWeight: 'bold',
    marginTop: 2,
  },
  buttonContainer: {
    minWidth: 80,
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  useButton: {
    backgroundColor: '#FF6347', // Tomato color for use/eat button
  },
  equipButton: {
    backgroundColor: '#228B22', // Green for equip
  },
  unequipButton: {
    backgroundColor: '#DC143C', // Crimson red for unequip
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  equippedText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#228B22',
    textAlign: 'center',
  },
});
