const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

module.exports = (() => {
    const config = getDefaultConfig(__dirname);

    // Extract existing transformer and resolver
    const { transformer, resolver } = config;

    // Add SVG transformer configuration
    config.transformer = {
        ...transformer,
        babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
    };

    config.resolver = {
        ...resolver,
        assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
        sourceExts: [...resolver.sourceExts, "svg"],
    };

    // Wrap the updated config with NativeWind and add options
    return withNativeWind(config, {
        input: "./global.css",
        inlineRem: 16,
    });
})();
