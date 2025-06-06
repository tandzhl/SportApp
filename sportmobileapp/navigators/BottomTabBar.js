import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; 

const BottomTabBar = ({ navigation }) => {
  return (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('employee-home')} 
      >
        <Icon name="dashboard" size={30} color="#446b50" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('employee-push-notification')} 
      >
        <Icon name="add" size={30} color="#446b50" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('employee-order')} 
      >
        <Icon name="info" size={30} color="#446b50" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    elevation: 5, // Đổ bóng trên Android
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
  },
});

export default BottomTabBar;