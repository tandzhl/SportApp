import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EmployeeScreen from "../screens/employee/EmployeeScreen";
import AddScheduleScreen from "../screens/employee/AddScheduleScreen";
import CheckOrderScreen from "../screens/employee/CheckOrderScreen";
import PushNotificationScreen from "../screens/employee/PushNotificationScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";


const Stack = createNativeStackNavigator();

const EmployeeStack = () => (
  <Stack.Navigator initialRouteName="employee-home">
    <Stack.Screen name="employee-home" component={EmployeeScreen} options={{headerShown: false}}/>
    <Stack.Screen name="employee-order" component={CheckOrderScreen} options={{headerShown: false}}/>
    <Stack.Screen name="employee-add-schedule" component={AddScheduleScreen} options={{headerShown: false}} />
    <Stack.Screen name="employee-push-notification" component={PushNotificationScreen} options={{headerShown: false}} />
  </Stack.Navigator>
);

export default EmployeeStack;