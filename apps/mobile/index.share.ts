import { AppRegistry } from "react-native";

// could be any component you want to use as the root component of your share extension's bundle
import ShareExtension from "./ShareExtension";

// IMPORTANT: the first argument to registerComponent, must be "shareExtension"
AppRegistry.registerComponent("shareExtension", () => ShareExtension);