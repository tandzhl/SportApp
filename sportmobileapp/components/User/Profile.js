import { use, useContext, useEffect } from "react";
import { MyDispatchContext, MyUserContext } from "../../configs/Contexts";
import { Image, TouchableOpacity, View } from "react-native";
import { Button, List, Text } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import { useNavigation } from "@react-navigation/native";
import moment from 'moment';

const Profile = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const nav = useNavigation();

    const ProfileItem = ({ title, icon, style }) => {
        return <List.Item titleStyle={style} title={title} left={() => <List.Icon icon={icon} />} />
    }

    const logout = () => {
        dispatch({ "type": 'logout' });  // Xoá user khỏi context
        nav.reset({
            index: 0,
            routes: [{ name: 'Tabs' }], // quay về màn hình chứa TabNavigator
        });
    }

    return (
        <View style={[MyStyles.container, MyStyles.center]}>
            <Image source={{ uri: user.avatar }} style={[MyStyles.profile, MyStyles.m]} />
            <Text style={MyStyles.u_name}>{user.last_name} {user.first_name} </Text>
	        <Button onPress={logout} icon="logout" mode="outlined" style={MyStyles.m}>
                Đăng xuất
            </Button>
            <ProfileItem icon="account-circle"
                title={`${user.first_name} ${user.last_name}`} />
            <ProfileItem title={`${user.username}`} icon="login" />
            <ProfileItem title={moment(user.date_joined).fromNow()}
                icon="clock-time-nine-outline" />
            <TouchableOpacity style={[MyStyles.left]} onPress={() => nav.navigate('change-profile')}>
                <ProfileItem style={{ color: 'blue' }} title={'Thay đổi thông tin'} icon="account-edit" />
            </TouchableOpacity>
            <TouchableOpacity style={[MyStyles.left]} onPress={() => nav.navigate('change-pass')}>
                <ProfileItem style={{ color: 'blue' }} title={'Đổi mật khẩu'} icon="account-eye" />
            </TouchableOpacity>
        </View>
    );    
}

export default Profile;