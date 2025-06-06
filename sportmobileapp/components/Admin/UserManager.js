import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Icon, IconButton } from 'react-native-paper';
import { authApis, endpoints } from '../../configs/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminStyles from './AdminStyles';

const ManageUsersScreen = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    
    const loadUsers = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).get(endpoints['list-users']);
            setUsers(res.data);
        } catch (err) {
            console.error("LOAD USERS ERROR:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };
    

    useEffect(() => {
        loadUsers();
    }, [users]);

        const renderItem = ({ item }) => (
            <View style={AdminStyles.row}>
                <Text style={AdminStyles.cell}>{item.username}</Text>
                <Text style={AdminStyles.nameCell}>{item.last_name} {item.first_name}</Text>
                <Text style={AdminStyles.cell}>{item.role}</Text>
            <TouchableOpacity
                style={AdminStyles.iconCell}
                onPress={() => navigation.navigate('change-profile', { 
                    userId: item.id,
                    token: token,
                })}
            >
                <IconButton
                        icon="pencil"
                        size={20}
                        iconColor="#007bff"
                        onPress={() => navigation.navigate("manage-account", {
                            userId: item.id,
                        })}
                    />
            </TouchableOpacity>
            </View>
        );

    return (
        <View style={AdminStyles.container}>
        {/* Header */}
        <View style={[AdminStyles.row, AdminStyles.headerRow]}>
            <Text style={[AdminStyles.cell, AdminStyles.headerText]}>Username</Text>
            <Text style={[AdminStyles.nameCell, AdminStyles.headerText]}>Họ và tên</Text>
            <Text style={[AdminStyles.cell, AdminStyles.headerText]}>Vai trò</Text>
            <Text style={[AdminStyles.iconCell, AdminStyles.headerText]}>Sửa</Text>
        </View>

        <FlatList
            data={users}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
        />
        </View>
    );
};

export default ManageUsersScreen;