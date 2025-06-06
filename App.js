import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "./screens/Header";
import { useEffect, useReducer, useRef, useState } from "react";
import MemberStack from "./navigators/MemberStack"
import EmployeeStack from "./navigators/EmployeeStack";
import AuthStack from "./navigators/AuthStack"
import MyUserReducer from "./reducers/MyUserReducer";
import { MyUserContext, MyDispatchContext } from "./configs/MyContexts";
import { PaperProvider } from "react-native-paper";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminScreen from './screens/admin/AdminScreen';


export default function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  const [checkingLogin, setCheckingLogin] = useState(true);
  const navigationRef = useRef();

  const Stack = createNativeStackNavigator();

  const loadUser = async () => {
    try {
      const data = await AsyncStorage.getItem('user');
      if (data) {
        const parsedData = JSON.parse(data);
        const cleanData = parsedData._z || parsedData; 
        dispatch({ type: "login", payload: cleanData });
      }
    } catch (err) {
      console.error("Error loading user:", err);
    } finally {
      setCheckingLogin(false);
    }
  };

  useEffect(() => {    
    loadUser();
  }, []);

  if (checkingLogin) return null;

  const AdminStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="admin-stats" component={AdminScreen} options={{headerShown: false}}/>
  </Stack.Navigator>
)

  const getNavigator = () => {
    const userRole = user?._z?.role || user?.role; 
    console.log("User role:", userRole);
    if (!user || !userRole) return <AuthStack />;
    if (userRole === "member") return <MemberStack />;
    if (userRole === "employee") return <EmployeeStack />;
    if (userRole === "admin") return <AdminStack />
    return <AuthStack />;
  };

  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        <PaperProvider>
          <NavigationContainer ref= {navigationRef} key={user?._z?.role || user?.role || "auth"}>
            <Header onLogout={async () => {
              await AsyncStorage.clear();
              dispatch({ type: "logout" });
            }} />
            {getNavigator()}
          </NavigationContainer>
        </PaperProvider>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
  );
}


// const MemberStack = () => (
//   <Stack.Navigator>
//     <Stack.Screen name="member-home" component={MemberScreen} />
//     <Stack.Screen name="newfeed" component={NewfeedScreen} options={{ title: "Newfeed" }} />
//     <Stack.Screen name="newfeed-detail" component={NewsDetailScreen} options={{ title: "Post detail"}} />
//   </Stack.Navigator>
// )

// const EmployeeStack = () => (
//   <Stack.Navigator>
//     <Stack.Screen name="employee-home" component={EmployeeScreen} />
//   </Stack.Navigator>
// )

// export default function App() {
//   const [role, setRole] = useState(null);
//   const [checkingLogin, setCheckingLogin] = useState(true);

//   useEffect(() => {
//     const checkLogin = async () => {
//       try {
//         const userData = await AsyncStorage.getItem('user');
//         if(userData) {
//           const user = JSON.parse(userData);
//           if(user?.token && user?.role) {
//             setRole(user.role);
//           } else {
//             await AsyncStorage.removeItem("user");
//             setRole(null);
//           }
//         } else {
//           setRole(null);
//         }
//       } catch (error) {
//         console.error("Error loading user from storage:", error);
//         setRole(null);
//       } finally {
//         setCheckingLogin(false);
//       }
      
//     };
//     checkLogin();
//   }, []);

//   const handleLogout = async () => {
//     await AsyncStorage.multiRemove(['user', 'access_token', 'refresh_token']);
//     setRole(null);
//   }

//   if(checkingLogin) {
//     return null;
//   }

//   return (
//     <NavigationContainer>
//       <Header onLogout={handleLogout} />
//       <Stack.Navigator screenOptions={{headerShown: false}}>
//         { role === null && (
//           <Stack.Screen name='login'>
//             {props => <Login {...props} onLoginSuccess = {(userRole) => setRole(userRole)} />}
//           </Stack.Screen>
//         )}
//         {role === 'member' && (
//           <Stack.Screen name='memberStack' component={MemberStack} />
//         )}
//         {role === 'employee' && (
//           <Stack.Screen name='employeeStack' component={EmployeeStack} />
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//     backgroundColor: '#f0f0f0',
//     marginBottom: 50,
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 25,
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: "#21244d",
//   },
// });