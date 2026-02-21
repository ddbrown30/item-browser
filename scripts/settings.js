import { DuplicatesSettings } from "./duplicates-settings.js";
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
        onChange: s => {
            ui.items.render(true);
        }
    });

    Utils.registerSetting(MODULE_CONFIG.SETTING_KEYS.useSmallButton, {
        name: "ITEM_BROWSER.Settings.UseSmallButtonN",
        hint: "ITEM_BROWSER.Settings.UseSmallButtonH",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: s => {
            ui.items.render(true);
        }
    });

    Utils.registerMenu(MODULE_CONFIG.SETTING_KEYS.duplicatesMenu, {
        name: "ITEM_BROWSER.Settings.DuplicatesSettings.Title",
        label: "ITEM_BROWSER.Settings.DuplicatesSettings.Title",
        hint: "ITEM_BROWSER.Settings.DuplicatesSettings.Hint",
        scope: "world",
        restricted: true,
        type: DuplicatesSettings,
    });

    Utils.registerSetting(MODULE_CONFIG.SETTING_KEYS.duplicatesSettings, {
        scope: "world",
        config: false,
        type: Object,
        default: { enabled: false, types: [], priorities: [] }
    });
}