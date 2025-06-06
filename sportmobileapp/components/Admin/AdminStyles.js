import { StyleSheet } from "react-native";

const AdminStyles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#fff',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  headerRow: {
    borderBottomWidth: 2,
  },
  cell: {
    flex: 2,
    fontSize: 16,
  },
  iconCell: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
  }, nameCell: {
    flex: 4, 
    paddingHorizontal: 5,
    fontSize: 14,
    width: 100
  },
});

export default AdminStyles;