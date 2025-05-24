import { useContext } from "react";
import { MyDispatchContext, MyUserContext } from "../../configs/Contexts";
import { Image, View } from "react-native";
import { Button, List, Text } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import { useNavigation } from "@react-navigation/native";
import moment from 'moment';


const Profile = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const nav = useNavigation();

    const ProfileItem = ({ title, icon }) => {
        return <List.Item title={title} left={() => <List.Icon icon={icon} />} />
    }

    const logout = async () => {
        await new Promise((resolve) => {
            dispatch({ "type": "logout" });
            resolve();
        });
        nav.navigate("Trang chủ");
    }

    return (
        <View style={[MyStyles.container, MyStyles.center]}>
            <Image source={{ uri: user.avatar }} style={MyStyles.profile} />
            <Text style={MyStyles.u_name}>{user.first_name} {user.last_name}</Text>
            <Button onPress={logout} icon="logout" mode="outline">Đăng xuất</Button>
            <ProfileItem icon="account-circle"
                title={`${user.first_name} ${user.last_name}`} />
            <ProfileItem title={`${user.username}`} icon="login" />
            <ProfileItem title={moment(user.date_joined).fromNow()}
                icon="clock-time-nine-outline" />
        </View>
    );    

}


export default Profile;