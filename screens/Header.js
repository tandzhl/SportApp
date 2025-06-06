import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { IconButton } from "react-native-paper";
import React from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";

const Header = ({onLogout}) => {
  const navigation = useNavigation();

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
      navigation.reset({
        index: 0,
        routes: [{name: 'login'}],
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
    
    return (
        <View style={styles.container}>
        <View style={styles.headerContainer}>
            <Text style={styles.header}>GymApp</Text>
            <TouchableOpacity>
                <IconButton icon="menu" size={31} iconColor="#000" onPress={onLogout} />
            </TouchableOpacity>
        </View>
        </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 20,
    backgroundColor: '#f0f0f0',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#21244d",
  },
});

export default Header;
//  {
//         "id": 1,
//         "datetime": "2025-05-16T07:50:11Z",
//         "sportclass": {
//             "id": 1,
//             "name": "yoga1",
//             "created_at": "2025-05-30T15:53:20.651489Z",
//             "description": "<p>Experience the feeling of being &ldquo;present&rdquo; and focusing on your breath, body and spirit. In yoga, the constant and continual awareness of the breath to movement flow calms the mind, invigorates the body, and increases awareness.&nbsp;</p>",
//             "coach": {
//                 "id": 6,
//                 "username": "yoga_coach1",
//                 "email": "nhi@gmail.com",
//                 "first_name": "nhi",
//                 "last_name": "nguyen",
//                 "role": "coach",
//                 "avatar": "https://res.cloudinary.com/ds4oggqzq/image/upload/v1748620358/j0puikyqjpp2skvavcp4.jpg"
//             },
//             "image": "https://res.cloudinary.com/ds4oggqzq/image/upload/v1748620400/ryknppevvangh7bypjqs.jpg",
//             "category_id": 1,
//             "price": 200000.0
//         },
//         "place": "American Canyon, CA 120 W. American Canyon Rd. , American Canyon, CA"
//     },