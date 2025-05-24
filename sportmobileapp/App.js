import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./components/Home/Home";
import { Icon } from "react-native-paper";
import Login from "./components/User/Login";
import Register from "./components/User/Register";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SClass from "./components/Home/SClass";
import { useContext, useReducer } from "react";
import { MyDispatchContext, MyUserContext } from "./configs/Contexts";
import Profile from "./components/User/Profile";
import MyUserReducer from "./reducers/MyUserReducer";

const Stack = createNativeStackNavigator();
const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen name="home" component={Home} options={{title:"Các lớp học"}}/>
      <Tab.Screen name="class" component={SClass} options={{title:"Lịch"}}/>
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();
const TabNavigator = () => {
  const user = useContext(MyUserContext);

  return (
    <Tab.Navigator screenOptions={{headerShown: true}}>
      <Tab.Screen name="Trang chủ" component={StackNavigator} options={{tabBarIcon: () => <Icon size={30} source="home" />}}/>
      {user === null?<>
        <Tab.Screen name="login" component={Login} options={{title:"Đăng nhập", tabBarIcon: () => <Icon size={30} source="account" />}}/>
        <Tab.Screen name="register" component={Register} options={{title:"Đăng ký", tabBarIcon: () => <Icon size={30} source="account-plus" />}}/>  
      </>:<>
        <Tab.Screen name="profile" component={Profile} options={{title:"Tài khoản", tabBarIcon: () => <Icon size={30} source="account" />}}/>
      </>}

      
    </Tab.Navigator>
  );
}

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
    
  );
}

export default App;