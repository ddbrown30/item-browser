# Item Browser

This module for Foundry VTT adds a button to the Items tab that opens an Item Browser. The browser allows you to see all items from the world as well as all compendiums. Users can only see items for which they have Observer ownership or higher.

The browser shows a summary of information for each item and the list can be filtered by string, source, and other system specific methods.

Selecting an item opens its item sheet and the browser supports drag and drop.

The browser will work for all systems but has specific support for swade, dnd5e, and pf2e. If you are interested in adding support for a new system, check out the guide below.

<img src="https://github.com/ddbrown30/item-browser/blob/main/item_browser.webp" width="700">

## API Use

The browser is also exposed to the API allowing module makers to leverage it to allow the user to select items.

To do so, you just need to call the following function:

```js
let result = await game.itemBrowser.openBrowser(options);
```
* `options`
  * `selector` If true, this option tells the browser to select and return an item rather than using the default behaviour of opening the item sheet. This is true by default when calling `openBrowser`.
  * `itemTypes` This is an array of strings that allows you to limit the valid item types e.g. `{ itemType: ["npc"] }`.
  * `worldItemsOnly` If set to true, World Items will be set as the default source filter and will be the only option in the list.
  * `initialSourceFilter` Sets the initial "Filter Source" selection of the browser. The provided value should be the id of the desired compendium (see tip below) or `worldItems` to select World Items. This only sets the starting value; it will still be possible to select other options as normal. This option is not compatible with `worldItemsOnly` with that option taking precedence.
  * `validFilterSources` This limits the list of sources available for "Filter Source." The provided value should be an array of ids of the desired compendiums (see tip below), `worldItems` for World Items, and "all" for All Items. The default value will be whatever would normally appear earliest in the list. This option is not compatible with `worldItemsOnly` with that option taking precedence.

> [!TIP]
> An easy way to get the id for a compendium is to open one of its items and grab its UUID. The compendium id will be the part between `Compendium.` and `.Item` e.g. the compendium id for `Compendium.dnd5e.monsters.Item.M4eX4Mu5IHCr3TMf` is `dnd5e.monsters`.

The result will contain the UUID of the selected item.

## Adding a New System

If you would like to add support for a new system, the process is relatively straightforward. I would suggest having a look at swade.js as an example.

A system requires two new files with an optional third. The first is the system handler file. This class is responsible for preparing the data that will be used to render the item list. The second is the item list template. This is creates the html used to display the item list. The final optional file is the additional filters template. This allows you to add additional filters to the left side of the browser.

### System Handler

- `getItemListTemplate - Required` This returns the name of the .hbs file that we will use when rendering the list. Check out `item-list-swade.hbs` for an example.
- `buildRowData - Required` This function takes the list of items and processes it into row data to be used when rendering. The call to `buildCommonRowData` is required. The rest of the properties are dependent on the system but should follow the format of `{display, sortValue}`. `display` is the string that will be shown to the user and `sortValue` is what we use when sorting by that column. For example, size in dnd5e ranges from Tiny to Gargantuan but we don't want to sort that alphabetically, so we set the sortValue for Tiny to 0 and increase from there.
- `getIndexFields - Optional` This is a list of additional field to request when getting the index from the compendiums. This allows you to grab additional stats for the item without having to fully load the document (which is slow, especially when you have a lot of items).
- `getItemTypes - Optional` This is the list of supported item types. If you want to support all item types for your system, you do not need to override this function.
- `filterItems - Optional` This allows you to do additional filtering which is covered more later.
- `ADDITIONAL_FILTERS_TEMPLATE - Optional` This returns the name of the .hbs file that we will use when rendering the additional filters. Check out `additional-filters-swade.hbs` for an example.
- `getAdditionalFiltersData - Optional` If using additional filters, this is where you can prepare data to be used when rendering.
- `activateListeners - Optional` This allows you to activate html listeners on any elements in the dialog. This is mainly used for hooking into elements in the additional filters but could be used for other elements.

### Item List Template

The item list template is the Handlebars definition of the item list. It must follow the format of a set of table headers followed by the collection of table rows for each item. Check out any of the existing item list files for examples.

By adding a `data-sort-id` value to a table header entry, you mark that as a sortable column. The id value should match the name of the column you created in `buildRowData`. For example, if you have a column of `size: { display, sortValue }`, your `data-sort-id` should be `size`.

Be sure to copy exactly the `tr` elements. Failure to do so will cause bugs with the selection logic.

### Additional Filters

If you would like to add additional filters, you can optionally create another .hbs file to do this. Check out `additional-filters-swade.hbs` for an example. In there, we are adding another drop down the filters based on the item type (PC, NPC, or Vehicle). The logic for this is then implemented in `getAdditionalFiltersData` and `activateListeners` in the Swade handler class.

### Hooking it Up

The final step to adding the a new system is to add it to `createSystemHandler` in `item-browser.js`. Just add your system to the if/else tree and instantiate your system handler. If you've done everything else correctly, everything else should be handled for you automatically.

If you have any questions or issues, feel free to reach out.
