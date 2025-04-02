import { PATH } from "../module-config.js";
import { BaseSystem } from "./base-system.js";

export class DnD5e extends BaseSystem {

    getAdditionalFiltersTemplate() {
        return `${PATH}/templates/partials/additional-filters-dnd5e.hbs`;
    }

    getItemListTemplate() {
        return `${PATH}/templates/partials/item-list-dnd5e.hbs`;
    }

    getIndexFields() {
        return [
            "system.details",
            "system.traits",
            "system.attributes",
        ];
    }

    getItemTypes() {
        return ["character", "npc"];
    }

    filterItems(items) {
        let filtered = super.filterItems(items);

        //Filter by speed
        if (this.filters.speedFilter) {
            filtered = filtered.filter((a) => a.system.attributes.movement[this.filters.speedFilter] > 0 );
        }

        //Filter by sense
        if (this.filters.senseFilter) {
            filtered = filtered.filter((a) => a.system.attributes.senses[this.filters.senseFilter] > 0 );
        }

        return filtered;
    }

    buildRowData(items) {
        let rowData = [];
        
        for (const item of items) {
            let cr =  item.system.details.cr ?? item.system.details.level ?? 0;
            let data = {
                ...this.buildCommonRowData(item),
                cr: { display: cr, sortValue: cr },
                type: this.getTypeColumnData(item.system.details.type?.value),
                size: this.getSizeColumnData(item.system.traits.size),
                speed: this.getSpeedColumnData(item.system.attributes.movement),
                senses: this.getSenseColumnData(item.system.attributes.senses),
                alignment: { display: item.system.details.alignment, sortValue: item.system.details.alignment },
            };

            rowData.push(data);
        }

        return rowData;
    }

    getSizeColumnData(size) {
        let display = game.i18n.localize(CONFIG.DND5E.itemSizes[size].label);
        let sizeOrder = ["tiny", "sm", "med", "lg", "huge", "grg"];
        let sortValue = sizeOrder.indexOf(size);

        return { display, sortValue };
    }

    getTypeColumnData(type) {
        let display = game.i18n.localize(CONFIG.DND5E.creatureTypes[type]?.label);
        if (!display) {
            display = game.i18n.localize("ITEM_BROWSER.None");
        }
        let sortValue = display;

        return { display, sortValue };
    }

    getSpeedColumnData(movement) {
        let display = "";
        for (let [type, value] of Object.entries(movement)) {
            if (!value || !CONFIG.DND5E.movementTypes.hasOwnProperty(type)) continue;

            if (display) {
                display += "\n";
            }
            display += CONFIG.DND5E.movementTypes[type] + " " + value;
        }
        
        if (!display) {
            display = game.i18n.localize("ITEM_BROWSER.None");
        }

        return { display, sortValue: undefined };
    }

    getSenseColumnData(senses) {
        let display = "";
        for (let [type, value] of Object.entries(senses)) {
            if (!value || !CONFIG.DND5E.senses.hasOwnProperty(type)) continue;

            if (display) {
                display += "\n";
            }
            display += CONFIG.DND5E.senses[type] + " " + value;
        }
        
        if (!display) {
            display = game.i18n.localize("ITEM_BROWSER.None");
        }

        return { display, sortValue: undefined };
    }

    getAdditionalFiltersData(browserDialog, items) {
        let speeds = [];
        speeds.push({ id: "", label: game.i18n.localize("ITEM_BROWSER.FilterAllSpeeds") });
        for (let [type, value] of Object.entries(CONFIG.DND5E.movementTypes)) {
            speeds.push({ id: type, label: value });
        }
        
        let senses = [];
        senses.push({ id: "", label: game.i18n.localize("ITEM_BROWSER.FilterAllSenses") });
        for (let [type, value] of Object.entries(CONFIG.DND5E.senses)) {
            senses.push({ id: type, label: value });
        }

        return {
            speeds: speeds,
            senses: senses,
            filters: this.filters,
        };
    }

    activateListeners(browserDialog) {
        super.addDropdownListener("speed", "speedFilter", browserDialog);
        super.addDropdownListener("sense", "senseFilter", browserDialog);
    }
}