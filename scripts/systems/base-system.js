import { PATH } from "../module-config.js";


export class BaseSystem {

    getAdditionalFiltersTemplate() {
        return "";
    }

    getItemListTemplate() {        
        return `${PATH}/templates/partials/item-list-base.hbs`;
    }

    getIndexFields() {
        return [];
    }

    getItemTypes() {
        return [];
    }

    filterItems(items) {        
        return items;
    }

    buildRowData(items) {
        let rowData = [];
        for (const item of items) {
            let data = this.buildCommonRowData(item);
            rowData.push(data);
        }

        return rowData;
    }

    buildCommonRowData(item) {
        let typeLabel = game.i18n.localize(CONFIG.Item.typeLabels[item.type]);
        let data = {
            uuid: item.uuid,
            tooltip: this.getTooltip(item),
            img: { display: item.img, sortValue: undefined},
            name: { display: item.name, sortValue: item.name},
            type: { display: typeLabel, sortValue: typeLabel },
        };

        return data;
    }

    getTooltip(item) {
        let tooltip = "";
        let parsedUuid = foundry.utils.parseUuid(item.uuid);
        if (parsedUuid.collection.name == "CompendiumCollection") {
            tooltip = "Compendium: " + parsedUuid.collection.metadata.label + " (" + parsedUuid.collection.metadata.name + ")";
        } else {
            tooltip = this.getFolderPath(item);
        }

        return tooltip;
    }

    getFolderPath(item) {
        let folder = item.folder;
        let path = "";
        if (folder) {
            do {
                path = folder.name + "/" + path;
            } while(folder = folder.folder);
        }

        path = "World/" + path;
        return path;
    }
    
    getAdditionalFiltersData(browserDialog, items) {
        return {};
    }

    activateListeners(browserDialog) {
    }

    addDropdownListener(type, filterProperty, browserDialog) {
        let selectorString = 'select[id="' + type + '-filter"]';
        const selector = browserDialog.element.querySelector(selectorString);
        selector.addEventListener("change", event => {
            const selection = $(event.target).find("option:selected");
            this.filters[filterProperty] = selection.val();
            browserDialog.render();
        });
    }

    onOpenBrowser() {
        this.filters = {}; 
    }
} 