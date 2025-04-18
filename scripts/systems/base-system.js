import { CONST } from "../module-config.js";


export class BaseSystem {

    static ADDITIONAL_FILTERS_TEMPLATE = "";
    static ADDITIONAL_SEARCHES_TEMPLATE = "";
    static INDEX_FIELDS = [];
    static ITEM_TYPES = [];
    static HEADER_CONFIG = {};

    getColumnsForType(type) {
        return [];
    }

    filterItems(items) {
        return items;
    }

    getDefaultRowData(type) {
        let columns = this.getColumnsForType(type);
        let rowData = {};
        for (let column of columns) {
            rowData[column] = CONST.unusedValue;
        }
        return rowData;
    }

    async buildRowData(items, type, headerData) {
        let rowData = [];
        for (const item of items) {
            let data = this.buildCommonRowData(item);
            rowData.push(data);
        }

        this.buildRowHtml(type, rowData, headerData);

        return rowData;
    }

    buildCommonRowData(item) {
        let data = {
            uuid: item.uuid,
            tooltip: this.getTooltip(item),
            img: { display: item.img, sortValue: undefined },
            name: { display: item.name, sortValue: item.name },
        };

        return data;
    }

    buildRowHtml(type, rowData, headerData) {
        let columns = this.getColumnsForType(type);
        for (let row of rowData) {
            row.rowHtml = this.getRowHtml(row, columns, headerData);
        }
    }

    getRowHtml(rowData, columns, headerData) {
        let rowHtml = "";
        for (let [prop, val] of Object.entries(headerData)) {
            if (!columns.includes(prop)) continue;
            rowHtml += `
            <td class="${val.class}">
                <p class="item-row-text">${rowData[prop].display}</p>
            </td>
            `;
        }
        return rowHtml;
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
            } while (folder = folder.folder);
        }

        path = "World/" + path;
        return path;
    }

    async getAdditionalFiltersData(browserDialog, items) {
        return {};
    }

    async getAdditionalSearchesData(browserDialog, items) {
        return {};
    }

    activateListeners(browserDialog) {
    }

    addDropdownListener(type, filterProperty, browserDialog) {
        let selectorString = 'select[id="' + type + '-filter"]';
        const selector = browserDialog.element.querySelector(selectorString);
        if (selector) {
            selector.addEventListener("change", async event => {
                const selection = $(event.target).find("option:selected");
                this.filters[filterProperty] = selection.val();
                let data = await browserDialog._prepareContext();
                browserDialog.renderItemList(data);
            });
        }
    }

    clearFilters() {
        this.filters = {};
    }
}