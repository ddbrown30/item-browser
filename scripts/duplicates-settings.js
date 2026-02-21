import * as MODULE_CONFIG from "./module-config.js";
import { Utils } from "./utils.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
export class DuplicatesSettings extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: MODULE_CONFIG.DEFAULT_CONFIG.duplicatesSettingsMenu.id,
        tag: "form",
        form: {
            handler: DuplicatesSettings.formHandler,
            submitOnChange: false,
            closeOnSubmit: true
        },
        classes: ["standard-form", "item-browser-duplicates-settings"],
        window: {
            title: MODULE_CONFIG.DEFAULT_CONFIG.duplicatesSettingsMenu.title,
            minimizable: false,
            resizable: true,
        },
        position: { width: 500, height: 600 },
        actions: {
            addPriority: function (event, button) { this.onAddPriority(event); },
            removePriority: function (event, button) { this.onRemovePriority(event, button); },
        },
    };

    static PARTS = {
        form: {
            template: MODULE_CONFIG.DEFAULT_CONFIG.templates.duplicatesSettingsMenu.form,
            scrollable: [""],
        },
        footer: { template: MODULE_CONFIG.DEFAULT_CONFIG.templates.duplicatesSettingsMenu.footer },
    };

    constructor(options = {}) {
        super(options);

        this.sources = [];
        for (const pack of game.packs) {
            if (pack.documentName != "Item") continue;

            let label = pack.title;
            if (pack.metadata.packageType == "world") {
                label += " (" + game.i18n.localize("ITEM_BROWSER.WorldCompendium") + ")";
            } else {
                label += " (" + pack.metadata.packageName + ")";
            }
            this.sources.push({ id: pack.metadata.id, label: label });
        }

        this.sources = this.sources.sort((a, b) => a.label.localeCompare(b.label));

        this.duplicatesSettings = foundry.utils.duplicate(Utils.getSetting(MODULE_CONFIG.SETTING_KEYS.duplicatesSettings));
    }

    async _prepareContext(options) {
        let priorities = [];
        for (const priority of this.duplicatesSettings.priorities) {
            const source = this.sources.find((s) => s.id == priority);
            if (source) {
                priorities.push(source);
            }
        }

        let types = this.duplicatesSettings.types.join(", ");
        let sources = this.sources.filter((s) => !priorities.find((p) => p.id == s.id));

        return {
            removeDuplicates: this.duplicatesSettings.removeDuplicates,
            priorities: priorities,
            sources: sources,
            types: types,
        };
    }

    _onRender(context, options) {
        this.element.querySelector(".remove-duplicates").addEventListener("click", (event) => {
            this.duplicatesSettings.removeDuplicates = event.currentTarget.checked;
        });

        this.element.querySelector("#types").addEventListener("keyup", event => {
            this.duplicatesSettings.types = event.currentTarget.value.split(",").map((t) => t.trim()).filter(t => t.length > 0);
        });

        new PriorityDragSort(this.element, this);
    }

    static async formHandler(event, form, formData) {
        this.duplicatesSettings.types = [...new Map(this.duplicatesSettings.types.map(s => [s.toLowerCase(), s])).values()];
        await Utils.setSetting(MODULE_CONFIG.SETTING_KEYS.duplicatesSettings, this.duplicatesSettings);
    }

    onAddPriority(event) {
        event.preventDefault();

        const selectedSource = this.element.querySelector("#source");
        this.duplicatesSettings.priorities.push(selectedSource.selectedOptions[0].value);
        this.render();
    }

    onRemovePriority(event, button) {
        event.preventDefault();

        const li = button.closest("li");
        this.duplicatesSettings.priorities = this.duplicatesSettings.priorities.filter((p) => p != li.dataset.sourceId);
        this.render();
    }
}

class PriorityDragSort {
    constructor(html, menu) {
        this.menu = menu;
        this.prioritiesList = html.querySelector('.priority-list');
        if (!this.prioritiesList) {
            return;
        }

        this.prioritiesList.querySelectorAll("li").forEach((el) => {
            el.ondragstart = this.onDragStart.bind(this);
            el.ondragover = this.onDragOver.bind(this);
            el.ondragend = this.onDragEnd.bind(this);
        });

        this.prioritiesList.querySelectorAll(".sort-handle").forEach((el) => {
            const li = el.closest("li");
            el.onmousedown = li.setAttribute('draggable', 'true');
            el.onmouseup = li.setAttribute('draggable', 'false');
        });
    }

    onDragStart(ev) {
        ev.dataTransfer.setData('text/plain', JSON.stringify({ type: "Priority" }));
        this.dragging = ev.currentTarget;
        this.dragging.classList.add("dragging");
        const liRect = this.dragging.getBoundingClientRect();
        ev.dataTransfer.setDragImage(this.dragging, ev.x - liRect.left, ev.y - liRect.top);
    }

    onDragOver(ev) {
        ev.preventDefault();
        const li = ev.currentTarget.closest("li");
        if (this.dragging && li != this.dragging) {
            if (this.dragging.parentElement == li.parentElement) {
                this.dropTarget = li;
                if (this.dragging.parentNode === this.dropTarget.parentNode) {
                    this.dropTarget = this.dropTarget !== this.dragging.nextElementSibling ? this.dropTarget : this.dropTarget.nextElementSibling;
                }
            }
        }

        if (this.dropTarget) {
            this.prioritiesList.insertBefore(this.dragging, this.dropTarget);
        } else {
            this.prioritiesList.appendChild(this.dragging);
        }
    }

    onDragEnd() {
        this.dragging.classList.remove('dragging');
        this.dragging = null;

        this.menu.duplicatesSettings.priorities = [];
        for (const priority of this.prioritiesList.children) {
            this.menu.duplicatesSettings.priorities.push(priority.dataset.sourceId);
        }
    }
}
