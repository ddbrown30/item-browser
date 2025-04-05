import { CONST, PATH } from "../module-config.js";
import { BaseSystem } from "./base-system.js";

export class Swade extends BaseSystem {

    static ADDITIONAL_SEARCHES_TEMPLATE = `${PATH}/templates/partials/additional-searches-swade.hbs`;
    static INDEX_FIELDS = ["system"];
    static ITEM_TYPES = ["ability", "ancestry", "armor", "consumable", "edge", "gear", "hindrance", "power", "shield", "skill", "weapon"];
    static HEADER_CONFIG = {
        damage: {
            class: "item-cell-damage",
            label: "ITEM_BROWSER.Damage",
            sort: 'data-sort-id="damage"',
        },
        ap: {
            class: "item-cell-ap",
            label: "ITEM_BROWSER.AP",
            sort: 'data-sort-id="ap"',
        },
        range: {
            class: "item-cell-range",
            label: "ITEM_BROWSER.Range",
            sort: 'data-sort-id="range"',
        },
        shots: {
            class: "item-cell-attr",
            label: "ITEM_BROWSER.Shots",
            sort: 'data-sort-id="shots"',
        },
        parry: {
            class: "item-cell-attr",
            label: "ITEM_BROWSER.Parry",
            sort: 'data-sort-id="parry"',
        },
        rof: {
            class: "item-cell-attr",
            label: "ITEM_BROWSER.ROF",
            sort: 'data-sort-id="rof"',
        },
        minStr: {
            class: "item-cell-attr",
            label: "ITEM_BROWSER.MinStr",
            sort: 'data-sort-id="minStr"',
        },
        traitMod: {
            class: "item-cell-attr",
            label: "ITEM_BROWSER.TraitMod",
            sort: 'data-sort-id="traitMod"',
        },
        dmgMod: {
            class: "item-cell-attr",
            label: "ITEM_BROWSER.DmgMod",
            sort: 'data-sort-id="dmgMod"',
        },
        heavy: {
            class: "item-cell-attr",
            label: "ITEM_BROWSER.Heavy",
            sort: 'data-sort-id="heavy"',
        },
        armor: {
            class: "item-cell-attr",
            label: "ITEM_BROWSER.Armor",
            sort: 'data-sort-id="armor"',
        },
        toughness: {
            class: "item-cell-attr",
            label: "ITEM_BROWSER.Toughness",
            sort: 'data-sort-id="toughness"',
        },
        locations: {
            class: "item-cell-locations",
            label: "ITEM_BROWSER.Locations",
            sort: '',
        },
        cover: {
            class: "item-cell-attr",
            label: "ITEM_BROWSER.Cover",
            sort: 'data-sort-id="cover"',
        },
        rank: {
            class: "item-cell-rank",
            label: "ITEM_BROWSER.Rank",
            sort: 'data-sort-id="rank"',
        },
        requirements: {
            class: "item-cell-requirements",
            label: "ITEM_BROWSER.Requirements",
            sort: '',
        },
        pp: {
            class: "item-cell-attr",
            label: "ITEM_BROWSER.PP",
            sort: 'data-sort-id="pp"',
        },
        duration: {
            class: "item-cell-duration",
            label: "ITEM_BROWSER.Duration",
            sort: 'data-sort-id="duration"',
        },
        price: {
            class: "item-cell-price",
            label: "ITEM_BROWSER.Cost",
            sort: 'data-sort-id="price"',
        },
        weight: {
            class: "item-cell-weight",
            label: "ITEM_BROWSER.Weight",
            sort: 'data-sort-id="weight"',
        },
    };

    getColumnsForType(type) {
        if (type == "ability") return [];
        if (type == "ancestry") return [];
        if (type == "armor") return ["armor", "toughness", "minStr", "locations", "price", "weight"];
        if (type == "consumable") return ["price", "weight"];
        if (type == "edge") return ["rank", "requirements"];
        if (type == "gear") return ["price", "weight"];
        if (type == "hindrance") return [];
        if (type == "power") return ["damage", "ap", "range", "rank", "pp", "duration"];
        if (type == "shield") return ["parry", "cover", "minStr", "price", "weight"];
        if (type == "skill") return [];
        if (type == "weapon") return ["damage", "ap", "range", "shots", "parry", "rof", "traitMod", "dmgMod", "minStr", "price", "weight"];
        return [];
    }

    filterItems(items) {
        let filtered = super.filterItems(items);

        //Filter by the search desc string
        if (this.searchDesc) {
            filtered = filtered.filter((i) => i.system.description.toLowerCase().includes(this.searchDesc.toLowerCase()));
        }

        return filtered;
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
            let data = {
                ...this.buildCommonRowData(item),
                ...this.getDefaultRowData(type),
            };

            this.setObjectColumnData(item.system, "price", data, true);
            this.setObjectColumnData(item.system, "weight", data, true);
            this.setObjectColumnData(item.system, "ap", data, true);
            this.setObjectColumnData(item.system, "range", data);
            this.setObjectColumnData(item.system, "parry", data, true);
            this.setObjectColumnData(item.system, "rof", data);
            this.setObjectColumnData(item.system, "shots", data, true);
            this.setObjectColumnData(item.system, "armor", data, true);
            this.setObjectColumnData(item.system, "toughness", data, true);
            this.setObjectColumnData(item.system, "cover", data, true);
            this.setObjectColumnData(item.system, "pp", data);
            this.setObjectColumnData(item.system, "duration", data);
            if (item.system.actions) {
                this.setObjectColumnData(item.system.actions, "traitMod", data);
                this.setObjectColumnData(item.system.actions, "dmgMod", data);
            }

            this.setDamageColumnData(item.system.damage, data);
            this.setRankColumnData(item.system, data);
            this.setLocationsColumnData(item.system.locations, data);
            this.setMinStrColumnData(item.system.minStr, data);
            this.setRequirementsColumnData(item, data);

            rowData.push(data);
        }

        let columns = this.getColumnsForType(type);
        for (let row of rowData) {
            row.rowHtml = this.getRowHtml(row, columns, headerData);
        }

        return rowData;
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

    setObjectColumnData(obj, prop, data, ignoreZero) {
        const val = obj[prop];
        if (val || (!ignoreZero && val === 0)) {
            data[prop] = { display: val, sortValue: val };
        }
    }

    setDamageColumnData(damage, data) {
        if (damage) {
            let damageDice = [];
            let sortValue = 0;
            try {
                damageDice = Roll.parse(damage);

                for (let i = 0; i < damageDice.length; ++i) {
                    if (damageDice[i] instanceof foundry.dice.terms.OperatorTerm) continue;

                    let sign = 1;
                    if (i > 0 && damageDice[i - 1] instanceof foundry.dice.terms.OperatorTerm) {
                        if (damageDice[i - 1].operator == "-") sign = -1;
                    }

                    if (damageDice[i] instanceof foundry.dice.terms.Die) {
                        sortValue += damageDice[i].number * damageDice[i].faces * sign;
                    }
                    else if (damageDice[i] instanceof foundry.dice.terms.NumericTerm) {
                        //Treating zeroes (which likely indicates something like @str) as a d5
                        //This keeps them above a d4 while also mostly ensuring that they clump together
                        sortValue += damageDice[i].number == 0 ? 5 * sign : damageDice[i].number * sign;
                    } else {
                        sortValue += sign;
                    }
                }

                //Add zero width spaces so that long formulas will wrap in the table cell
                damage = damage.replace("+", "&#8203;+&#8203;");
                damage = damage.replace("-", "&#8203;-&#8203;");
            } catch {
                sortValue = Number.MAX_SAFE_INTEGER;
            }

            data.damage = { display: damage, sortValue: sortValue };
        }
    }

    setRankColumnData(system, data) {
        const ranks = ["novice", "seasoned", "veteran", "heroic", "legendary"];
        if (system.rank) {
            let sortValue = ranks.indexOf(system.rank.toLowerCase());
            sortValue = sortValue < 0 ? Number.MAX_SAFE_INTEGER : sortValue;
            data.rank = { display: system.rank, sortValue: sortValue };
        } else if (system.requirements) {
            let rank = system.requirements.find((r) => r.type == "rank");
            if (rank) {
                if (typeof rank.value == "number") {
                    let rankLabel = CONFIG.SWADE.ranks[rank.value];
                    data.rank = { display: rankLabel, sortValue: rank.value };
                } else {
                    let rankLabel = game.i18n.localize(rank.value);
                    let sortValue = ranks.indexOf(rankLabel.toLowerCase());
                    sortValue = sortValue < 0 ? Number.MAX_SAFE_INTEGER : sortValue;
                    data.rank = { display: rankLabel, sortValue: sortValue };
                }
            }
        }
    }

    setRequirementsColumnData(item, data) {
        if (item.system.requirements && item.system.requirements.length) {
            const requirementsString = item.system.requirementString;
            if (requirementsString) {
                data.requirements = { display: requirementsString, sortValue: undefined };
            } else {
                const requirementsString = this.getRequirementString(item.system.requirements);
                data.requirements = { display: requirementsString, sortValue: undefined };
            }
        }
    }

    //Copied from the swade system code since there's no other way to build the string with index data
    //If that code changes, this will need to be updated
    getRequirementString(requirements) {
        return requirements.reduce(
            (accumulator, current, index, list) => {
                accumulator += this.requirementToString(current);
                if (index !== list.length - 1) {
                    switch (current.combinator) {
                        case 'or':
                            accumulator +=
                                ' ' + game.i18n.localize('SWADE.Requirements.Or') + ' ';
                            break;
                        case 'and':
                            accumulator += ', ';
                            break;
                    }
                }
                return accumulator;
            }, '',
        );
    }

    requirementToString(requirement) {
        switch (requirement.type) {
            case CONFIG.SWADE.CONST.REQUIREMENT_TYPE.WILDCARD:
                return requirement.value
                    ? game.i18n.localize('SWADE.WildCard')
                    : game.i18n.localize('SWADE.Extra');
            case CONFIG.SWADE.CONST.REQUIREMENT_TYPE.RANK:
                return CONFIG.SWADE.ranks[requirement.value];
            case CONFIG.SWADE.CONST.REQUIREMENT_TYPE.ATTRIBUTE:
                return `${CONFIG.SWADE.attributes[requirement.selector]?.long} d${requirement.value}+`;
            case CONFIG.SWADE.CONST.REQUIREMENT_TYPE.SKILL:
                return `${requirement.label} d${requirement.value}+`;
            case CONFIG.SWADE.CONST.REQUIREMENT_TYPE.POWER:
                return `<i>${requirement.label}</i>`;
            case CONFIG.SWADE.CONST.REQUIREMENT_TYPE.EDGE:
            case CONFIG.SWADE.CONST.REQUIREMENT_TYPE.HINDRANCE:
            case CONFIG.SWADE.CONST.REQUIREMENT_TYPE.ANCESTRY:
            case CONFIG.SWADE.CONST.REQUIREMENT_TYPE.OTHER:
            default:
                return requirement.label ?? '';
        }
    }
    //End copied code

    setMinStrColumnData(minStr, data) {
        if (minStr) {
            const dice = ["d4", "d6", "d8", "d10", "d12"];
            let sortValue = dice.findIndex((d) => d.includes(minStr.toLowerCase()));
            sortValue = sortValue < 0 ? Number.MAX_SAFE_INTEGER : sortValue;
            data.minStr = { display: minStr, sortValue: sortValue };
        }
    }

    setLocationsColumnData(locations, data) {
        if (locations) {
            const armorLocations = [];
            if (locations.head) armorLocations.push(game.i18n.localize('SWADE.Head'));
            if (locations.torso) armorLocations.push(game.i18n.localize('SWADE.Torso'));
            if (locations.arms) armorLocations.push(game.i18n.localize('SWADE.Arms'));
            if (locations.legs) armorLocations.push(game.i18n.localize('SWADE.Legs'));

            // Use localized list formatting
            const formatter = game.i18n.getListFormatter({
                style: 'long',
                type: 'unit',
            });

            const formattedList = formatter.format(armorLocations);
            data.locations = { display: formattedList, sortValue: undefined };
        }
    }

    setDieColumnData(system, prop, data) {
        const die = system[prop];
        if (die) {
            let display = "d" + die.sides;
            let sortValue = die.sides + die.modifier;
            if (die.modifier) {
                if (die.modifier > 0) {
                    display += "+";
                }
                display += die.modifier;
            }
            data[prop] = { display: display, sortValue: sortValue };
        }
    }

    getAdditionalSearchesData(browserDialog, items) {
        this.searchDesc = this.searchDesc ?? "";

        return {
            searchDesc: this.searchDesc,
        };
    }

    activateListeners(browserDialog) {
        //Add a keyup listener on the search desc input so that we can filter as we type
        const searchDescSelector = browserDialog.element.querySelector('input.search-desc');
        searchDescSelector.addEventListener("keyup", async event => {
            this.searchDesc = event.target.value;
            await browserDialog.renderItemList(event);
        });
    }
}