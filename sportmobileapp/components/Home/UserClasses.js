import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MyStyles from '../../styles/MyStyles';

const UserClasses = ({ onCoursesPress, onInvoicesPress }) => {
  return (
    <View style={MyStyles.card_container}>
      <TouchableOpacity style={MyStyles.card} onPress={onCoursesPress}>
        <MaterialCommunityIcons name="book-check" size={30} color="#4A90E2" />
        <Text style={MyStyles.card_label}>Khóa học đã đăng ký</Text>
      </TouchableOpacity>

      <TouchableOpacity style={MyStyles.card} onPress={onInvoicesPress}>
        <MaterialCommunityIcons name="file-alert-outline" size={30} color="#E94E77" />
        <Text style={MyStyles.card_label}>Hóa đơn chưa thanh toán</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserClasses;