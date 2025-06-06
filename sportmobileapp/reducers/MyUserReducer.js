 const MyUserReducer = (current, action) => {
  switch (action.type) {
    case "login":
      return action.payload;
    case "update":
      if (!current || !action.payload) return current;
      return { ...current, ...action.payload };
    case "logout":
      return null;
    default:
      console.warn("Unknown action type in MyUserReducer:", action.type);
      return current;
  }
};

export default MyUserReducer;