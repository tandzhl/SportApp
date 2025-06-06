import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NewfeedScreen from "../components/User/NewfeedScreen";
import NewsDetailScreen from "../components/User/NewsDetailScreen";
import MemberScreen from "../screens/user/MemberScreen";

const Stack = createNativeStackNavigator();

const MemberStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="member-home" component={MemberScreen} />
    <Stack.Screen name="newfeed" component={NewfeedScreen} options={{ title: "Newfeed" }} />
    <Stack.Screen name="newfeed-detail" component={NewsDetailScreen} options={{ title: "Post detail"}} />
  </Stack.Navigator>
)

export default MemberStack;