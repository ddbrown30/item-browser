export const NAME = "item-browser";

export const TITLE = "Item Browser";
export const SHORT_TITLE = "IB";

export const PATH = "modules/item-browser";

export const CONST = {
    unusedValue: { display: "-", sortValue: Number.MAX_SAFE_INTEGER },
}

export const DEFAULT_CONFIG = {
    templates: {
        itemBrowserButton: `${PATH}/templates/item-browser-button.hbs`,
        itemBrowserDialogBody: `${PATH}/templates/item-browser-dialog-body.hbs`,
        itemBrowserDialogFooter: `${PATH}/templates/item-browser-dialog-footer.hbs`,
    }
}

export const FLAGS = {
}

export const SETTING_KEYS = {
    showOnItemDirectory: "showOnItemDirectory",
    useSmallButton: "useSmallButton",
}

