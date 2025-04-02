import { Utils } from "./utils.js";
import { registerSettings } from "./settings.js";
import { ItemBrowser } from "./item-browser.js";

export class HooksManager {
    /**
     * Registers hooks
     */
    static registerHooks() {
        /* ------------------- Init/Ready ------------------- */

        Hooks.on("init", async () => {
            game.itemBrowser = game.itemBrowser ?? {};

            // Expose API
            game.itemBrowser.openBrowser = ItemBrowser.openBrowser;

            registerSettings();

            ItemBrowser.createSystemHandler();
            
            Utils.loadTemplates();
        });

        Hooks.on("renderItemDirectory", async (app, html, data) => {
            await ItemBrowser.onRenderItemDirectory(app, html, data);
        });
    }
} 