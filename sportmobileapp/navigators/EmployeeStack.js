import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EmployeeScreen from "../components/Employee/EmployeeScreen";
import AddScheduleScreen from "../components/Employee/AddScheduleScreen";
import CheckOrderScreen from "../components/Employee/CheckOrderScreen";
import PushNotificationScreen from "../components/Employee/PushNotificationScreen";
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