import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { Button, Card, Chip, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../configs/Apis';
import BottomTabBar from '../../navigators/BottomTabBar';

export default function PushNotificationScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [deviceStatus, setDeviceStatus] = useState(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        getUserRole(),
        getDeviceStatus(),
        getNotificationHistory(),
        getSchedules(),
        getDiscounts(),
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPushToken = async () => {
  try {
    // Yêu cầu quyền thông báo
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Permission to send notifications not granted');
      return null;
    }

    // Lấy token thiết bị
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Device token:', token);
    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

const registerDevice = async () => {
  try {
    const token = await getPushToken();
    if (!token) return;

    const accessToken = await AsyncStorage.getItem('access_token');
    const response = await authApis(accessToken, navigation.navigate).post(
      `${endpoints.device}/register/`,
      {
        token: token,
        device_type: 'android',
      }
    );
    Alert.alert('Success', 'Device registered successfully!');
    await getDeviceStatus(); // Cập nhật trạng thái thiết bị
  } catch (error) {
    console.error('Error registering device:', error);
    Alert.alert('Error', 'Failed to register device');
  }
};

  const getUserRole = async () => {
    try {
      const role = await AsyncStorage.getItem('user_role');
      setUserRole(role || '');
    } catch (error) {
      console.error('Error getting user role:', error);
    }
  };

  const getDeviceStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await authApis(token, navigation.navigate).get(
        `${endpoints.notifications}/device/status/`
      );
      setDeviceStatus(response.data.data);
    } catch (error) {
      console.error('Error getting device status:', error);
    }
  };

  const getNotificationHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await authApis(token, navigation.navigate).get(
        `${endpoints.notifications}/history/`
      );
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Error getting notification history:', error);
    }
  };

  const getSchedules = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await authApis(token, navigation.navigate).get(endpoints['schedules']);
      setSchedules(response.data || []);
    } catch (error) {
      console.error('Error getting schedules:', error);
    }
  };

  const getDiscounts = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await authApis(token, navigation.navigate).get(endpoints.discounts);
      setDiscounts(response.data || []);
    } catch (error) {
      console.error('Error getting discounts:', error);
    }
  };

  const sendTestNotification = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      await authApis(token, navigation.navigate).post(
        `${endpoints.notifications}/test/`,
        {}
      );
      Alert.alert('Success', 'Test notification sent successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
      console.error('Error sending test notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendScheduleReminder = async (scheduleId) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      await authApis(token, navigation.navigate).post(
        `${endpoints.notifications}/schedule-reminder/`,
        { schedule_id: scheduleId }
      );
      Alert.alert('Success', 'Schedule reminder sent successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send schedule reminder');
      console.error('Error sending schedule reminder:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendPromotionNotification = async (discountId) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      await authApis(token, navigation.navigate).post(
        `${endpoints.notifications}/promotion/`,
        { discount_id: discountId }
      );
      Alert.alert('Success', 'Promotion notification sent successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send promotion notification');
      console.error('Error sending promotion notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendBulkPromotion = async (discountIds) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      await authApis(token, navigation.navigate).post(
        `${endpoints.notifications}/bulk-promotion/`,
        { discount_ids: discountIds }
      );
      Alert.alert('Success', 'Bulk promotion notifications sent successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send bulk promotion notifications');
      console.error('Error sending bulk promotion:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmScheduleReminder = (schedule) => {
    Alert.alert(
      'Send Schedule Reminder',
      `Send reminder for "${schedule.sportclass?.name}" on ${formatDateTime(schedule.datetime)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => sendScheduleReminder(schedule.id) },
      ]
    );
  };

  const confirmPromotionNotification = (discount) => {
    Alert.alert(
      'Send Promotion',
      `Send promotion notification for "${discount.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => sendPromotionNotification(discount.id) },
      ]
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeData();
    setRefreshing(false);
  };

  const renderNotificationItem = ({ item }) => (
    <Card style={styles.notificationCard}>
      <Card.Content>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationBody}>{item.body}</Text>
        <Text style={styles.notificationDate}>
          {formatDateTime(item.created_at)}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderScheduleItem = ({ item }) => (
    <Card style={styles.scheduleCard}>
      <Card.Content>
        <Text style={styles.scheduleTitle}>{item.sportclass?.name}</Text>
        <Text style={styles.sectionDescription}>Date: {formatDateTime(item.datetime)}</Text>
        <Text style={styles.sectionDescription}>Place: {item.place}</Text>
        <Button
          mode="contained"
          onPress={() => confirmScheduleReminder(item)}
          style={styles.reminderButton}
          disabled={loading}
        >
          Send Reminder
        </Button>
      </Card.Content>
    </Card>
  );

  const renderDiscountItem = ({ item }) => (
    <Card style={styles.discountCard}>
      <Card.Content>
        <Text style={styles.discountTitle}>{item.name}</Text>
        <Text style={styles.sectionDescription}>Discount: {item.percentage}%</Text>
        <Text style={styles.sectionDescription}>Valid until: {formatDateTime(item.end_date)}</Text>
        <Button
          mode="contained"
          onPress={() => confirmPromotionNotification(item)}
          style={styles.promotionButton}
          disabled={loading}
        >
          Send Promotion
        </Button>
      </Card.Content>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#446b50" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Push Notifications</Text>
        {deviceStatus && deviceStatus.length > 0 && (
          <Chip icon="check-circle" style={styles.deviceChip}>
            Device Registered
          </Chip>
        )}
      </View>

      {/* Test Notification */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Test Notification</Text>
          <Text style={styles.sectionDescription}>Send a test notification to yourself</Text>
          <Button
            mode="contained"
            onPress={sendTestNotification}
            style={styles.testButton}
            disabled={loading}
          >
            Send Test
          </Button>
        </Card.Content>
      </Card>

      {/* Schedule Reminders - For employees/admins */}
      {(userRole === 'employee' || userRole === 'admin') && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Schedule Reminders</Text>
            <Text style={styles.sectionDescription}>Send reminders for upcoming classes</Text>
            <FlatList
              data={schedules.slice(0, 5)}
              renderItem={renderScheduleItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </Card.Content>
        </Card>
      )}

      {/* Promotion Notifications - Admin only */}
      {(userRole === 'admin') && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Promotion Notifications</Text>
            <Text style={styles.sectionDescription}>Send promotion notifications to all members</Text>
            <FlatList
              data={discounts.slice(0, 3)}
              renderItem={renderDiscountItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
            {discounts.length > 1 && (
              <Button
                mode="outlined"
                onPress={() => sendBulkPromotion(discounts.map(d => d.id))}
                style={styles.bulkButton}
                disabled={loading}
              >
                Send All Promotions
              </Button>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Notification History */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No notifications yet</Text>
            }
          />
        </Card.Content>
      </Card>
    </ScrollView>
    {(!deviceStatus || deviceStatus.length === 0) && (
    <Button
      mode="contained"
      onPress={registerDevice}
      style={styles.testButton}
      disabled={loading}
    >
      Register Device
    </Button>
    )}
    <BottomTabBar navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#446b50',
  },
  deviceChip: {
    backgroundColor: '#e8f5e8',
  },
  sectionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  testButton: {
    marginTop: 10,
    backgroundColor: '#446b50',
    marginBottom: 60
  },
  notificationCard: {
    marginVertical: 4,
    backgroundColor: '#fff',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  scheduleCard: {
    marginVertical: 4,
    backgroundColor: '#f9f9f9',
  },
  scheduleTitle: {
    fontSize: 16,
    color: '#446b50',
  },
  reminderButton: {
    marginTop: 10,
    backgroundColor: '#5a7c65',
  },
  discountCard: {
    marginVertical: 4,
    backgroundColor: '#fff5e6',
  },
  discountTitle: {
    fontSize: 16,
    color: '#e67e22',
  },
  promotionButton: {
    marginTop: 10,
    backgroundColor: '#e67e22',
  },
  bulkButton: {
    marginTop: 15,
    borderColor: '#e67e22',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 10,
  },
});