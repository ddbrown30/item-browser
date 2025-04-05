import { Utils } from "./utils.js";
import { SETTING_KEYS, DEFAULT_CONFIG } from "./module-config.js";
import { ItemBrowserDialog } from "./item-browser-dialog.js";
import { Swade } from "./systems/swade.js";
import { BaseSystem } from "./systems/base-system.js";
import { DnD5e } from "./systems/dnd5e.js";

export class ItemBrowser {

    static async createSystemHandler() {
        if (game.system.id == "swade") {
            game.itemBrowser.systemHandler = new Swade();
        } else if (game.system.id == "dnd5e") {
            game.itemBrowser.systemHandler = new DnD5e();
        } else {
            game.itemBrowser.systemHandler = new BaseSystem();
        }
    }

    static async onRenderItemDirectory(app, html, data) {
        if (!Utils.getSetting(SETTING_KEYS.showOnItemDirectory)) return;

        let useSmallButton = Utils.getSetting(SETTING_KEYS.useSmallButton);
        const browserButton = await renderTemplate(DEFAULT_CONFIG.templates.itemBrowserButton, {useSmallButton: useSmallButton});

        if (useSmallButton) {
            let header = html[0].querySelector(".header-search");
            header.insertAdjacentHTML("beforeend", browserButton);
        } else {
            let header = html[0].querySelector(".directory-header");
            header.insertAdjacentHTML("beforeend", browserButton);
        }

        //Respond to the open button
        const button = html.find(".open-item-browser-button");
        button.click(ev => {
            new ItemBrowserDialog().render(true);
        });
    }

    static async openBrowser(options={}) {
        options.selector = options.selector ?? true;
        if (options.selector) {
            return await new ItemBrowserDialog(options).wait();
        } else {
            new ItemBrowserDialog(options).render(true);
        }
    }
}