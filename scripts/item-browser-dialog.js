import { DEFAULT_CONFIG } from "./module-config.js";
import { Utils } from "./utils.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class ItemBrowserDialog extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "item-browser-dialog",
        tag: "div",
        classes: ["item-browser-dialog"],
        window: { title: "ITEM_BROWSER.ItemBrowser" },
        position: { width: 1000, height: 600 },
        actions: {
            select: function (event, button) { this.select(); },
            close: function (event, button) { this.close(); }
        },
    };

    static PARTS = {
        body: {
            template: DEFAULT_CONFIG.templates.itemBrowserDialogBody,
        },
        footer: {
            template: DEFAULT_CONFIG.templates.itemBrowserDialogFooter,
        }
    };

    static ALL_ID = "all";
    static WORLD_ITEMS_ID = "worldItems";

    constructor(options = {}) {
        if (options.validFilterSources && !Array.isArray(options.validFilterSources) ) {
            Utils.showNotification("error", "validFilterSources was not an array");
            delete options.validFilterSources;
        }
        
        super(options);

        this.dragDrop = new DragDrop({
            dragSelector: '.item-option',
            callbacks: {
                dragstart: this.onDragStart.bind(this),
            }
        });

        this.systemHandler = game.itemBrowser.systemHandler;
        this.systemHandler.onOpenBrowser(this);
    }

    onDragStart(event) {
        if ('link' in event.target.dataset) return;

        let dragData = {
            type: "Item",
            uuid: event.target.dataset.itemId,
        };

        event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    }

    async _prepareContext(_options) {
        let items = [];
        let sources = [];

        if (this.options.worldItemsOnly) {
            this.sourceFilter = ItemBrowserDialog.WORLD_ITEMS_ID;
            sources.push({ id: ItemBrowserDialog.WORLD_ITEMS_ID, label: game.i18n.localize("ITEM_BROWSER.FilterWorldItems") });
        } else {
            //Add an "all" default and the world items to the sources list
            sources.push({ id: ItemBrowserDialog.ALL_ID, label: game.i18n.localize("ITEM_BROWSER.FilterAllItems") });
            sources.push({ id: ItemBrowserDialog.WORLD_ITEMS_ID, label: game.i18n.localize("ITEM_BROWSER.FilterWorldItems") });
        }

        //Grab the items that are local to this world
        items = items.concat(...this.getWorldItems());

        if (!this.options.worldItemsOnly) {
            //Grab all items from compendiums
            let packItems = await this.getPackItems();
            sources = sources.concat(...packItems.sources);
            items = items.concat(...packItems.items);
        }

        if (this.options.validFilterSources) {
            //We have been provided a list of valid sources. Filter out what doesn't match
            let filteredSources = sources.filter((s) => this.options.validFilterSources.find((f) => f == s.id));
            if (filteredSources.length) {
                //We will only use the filtered sources if there is at least one valid source
                sources = filteredSources;
            }
        } 

        if (!this.sourceFilter) {
            if (this.options.initialSourceFilter) {
                this.sourceFilter = sources.find((s) => s.id == this.options.initialSourceFilter) ? this.options.initialSourceFilter : sources[0].id;
            } else {
                this.sourceFilter = sources[0].id;
            }
        }

        this.search = this.search ?? "";
        this.sortColumn = this.sortColumn ?? "name";
        this.sortOrder = this.sortOrder ?? 1;

        let usedFields;
        let filteredItems = this.filterItems(items);
        [this.rowData, usedFields] = this.systemHandler.buildRowData(filteredItems);
        this.rowData = this.sortRows(this.rowData, this.sortColumn, this.sortOrder);

        //Filter the final rows in a transient variable so that we can refilter without requiring a render call
        let filteredRows = this.filterRows(this.rowData);

        let selectButtonString = this.getSelectButtonString();
        
        let additionalFiltersData = this.systemHandler.getAdditionalFiltersData(this, items);

        return {
            sources: sources,
            sourceFilter: this.sourceFilter,
            search: this.search,
            items: filteredRows,
            selectedItem: this.selectedItem,
            selectButtonString: selectButtonString,
            additionalFiltersData: additionalFiltersData,
            usedFields: usedFields,
        };
    };

    /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   */
    _onRender(context, options) {
        this.activateListeners();
    }

    async renderItemList(event) {
        let filteredRows = this.filterRows(this.rowData);
        let data = {
            items: filteredRows,
            selectedItem: this.selectedItem,
        };

        //Re-render just the item list with the newly filtered list and replace the html
        const content = await renderTemplate(this.systemHandler.getItemListTemplate(), data);
        let optionsBox = event.target.closest(".search-panel");
        let itemList = optionsBox.querySelector(".item-list");
        itemList.innerHTML = content;

        //We need to activate listeners again since we just stomped over the existing html
        this.activateTableListeners(this.element);
    }

    activateListeners() {
        //Add a keyup listener on the search input so that we can filter as we type
        const searchSelector = this.element.querySelector('input.search');
        searchSelector.addEventListener("keyup", async event => {
            this.search = event.target.value;
            await this.renderItemList(event);
        });

        //Add the listener to the source dropdown
        const filterSelector = this.element.querySelector('select[id="source-filter"]');
        filterSelector.addEventListener("change", event => {
            const selection = $(event.target).find("option:selected");
            this.sourceFilter = selection.val();
            this.render();
        });

        this.activateTableListeners(this.element);
        this.systemHandler.activateListeners(this);
    }

    activateTableListeners(element) {
        //Grab all the table header cells and add clicks to them so we can sort by column
        const columns = element.querySelectorAll("th");
        for (let column of columns) {
            let columnName = column.dataset.sortId;
            if (columnName) {
                column.addEventListener("click", async event => {
                    if (this.sortColumn == columnName) {
                        //We're clicking the same column so reverse the sort order
                        this.sortOrder *= -1;
                    }
                    else {
                        //This is a different column that we had sorted before so set our sort to 1
                        this.sortOrder = 1;
                    }
                    this.sortColumn = columnName;
                    this.render();
                });
            }
        }

        //Add click listeners to the table rows so we can select them
        const rows = element.querySelectorAll("tr");
        for (let row of rows) {
            if (row.rowIndex == 0) continue; //Skip the header row

            row.addEventListener("click", async event => {
                this.selectedItem = row.dataset.itemId;
                
                //Loop over the rows and add/remove the selected class as needed
                for (let r of rows) {
                    if (!r.dataset?.itemId) continue;
                    if (r.dataset.itemId == this.selectedItem) {
                        if (!r.classList.contains("selected")) {
                            r.classList.add("selected");
                        }
                    } else {
                        r.classList.remove("selected");
                    }
                }

                //Update the select button
                const selectButton = element.querySelector('[data-action="select"]');
                let selectButtonString = this.getSelectButtonString();
                selectButton.textContent = selectButtonString;
                selectButton.disabled = false;
            });

            row.addEventListener("dblclick", async event => {
                this.select();
            });
        }
        
        this.dragDrop.bind(this.element);
    }

    async getPackItems() {
        let items = [];
        let sources = [];
        for (const pack of game.packs) {
            if (pack.documentName != "Item") continue;
            if (!pack.testUserPermission(game.user, "OBSERVER")) continue;

            let packIndex = await pack.getIndex({ fields: this.systemHandler.getIndexFields() });
            if (packIndex.size == 0) continue;

            packIndex = this.filterItemsByType(packIndex);
            if (packIndex.length == 0) continue;

            items = items.concat(...packIndex);
            let label = pack.title;
            if (pack.metadata.packageType == "world") {
                label += " (" + game.i18n.localize("ITEM_BROWSER.WorldCompendium") + ")";
            } else {
                label += " (" + pack.metadata.packageName + ")";
            }
            sources.push({ id: pack.metadata.id, label: label });
        }

        return { items, sources };
    }

    getWorldItems() {
        let items = [];
        for (const item of game.items) {
            if (!item.testUserPermission(game.user, "OBSERVER")) continue;
            items.push(item);
        }

        items = this.filterItemsByType(items);
        return items;
    }

    filterItemsByType(items) {
        let filtered = items;
        
        //Remove invalid item types
        const itemTypes = this.systemHandler.getItemTypes();
        if (itemTypes.length) {
            filtered = filtered.filter((a) => itemTypes.includes(a.type));
        }

        //If the dialog has limited the available types, remove them here
        if (this.options.itemTypes?.length) {
            filtered = filtered.filter((a) => this.options.itemTypes.includes(a.type));
        }
        
        return filtered;
    }

    filterItems(items) {
        let filtered = items;

        //Filter by source
        if (this.sourceFilter != ItemBrowserDialog.ALL_ID) {
            if (this.sourceFilter == ItemBrowserDialog.WORLD_ITEMS_ID) {
                //Items from a compendium index will not have a documentName so we can assume that items that do must be world items
                filtered = filtered.filter((a) => a.documentName == "Item");
            } else {
                filtered = filtered.filter((a) => a.uuid.includes(this.sourceFilter));
            }
        }

        //System specific filter
        filtered = this.systemHandler.filterItems(filtered);

        return filtered;
    }

    filterRows(rowData) {
        let filtered = rowData;

        //Filter by the search string
        if (this.search) {
            filtered = filtered.filter((r) => r.name.display.toLowerCase().includes(this.search.toLowerCase()));
        }

        //If our selected item does not exist in our filtered list, deselect it
        if (!filtered.find((r) => r.uuid == this.selectedItem)) {
            this.selectedItem = "";
        }

        return filtered;
    }

    sortRows(rows, sortColumn, sortOrder) {
        let retVal = rows.sort(function (a, b) {
            const sortA = a[sortColumn];
            const sortB = b[sortColumn];
            if (typeof sortA.sortValue == "string") {
                return sortA.sortValue.localeCompare(sortB.sortValue) * sortOrder;
            } else {
                return (sortA.sortValue - sortB.sortValue) * sortOrder;
            }
        });

        return retVal;
    }

    getSelectButtonString() {
        let selectButtonString = game.i18n.localize(this.options.selector ? "ITEM_BROWSER.Select" : "ITEM_BROWSER.Open");
        if (this.selectedItem) {
            let item = this.rowData.find((a) => a.uuid == this.selectedItem);
            selectButtonString += " " + item.name.display;
        }
        return selectButtonString;
    }

    /**
     * Renders the dialog and awaits until the dialog is submitted or closed
     */
    async wait() {
        return new Promise((resolve, reject) => {
            // Wrap submission handler with Promise resolution.
            this.select = async result => {
                resolve(this.selectedItem);
                this.close();
            };

            this.addEventListener("close", event => {
                resolve(false);
            }, { once: true });

            this.render({ force: true });
        });
    }

    async select() {
        if (this.options.selector) {
            Utils.showNotification("error", game.i18n.localize("ITEM_BROWSER.WaitError"));
            this.close();
            return;
        }

        //If we're not a selector, we want to open the item sheet
        let item = await fromUuid(this.selectedItem);
        item.sheet.render(true);
    }
}