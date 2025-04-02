import * as MODULE_CONFIG from "./module-config.js";
import { Utils } from "./utils.js";

export function registerSettings() {

    Utils.registerSetting(MODULE_CONFIG.SETTING_KEYS.showOnItemDirectory, {
        name: "ITEM_BROWSER.Settings.ShowOnItemDirectoryN",
        hint: "ITEM_BROWSER.Settings.ShowOnItemDirectoryH",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        requiresReload: true,
    });

    Utils.registerSetting(MODULE_CONFIG.SETTING_KEYS.useSmallButton, {
        name: "ITEM_BROWSER.Settings.UseSmallButtonN",
        hint: "ITEM_BROWSER.Settings.UseSmallButtonH",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        requiresReload: true,
    });
}