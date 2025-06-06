module.exports = function (api) {
    api.cache(true);
    return{
        preset: ['bable-preset-expo'],
        plugin: ['react-native-reanimated/plugin']
    };
};