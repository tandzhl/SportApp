import { FlatList, StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import BottomTabBar from "../../navigators/BottomTabBar";
import { IconButton } from "react-native-paper";
import { useState, useEffect } from "react";
import Apis, { authApis, endpoints } from "../../configs/Apis";

const CheckOrderScreen = ({ navigation }) => {
    const LIMIT = 10;
    const [q, setQ] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const [selectedUser, setSelectedUser] = useState(null);
    const [orders, setOrders] = useState([]); 

    const loadUsers = async () => {
        if (offset >= 0) {
            setLoading(true);
            try {
                const res = await authApis().get(`${endpoints['users-by-role']}?role=member&username=${q}&limit=${LIMIT}&offset=${offset}`);
                const data = res.data.results || [];

                if (offset === 0) {
                    setUsers(data);
                } else {
                    setUsers((prev) => [...prev, ...data]);
                }

                if (!res.data.next) setOffset(-1); 

            } catch (error) {
                console.error("Lỗi khi load user: ", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const loadUserOrders = async(userId) => {
        setLoading(true);
        try {
            const res = await authApis().get(`${endpoints['orders']}?user_id=${userId}`);
            const data = res.data || [];
            setOrders(data)
        } catch (error) {
            console.error("Lỗi khi load order của user: ", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            loadUsers();
        }, 500);

        return () => clearTimeout(timer);
    }, [q, offset]);

    const search = (value, callback) => {
        setOffset(0);
        setUsers([]);
        setSelectedUser(null);
        setOrders([]);
        callback(value);
    };

    const loadMoreUsers = () => {
        if (!loading && offset >= 0) {
        setOffset(offset + LIMIT);
        }
    };


    const handleUserSelect = (user) => {
        setSelectedUser(user);
        loadUserOrders(user.id);
    };

    const updatePaidStatus = async(orderId) => {
        try{
            const res = await authApis().patch(endpoints['order-update-paid'](orderId));
            const data = res.data;
            setOrders((prevOrders) => prevOrders.map((order) => order.id === data.id ? data : order));
            Alert.alert("Success", "Updated paid status successfully!", [{text: "OK"}]);
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái thanh toán: ", error);
            Alert.alert("Error", "Failed to update paid status. Please try again.", [{ text: "OK" }]); 
        }
    }

    const confirmUpdate = (orderId) => {
        Alert.alert(
        "Confirm",
        "Are you sure you want to update this order as PAID?",
        [
            { text: "Cancel", style: "cancel" },
            { text: "Confirm", onPress: () => updatePaidStatus(orderId), style: "destructive" }       
        ]
    );
    };

    const renderUserItem = ({ item }) => (
        <TouchableOpacity style={styles.userItem} onPress={() => handleUserSelect(item)}>
            <View style={styles.userInfo}>
                <Text style={styles.userText}>{item.username}</Text>
                <Text style={styles.userSubText}>{`${item.first_name} ${item.last_name}`}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderOrderItem = ({item}) => {
        const canUpdate = !item.is_paid;
        return (
            <View style={styles.classItem}>
                <View>
                    <Text style={styles.classSubText}>Order ID: {item.id} -- {item.sportclass?.name}</Text>
                    <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
                        <View style={[
                            styles.statusBadge,
                            item.is_paid ? styles.paidBadge : styles.unpaidBadge
                        ]}>
                            <Text style={[
                                styles.statusText,
                                item.is_paid ? styles.paidText : styles.unpaidText
                            ]}>
                                {item.is_paid ? "PAID" : "UNPAID"}
                            </Text>
                        </View>
                        {!item.is_paid && (
                            <Text style={{paddingLeft: 10, color: '#007AFF', fontWeight: '500', fontSize: 16}}>${item.price}</Text>
                        )}
                    </View>
                </View>
                {canUpdate && (
                    <>
                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={() => confirmUpdate(item.id)}
                        >
                            <Text style={styles.updateButtonText}>Mark as Paid</Text>
                        </TouchableOpacity> 
                    </>
                )}    
            </View> 
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <View style={styles.searchContainer}>
                    <IconButton icon="magnify" size={24} iconColor="gray" style={styles.icon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Find user by username..."
                        placeholderTextColor="#ccc"
                        value={q}
                        onChangeText={(u) => search(u, setQ)}
                    />
                </View>

                <FlatList
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item.id.toString()}
                    onEndReached={loadMoreUsers}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={loading && <ActivityIndicator size="large" color="#446b50" />}
                    style={styles.userList}
                />

                {selectedUser && (
                <View style={styles.selectedUserContainer}>
                    <Text style={styles.selectedUserText}>
                    Selected user: {selectedUser.username} ({selectedUser.first_name} {selectedUser.last_name})
                    </Text>
                    <FlatList
                        data={orders}
                        renderItem={renderOrderItem}
                        keyExtractor={(item) => item.id.toString()}
                        ListEmptyComponent={<Text style={styles.emptyText}>No classed has joined.</Text>}
                        style={styles.classList}
                    />
                    {loading && <ActivityIndicator size='small' color='#446b50' />}
                </View>
                )}

            </View>

            <BottomTabBar navigation={navigation} />
        </View>
    );
    };

    export default CheckOrderScreen;

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingBottom: 35
    }, formContainer: {
        flex: 1,
        padding: 20,
    }, header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#446b50',
        marginBottom: 20,
        textAlign: 'center',
    }, sportClassText: {
        fontSize: 16,
        color: '#000',
    }, searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: '#fff',
    }, searchInput: {
        flex: 1,
        padding: 10,
        fontSize: 16,
        color: '#000'
    }, icon: {
        marginHorizontal: 5,
    }, userList: {
        marginBottom: 15,
    }, userItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    }, userText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    }, userSubText: {
        fontSize: 14,
        color: 'gray',
    }, selectedUserContainer: {
        marginBottom: 15,
    }, selectedUserText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
    }, classList: {
        maxHeight: 250,
    }, classItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems:'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    }, classSubText: {
        fontSize: 14,
        color: 'gray',
    }, emptyText: {
        fontSize: 14,
        color: 'gray',
        textAlign: 'center',
        padding: 10,
    }, paidText: {
        color: '#446b50',
    }, unpaidText: {
        color: '#f17b77',
    }, statusText: {
        fontSize: 14,
        fontWeight: '600',
    }, statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        width: 70,
        alignItems: 'center'
    }, paidBadge: {
        backgroundColor: '#e8f5e8',
    }, unpaidBadge: {
        backgroundColor: '#ffeaea',
    }, updateButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        padding: 3
    }, updateButton: {
        backgroundColor: '#446b50',
        padding: 5,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
    },
});