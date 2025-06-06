import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../screens/user/Login";

const Stack = createNativeStackNavigator();

const AuthStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="login" component={Login} options={{ title: "Đăng nhập" }} />
    </Stack.Navigator>
);

export default AuthStack;
