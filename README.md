# Item Browser

This module for Foundry VTT adds a button to the Items tab that opens an Item Browser. The browser allows you to see all items from the world as well as all compendiums. Users can only see items for which they have Observer ownership or higher.

The browser shows a summary of information for each item and the list can be filtered by name, source, type, and other system specific methods.

Selecting an item opens its item sheet and the browser supports drag and drop.

The browser will work for all systems but has specific support for swade and dnd5e. If you are interested in adding support for a new system, check out the guide below.

<img src="https://github.com/ddbrown30/item-browser/blob/main/item_browser.webp" width="700">

## API Use

The browser is also exposed to the API allowing module makers to leverage it to allow the user to select items.

To do so, you just need to call the following function:

```js
let result = await game.itemBrowser.openBrowser(options);
```
* `options`
  * `selector` If true, this option tells the browser to select and return an item rather than using the default behaviour of opening the item sheet. This is true by default when calling `openBrowser`.
  * `itemTypes` This is an array of strings that allows you to limit the valid item types e.g. `{ itemType: ["weapon"] }`.
  * `worldItemsOnly` If set to true, World Items will be set as the default source filter and will be the only option in the list.
  * `initialSourceFilter` Sets the initial "Filter Source" selection of the browser. The provided value should be the id of the desired compendium (see tip below) or `worldItems` to select World Items. This only sets the starting value; it will still be possible to select other options as normal. This option is not compatible with `worldItemsOnly` with that option taking precedence.
  * `validFilterSources` This limits the list of sources available for "Filter Source." The provided value should be an array of ids of the desired compendiums (see tip below), `worldItems` for World Items, and "all" for All Items. The default value will be whatever would normally appear earliest in the list. This option is not compatible with `worldItemsOnly` with that option taking precedence.

> [!TIP]
> An easy way to get the id for a compendium is to open one of its items and grab its UUID. The compendium id will be the part between `Compendium.` and `.Item` e.g. the compendium id for `Compendium.dnd5e.spells.Item.4H6YgYdKgnX6ZQ8M` is `dnd5e.spells`.

The result will contain the UUID of the selected item.

## Adding a New System

If you would like to add support for a new system, the process is relatively straightforward although the system specifics can add a lot of complexity. I would suggest having a look at dnd5e.js as an example.

A system requires one new file with two optional files. The first is the system handler file. This class is responsible for preparing the data that will be used to render the item list. The first optional file is the additional searches template. This is creates the html used to add extra search fields above the item list. The second optional file is the additional filters template. This allows you to add additional filters to the left side of the browser.

### System Handler

- `buildRowData - Required` This function takes the list of items and processes it into row data to be used when rendering. The call to `buildCommonRowData` is required. The rest of the properties are dependent on the system but should follow the format of `{display, sortValue}`. `display` is the string that will be shown to the user and `sortValue` is what we use when sorting by that column. For example, rank in swade ranges from Novice to Legendary but we don't want to sort that alphabetically, so we set the sortValue for Novice to 0 and increase from there.
- `INDEX_FIELDS - Optional` This is a list of additional field to request when getting the index from the compendiums. This allows you to grab additional stats for the item without having to fully load the document (which is slow, especially when you have a lot of items).
- `ITEM_TYPES - Optional` This is the list of supported item types. If you want to support all item types for your system, you do not need to override this function.
- `HEADER_CONFIG - Required` This is the list of all possible headers you will want to use.
- `getColumnsForType(type) - Required` This defines the list of columns and their order that will be used for each type.
- `ADDITIONAL_SEARCHES_TEMPLATE - Optional` This returns the name of the .hbs file that we will use when rendering the additional searches. Check out `additional-searches-dnd5e.hbs` for an example.
- `ADDITIONAL_FILTERS_TEMPLATE - Optional` This returns the name of the .hbs file that we will use when rendering the additional filters. Check out `additional-filters-dnd5e.hbs` for an example.
- `getAdditionalSearchesData - Optional` If using additional searches, this is where you can prepare data to be used when rendering.
- `getAdditionalFiltersData - Optional` If using additional filters, this is where you can prepare data to be used when rendering.
- `filterItems - Optional` This allows you to do additional filtering which is covered more later.
- `activateListeners - Optional` This allows you to activate html listeners on any elements in the dialog. This is mainly used for hooking into elements in the additional filters and searches but could be used for other elements.

### Additional Searches

If you would like to add additional searches, you can optionally create another .hbs file to do this. Check out `additional-searches-dnd5e.hbs` for an example. In there, we are adding another field that will search the description of the items. The logic for this is then implemented in `getAdditionalSearchesData`, `activateListeners`, and `filterItems` in the Dnd5e handler class.

### Additional Filters

If you would like to add additional filters, you can optionally create another .hbs file to do this. Check out `additional-filters-dnd5e.hbs` for an example. In there, we are adding another drop down the filters based on the spell level. The dropdown is only visible when Spells are the active type (this is handled in the hbs file). The logic for this is then implemented in `getAdditionalFiltersData` `activateListeners`, and `filterItems` in the Dnd5e handler class.

### Hooking it Up

The final step to adding the a new system is to add it to `createSystemHandler` in `item-browser.js`. Just add your system to the if/else tree and instantiate your system handler. If you've done everything else correctly, everything else should be handled for you automatically.

If you have any questions or issues, feel free to reach out.
