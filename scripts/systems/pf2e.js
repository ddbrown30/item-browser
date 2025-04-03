import { PATH } from "../module-config.js";
import { BaseSystem } from "./base-system.js";

export class PF2e extends BaseSystem {

    static ITEM_LIST_TEMPLATE = `${PATH}/templates/partials/item-list-pf2e.hbs`;
    static INDEX_FIELDS = ["system"];
    static ITEM_TYPES = [];//["armor", "consumable", "edge", "gear", "hindrance", "power", "shield", "skill", "weapon"];

    buildRowData(items) {
        let rowData = [];

        for (const item of items) {
            let level =  item.system.details.level.value ?? 0;
            let data = {
                ...this.buildCommonRowData(item),
                level: { display: level, sortValue: level },
                traits: this.getTraitColumnData(item.system.traits?.value),
                size: this.getSizeColumnData(item.system.traits?.size.value),
            };

            rowData.push(data);
        }

        return rowData;
    }

    getSizeColumnData(size) {
        let display = game.i18n.localize(CONFIG.PF2E.itemSizes[size]);
        if (!display) {
            display = game.i18n.localize("ITEM_BROWSER.None");
        }
        let sizeOrder = ["tiny", "sm", "med", "lg", "huge", "grg"];
        let sortValue = sizeOrder.indexOf(size);

        return { display, sortValue };
    }

    getTraitColumnData(traits) {
        let display = "";
        if (traits) {
            for (let trait of traits) {
                let traitString = game.i18n.localize(CONFIG.PF2E.creatureTraits[trait]);
                if (!traitString) continue;

                if (display) {
                    display += ", ";
                }
                display += traitString;
            }
        }

        if (!display) {
            display = game.i18n.localize("ITEM_BROWSER.None");
        }

        let sortValue = 0;
        return { display, sortValue };
    }
}