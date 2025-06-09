import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./components/Home/Home";
import { ActivityIndicator, Icon, PaperProvider } from "react-native-paper";
import Login from "./components/User/Login";
import Register from "./components/User/Register";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SClass from "./components/Home/SClass";
import { useContext, useEffect, useReducer, useState } from "react";
import { MyDispatchContext, MyUserContext } from "./configs/Contexts";
import Profile from "./components/User/Profile";
import MyUserReducer from "./reducers/MyUserReducer";
import ChangeProfile from "./components/User/Change/ChageProfile";
import ChangePass from "./components/User/Change/ChangePass";
import Coach from "./components/Coach/Coach";
import Admin from "./components/Admin/Admin";
import CoachProfile from "./components/Home/CoachProfile";
import ListStudents from "./components/Coach/ListStudents";
import SchedulesManager from "./components/Coach/SchedulesManager";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MyStyles from "./styles/MyStyles";
import AddSchedule from "./components/Coach/AddSchedule";
import UpdateSchedule from "./components/Coach/UpdateSchedule";
import CreateUser from "./components/Admin/CreateUser";
import ManageUsersScreen from "./components/Admin/UserManager";
import ManageAccount from "./components/Admin/ManageAccount";
import PayOrder from "./components/Home/PayOrder";
import UserClasses from "./components/Home/UserClasses";
import NewfeedScreen from "./components/User/NewfeedScreen";
import NewsDetailScreen from "./components/User/NewsDetailScreen";
import AdminStatsScreen from "./components/Admin/AdminStatsScreen"
import EmployeeScreen from "./components/Employee/EmployeeScreen";
import CheckOrderScreen from "./components/Employee/CheckOrderScreen";
import AddScheduleScreen from "./components/Employee/AddScheduleScreen";
import PushNotificationScreen from "./components/Employee/PushNotificationScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RegistedClasses from "./components/Home/RegistedClasses";
import UnpaidOrders from "./components/Home/UnpaidOrders";
import ScheduleCalendar from "./components/Home/ScheduleCalendar";

const Stack = createNativeStackNavigator();
const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="home" component={Home} options={{title:"Các lớp học"}}/>
      <Stack.Screen name="class" component={SClass} options={{title:"Lịch"}}/>
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
      </>:
      <> 
        {user.role === "coach" && (<Tab.Screen name="Coach" component={Coach} options={{ title: "Huấn luyện viên", tabBarIcon: () => <Icon size={30} source="whistle" /> }}/>)}
        {user.role === "admin" && (<Tab.Screen name="Admin" component={Admin} options={{ title: "Quản trị viên", tabBarIcon: () => <Icon size={30} source="shield-account" /> }}/>)}
        {user.role === "employee" && (<Tab.Screen name="Employee" component={EmployeeScreen} options={{ title: "Nhân viên", tabBarIcon: () => <Icon size={30} source="shield-account" /> }}/>)}
        <Tab.Screen name="profile" component={Profile} options={{title:"Tài khoản", tabBarIcon: () => <Icon size={30} source="account" />}}/>
        <Tab.Screen name="Bảng tin" component={NewfeedScreen} options={{tabBarIcon: () => <Icon size={30} source="post" />}}/>
        <Tab.Screen name="Khóa học" component={UserClasses} options={{tabBarIcon: () => <Icon size={30} source="notebook-outline" />}}/>
      </>}
      
    </Tab.Navigator>
  );
}

const MainStack = createNativeStackNavigator();
const MainStackNavigator = () => {
  return(
    <MainStack.Navigator screenOptions={{headerShown: false}}>
      <MainStack.Screen name={'Tabs'} component={TabNavigator} />
      <MainStack.Screen name={'change-profile'} component={ChangeProfile} />
      <MainStack.Screen name={'change-pass'} component={ChangePass} />
      <MainStack.Screen name={'coach-profile'} component={CoachProfile} />
      <MainStack.Screen name={'list-students'} component={ListStudents} />
      <MainStack.Screen name={'schedules-manager'} component={SchedulesManager} />
      <MainStack.Screen name={'add-schedule'} component={AddSchedule} />
      <MainStack.Screen name={'update-schedule'} component={UpdateSchedule} />
      <MainStack.Screen name={'create-user'} component={CreateUser} />
      <MainStack.Screen name={'user-manager'} component={ManageUsersScreen} />
      <MainStack.Screen name={'manage-account'} component={ManageAccount} />
      <MainStack.Screen name={'pay-order'} component={PayOrder} />
      <MainStack.Screen name={'newfeed'} component={NewfeedScreen} />
      <MainStack.Screen name={'newfeed-detail'} component={NewsDetailScreen} />
      <MainStack.Screen name={'admin-stats'} component={AdminStatsScreen} />
      <MainStack.Screen name={'employee-stack'} component={EmployeeStack} />
      <MainStack.Screen name={'registed-classes'} component={RegistedClasses} />
      <MainStack.Screen name={'unpaid-orders'} component={UnpaidOrders} />
      <MainStack.Screen name={'schedule-calendar'} component={ScheduleCalendar} />
    </MainStack.Navigator>
  );
}

const EmpStack = createNativeStackNavigator()
const EmployeeStack = () => (
  <EmpStack.Navigator initialRouteName="employee-home">
    <EmpStack.Screen name="employee-home" component={EmployeeScreen} options={{headerShown: false}}/>
    <EmpStack.Screen name="employee-order" component={CheckOrderScreen} options={{headerShown: false}}/>
    <EmpStack.Screen name="employee-add-schedule" component={AddScheduleScreen} options={{headerShown: false}} />
    <EmpStack.Screen name="employee-push-notification" component={PushNotificationScreen} options={{headerShown: false}} />
  </EmpStack.Navigator>
);

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <PaperProvider>
          <MyUserContext.Provider value={user}>
            <MyDispatchContext.Provider value={dispatch}>
              <NavigationContainer>
                <MainStackNavigator />
              </NavigationContainer>
            </MyDispatchContext.Provider>
          </MyUserContext.Provider>
        </PaperProvider> 
      </SafeAreaProvider>
    </GestureHandlerRootView>   
  );
}

export default App;