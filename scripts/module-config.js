export const NAME = "item-browser";

export const TITLE = "Item Browser";
export const SHORT_TITLE = "IB";

export const PATH = "modules/item-browser";

export const CONST = {
    unusedValue: { display: "-", sortValue: Number.MAX_SAFE_INTEGER },
    allTypesId: "all",
}

export const DEFAULT_CONFIG = {
    templates: {
        itemBrowserButton: `${PATH}/templates/item-browser-button.hbs`,
        itemBrowserDialogBody: `${PATH}/templates/item-browser-dialog-body.hbs`,
        itemBrowserDialogFooter: `${PATH}/templates/item-browser-dialog-footer.hbs`,
        itemList: `${PATH}/templates/partials/item-list.hbs`,
        itemRows: `${PATH}/templates/partials/item-rows.hbs`,
        duplicatesSettingsMenu: {
            form: `${PATH}/templates/duplicates-settings/form.hbs`,
            footer: `${PATH}/templates/duplicates-settings/footer.hbs`,
        },
    },
    duplicatesSettingsMenu: {
        id: "item-browser-duplicates-settings",
        title: "ITEM_BROWSER.Settings.DuplicatesSettings.Title",
    },
    progressiveRenderSize: 1000,
}

export const FLAGS = {
}

export const SETTING_KEYS = {
    showOnItemDirectory: "showOnItemDirectory",
    useSmallButton: "useSmallButton",
    duplicatesMenu: "duplicatesMenu",
    duplicatesSettings: "duplicatesSettings",
    useProgressiveRendering: "useProgressiveRendering",
    progressiveRenderSize: "progressiveRenderSize",
}

