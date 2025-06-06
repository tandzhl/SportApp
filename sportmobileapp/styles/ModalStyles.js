import { StyleSheet } from "react-native";

export default StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    elevation: 10, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: "#28a745",
    marginRight: 5,
    padding: 20,
    borderRadius: 15
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    marginLeft: 5,
    padding: 20,
    borderRadius: 15
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  }, modalTitle: {
    fontSize: 20,
    color: "blue",
    marginTop: 10,
    marginBottom: 10,
  }
});