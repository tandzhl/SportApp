import { useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MyStyles from '../../styles/MyStyles';

const Admin = () => {
  const navigation = useNavigation();

  return (
      <View style={MyStyles.card_container}>
        <TouchableOpacity style={MyStyles.card} onPress={() => navigation.navigate('user-manager')}>
          <MaterialCommunityIcons name="account-cog" size={30} color="#4A90E2" />
          <Text style={MyStyles.card_label}>Quản lý tài khoản</Text>
        </TouchableOpacity>
  
        <TouchableOpacity style={MyStyles.card} onPress={() => navigation.navigate('create-user')}>
          <MaterialCommunityIcons name="account-plus" size={30} color="#E94E77" />
          <Text style={MyStyles.card_label}>Tạo tài khoản</Text>
        </TouchableOpacity>

        <TouchableOpacity style={MyStyles.card} onPress={() => navigation.navigate('admin-stats')}>
          <MaterialCommunityIcons name="chart-bar" size={30} color="#E94E77" />
          <Text style={MyStyles.card_label}>Thống kê báo cáo</Text>
        </TouchableOpacity>
      </View>

      
    );

};

export default Admin;