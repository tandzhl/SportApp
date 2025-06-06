import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { authApis, endpoints } from '../../configs/Apis';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const AdminStatsScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]); // Keeping date static for simplicity

  const periodOptions = [
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
  ];

  const navigation = useNavigation();

  const loadStats = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        period: selectedPeriod,
        date: selectedDate,
      });

      const token = await AsyncStorage.getItem("access_token");
      const response = await authApis(token, navigation.navigate).get(`${endpoints['stats']}?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.data;
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);

      setStats({
        period: selectedPeriod,
        start_date: '2024-01-01',
        end_date: '2024-01-07',
        member_count: 150,
        revenue: 25000000,
        schedule_stats: [
          { class_name: 'Yoga', scheduled: 12, canceled: 2 },
          { class_name: 'Gym', scheduled: 20, canceled: 1 },
          { class_name: 'Swimming', scheduled: 8, canceled: 3 },
          { class_name: 'Boxing', scheduled: 15, canceled: 0 },
        ],
        performance: [
          { class_name: 'Yoga', member_count: 45 },
          { class_name: 'Gym', member_count: 78 },
          { class_name: 'Swimming', member_count: 32 },
          { class_name: 'Boxing', member_count: 28 },
        ],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  // Custom currency formatting
  const formatCurrency = (amount) => {
    const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formatted} VND`;
  };

  // Custom date formatting
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>STATISTICS</Text>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periodOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.periodButton,
                selectedPeriod === option.value && styles.selectedPeriodButton,
              ]}
              onPress={() => setSelectedPeriod(option.value)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === option.value && styles.selectedPeriodButtonText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ScrollView Content */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {stats && (
          <>
            {/* Overview Cards */}
            <View style={styles.cardsContainer}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>New members</Text>
                <Text style={styles.cardValue}>{stats.member_count}</Text>
                <Text style={styles.cardSubtitle}>
                  {formatDate(stats.start_date)} - {formatDate(stats.end_date)}
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Summary</Text>
                <Text style={styles.cardValue}>{formatCurrency(stats.revenue)}</Text>
                <Text style={styles.cardSubtitle}>
                  {formatDate(stats.start_date)} - {formatDate(stats.end_date)}
                </Text>
              </View>
            </View>

            {/* Schedule Stats Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Schedule Stats</Text>
              <View style={styles.chartPlaceholder}>
                {/* Simple Bar Chart */}
                <View style={styles.barChart}>
                  {stats.schedule_stats.map((item, index) => (
                    <View key={index} style={styles.barGroup}>
                      <Text style={styles.barLabel}>{item.class_name}</Text>
                      <View style={styles.barsContainer}>
                        <View
                          style={[
                            styles.bar,
                            styles.scheduledBar,
                            { height: (item.scheduled / 25) * 100 },
                          ]}
                        >
                          <Text style={styles.barText}>{item.scheduled}</Text>
                        </View>
                        <View
                          style={[
                            styles.bar,
                            styles.canceledBar,
                            { height: (item.canceled / 25) * 100 },
                          ]}
                        >
                          <Text style={styles.barText}>{item.canceled}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendColor, { backgroundColor: '#22c55e' }]}
                    />
                    <Text style={styles.legendText}>Scheduled</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendColor, { backgroundColor: '#ef4444' }]}
                    />
                    <Text style={styles.legendText}>Canceled</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Performance Stats */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Performance Stats</Text>
              <View style={styles.performanceList}>
                {stats.performance.map((item, index) => {
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
                  const totalMembers = stats.performance.reduce(
                    (sum, p) => sum + p.member_count,
                    0
                  );
                  const percentage = (item.member_count / totalMembers) * 100;

                  return (
                    <View key={index} style={styles.performanceItem}>
                      <View style={styles.performanceHeader}>
                        <View style={styles.performanceLabel}>
                          <View
                            style={[
                              styles.performanceColor,
                              { backgroundColor: colors[index % colors.length] },
                            ]}
                          />
                          <Text style={styles.performanceText}>
                            {item.class_name}
                          </Text>
                        </View>
                        <Text style={styles.performanceValue}>
                          {item.member_count} members
                        </Text>
                      </View>
                      <View style={styles.performanceBar}>
                        <View
                          style={[
                            styles.performanceProgress,
                            {
                              backgroundColor: colors[index % colors.length],
                              width: `${percentage}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.performancePercentage}>
                        {percentage.toFixed(1)}%
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Details Section */}
            <View style={styles.detailsContainer}>
              <Text style={styles.sectionTitle}>Detailed statistics</Text>

              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Class</Text>
                {stats.schedule_stats.map((item, index) => (
                  <View key={index} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{item.class_name}</Text>
                    <View style={styles.detailValues}>
                      <Text style={styles.detailValue}>
                        Scheduled: {item.scheduled}
                      </Text>
                      <Text style={styles.detailValue}>Canceled: {item.canceled}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>
                  Member count
                </Text>
                {stats.performance.map((item, index) => (
                  <View key={index} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{item.class_name}</Text>
                    <Text style={styles.detailValue}>
                      {item.member_count} members
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#010101',
    marginBottom: 20,
    textAlign: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedPeriodButton: {
    backgroundColor: '#3b82f6',
  },
  periodButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  selectedPeriodButtonText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  cardsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 7.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  chartPlaceholder: {
    minHeight: 200,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
    marginBottom: 20,
  },
  barGroup: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  barsContainer: {
    flexDirection: 'row',
    marginHorizontal: 4,
  },
  bar: {
    width: 20,
    minHeight: 10,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  scheduledBar: {
    backgroundColor: '#22c55e',
  },
  canceledBar: {
    backgroundColor: '#ef4444',
  },
  barText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    position: 'absolute',
    top: -15,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  performanceList: {
    flexDirection: 'column',
  },
  performanceItem: {
    marginBottom: 15,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  performanceLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performanceColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  performanceText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  performanceValue: {
    fontSize: 14,
    color: '#666',
  },
  performanceBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  performanceProgress: {
    height: '100%',
    borderRadius: 4,
  },
  performancePercentage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 25,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  detailValues: {
    alignItems: 'flex-end',
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
});

export default AdminStatsScreen;
// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, TextInput, Button, ScrollView, Alert, Modal, TouchableOpacity, FlatList } from 'react-native';
// import axios from 'axios';
// import { authApis, endpoints } from '../../configs/Apis';
// import { useNavigation } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const AdminStatsScreen = () => {
//   const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
//   const [period, setPeriod] = useState('week'); // Default period
//   const [stats, setStats] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);

//   const periods = [
//     { label: 'Week', value: 'week' },
//     { label: 'Month', value: 'month' },
//     { label: 'Year', value: 'year' },
//   ];

//   const navigation = useNavigation();

//   const fetchStats = async () => {
//     try {
//         const token = await AsyncStorage.getItem("access_token");
//       const response = await authApis(token, navigation.navigate).get(endpoints['stats'], {
//         params: { date, period },
//         headers: { 'Authorization': `Bearer ${token}` }, 
//       });
//       setStats(response.data);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to fetch statistics. Please try again.');
//       console.error(error);
//     }
//   };

//   useEffect(() => {
//     fetchStats(); 
//   }, []);

//   const handleFetchStats = () => {
//     if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
//       Alert.alert('Invalid Date', 'Please enter a valid date in YYYY-MM-DD format.');
//       return;
//     }
//     fetchStats();
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.header}>Admin Statistics</Text>

//       <View style={styles.inputContainer}>
//         <Text style={styles.label}>Date (YYYY-MM-DD):</Text>
//         <TextInput
//           style={styles.input}
//           value={date}
//           onChangeText={setDate}
//           placeholder="YYYY-MM-DD"
//         />
//       </View>

//       <View style={styles.inputContainer}>
//         <Text style={styles.label}>Period:</Text>
//         <TouchableOpacity
//           style={styles.periodButton}
//           onPress={() => setModalVisible(true)}
//         >
//           <Text style={styles.periodText}>{periods.find(p => p.value === period)?.label || 'Select Period'}</Text>
//         </TouchableOpacity>
//       </View>

//       <Button title="Fetch Statistics" onPress={handleFetchStats} color="#007BFF" />

//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <FlatList
//               data={periods}
//               keyExtractor={(item) => item.value}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={styles.modalItem}
//                   onPress={() => {
//                     setPeriod(item.value);
//                     setModalVisible(false);
//                   }}
//                 >
//                   <Text style={styles.modalText}>{item.label}</Text>
//                 </TouchableOpacity>
//               )}
//             />
//             <Button title="Close" onPress={() => setModalVisible(false)} color="#FF4444" />
//           </View>
//         </View>
//       </Modal>

//       {stats && (
//         <View style={styles.statsContainer}>
//           <Text style={styles.sectionTitle}>Summary</Text>
//           <Text style={styles.stat}>Period: {stats.period}</Text>
//           <Text style={styles.stat}>Start Date: {stats.start_date}</Text>
//           <Text style={styles.stat}>End Date: {stats.end_date}</Text>
//           <Text style={styles.stat}>Member Count: {stats.member_count}</Text>
//           <Text style={styles.stat}>Revenue: ${stats.revenue.toFixed(2)}</Text>

//           <Text style={styles.sectionTitle}>Schedule Stats</Text>
//           {stats.schedule_stats.map((item, index) => (
//             <View key={index} style={styles.statItem}>
//               <Text style={styles.stat}>Class: {item.class_name}</Text>
//               <Text style={styles.stat}>Scheduled: {item.scheduled}</Text>
//               <Text style={styles.stat}>Canceled: {item.canceled}</Text>
//             </View>
//           ))}

//           <Text style={styles.sectionTitle}>Performance Stats</Text>
//           {stats.performance.map((item, index) => (
//             <View key={index} style={styles.statItem}>
//               <Text style={styles.stat}>Class: {item.class_name}</Text>
//               <Text style={styles.stat}>Member Count: {item.member_count}</Text>
//             </View>
//           ))}
//         </View>
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#5a7c65',
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   inputContainer: {
//     marginBottom: 15,
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 5,
    
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#CCC',
//     padding: 10,
//     borderRadius: 5,
//     fontSize: 16,
//     color: '#000'
//   },
//   periodButton: {
//     borderWidth: 1,
//     borderColor: '#CCC',
//     padding: 10,
//     borderRadius: 5,
//     backgroundColor: '#FFF',
//   },
//   periodText: {
//     fontSize: 16,
//     color: '#000'
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     backgroundColor: '#FFF',
//     padding: 20,
//     borderRadius: 10,
//     marginHorizontal: 20,
//   },
//   modalItem: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEE',
//   },
//   modalText: {
//     fontSize: 16,
//     color: '#000'
//   },
//   statsContainer: {
//     marginTop: 20,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     color:'#000',
//     fontWeight: 'bold',
//     marginTop: 15,
//     marginBottom: 10,
//   },
//   statItem: {
//     backgroundColor: '#FFF',
//     padding: 10,
//     borderRadius: 5,
//     marginBottom: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 2,
//   },
//   stat: {
//     fontSize: 16,
//     marginBottom: 5,
//     color: '#000'
//   },
// });

// export default AdminStatsScreen;