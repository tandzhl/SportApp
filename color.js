const Color = {
    muted: '#888',
    danger: "#FF3B30",
    success: "#34C759",
    warning: "#FFD60A",
}
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { IconButton } from "react-native-paper";
import { useEffect } from "react";
import axios from "axios";
import Apis, { endpoints } from "../GymApp/Apis";
import NewfeedScreen from "./screens/user/NewfeedScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NewsDetailScreen from "./screens/user/NewsDetailScreen"; 

const Stack = createNativeStackNavigator();

const App = () => {
    useEffect(() => {
        const autoLogin = async () => {
        try {
            const res = await axios.post('http://192.168.1.11:8000/auth/token/', {
              username: 'user1',
              password: '123'
            });

            await AsyncStorage.setItem('access_token', res.data.access);
            await AsyncStorage.setItem('refresh_token', res.data.refresh);

            const userRes = await Apis.get(endpoints['current-user'], {
            headers: {
                'Authorization': `Bearer ${res.data.access}`
            }
            });
            await AsyncStorage.setItem('user', JSON.stringify(userRes.data));

            console.log('Login successfully');
        } catch (err) {
            console.error('Login failed', err);
        }
        };
        autoLogin();
    }, []);

    return (
        <NavigationContainer>
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Text style={styles.header}>GymApp</Text>
              <TouchableOpacity>
                  <IconButton icon="menu" size={31} color="#000" />
              </TouchableOpacity>
            </View>
            <Stack.Navigator>
              <Stack.Screen name="newfeed" component={NewfeedScreen} options={{ title: "Newfeed" }} />
              <Stack.Screen name="newfeed-detail" component={NewsDetailScreen} options={{ title: "Post detail"}} />
            </Stack.Navigator>
          </View>
        </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 50,
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

export default App;