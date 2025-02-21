const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
// This can be replaced with `find-yarn-workspace-root`
const monorepoRoot = path.resolve(projectRoot, '../..');

const withShareExtension = (config) => {
    if (!config.resolver) {
        throw new Error("config.resolver is not defined");
    }

    config.resolver.sourceExts = [
        ...(config.resolver?.sourceExts ?? []),
        "share.ts",
    ];

    if (!config.server) {
        throw new Error("config.server is not defined");
    }

    const originalRewriteRequestUrl =
        config.server?.rewriteRequestUrl || ((url) => url);

    config.server.rewriteRequestUrl = (url) => {
        const isShareExtension = url.includes("shareExtension=true");
        const rewrittenUrl = originalRewriteRequestUrl(url);

        if (isShareExtension) {
            return rewrittenUrl.replace("index.bundle", "index.share.bundle");
        }

        return rewrittenUrl;
    };

    return config;
};

module.exports = (() => {
    const config = getDefaultConfig(projectRoot);

    // Extract existing transformer and resolver
    const { transformer, resolver } = config;

    // 1. Watch all files within the monorepo
    config.watchFolders = [monorepoRoot];

    // Add SVG transformer configuration
    config.transformer = {
        ...transformer,
        babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
    };

    config.resolver = {
        ...resolver,
        assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
        sourceExts: [...resolver.sourceExts, "svg"],
        nodeModulesPaths: [path.resolve(projectRoot, 'node_modules'), path.resolve(monorepoRoot, 'node_modules')],
    };

    // Wrap the updated config with NativeWind and add options
    return withShareExtension(withNativeWind(config, {
        input: "./global.css",
        inlineRem: 16,
    }));
})();