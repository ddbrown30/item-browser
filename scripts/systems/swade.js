import { PATH } from "../module-config.js";
import { BaseSystem } from "./base-system.js";

export class Swade extends BaseSystem {

    getAdditionalFiltersTemplate() {
        return `${PATH}/templates/partials/additional-filters-swade.hbs`;
    }

    getItemListTemplate() {
        return `${PATH}/templates/partials/item-list-swade.hbs`;
    }

    getIndexFields() {
        return [
            "system",
        ];
    }

    getItemTypes() {
        return ["ability", "ancestry", "armor", "consumable",
            "edge", "gear", "hindrance", "power", "shield", "skill", "weapon"];
    }

    filterItems(items) {
        let filtered = super.filterItems(items);

        //Filter by type
        if (this.filters.typeFilter) {
            filtered = filtered.filter((a) => a.type == this.filters.typeFilter);
        }

        return filtered;
    }

    getDataStructure(initValue) {
        return {
            damage: initValue,
            ap: initValue,
            range: initValue,
            shots: initValue,
            parry: initValue,
            rof: initValue,
            minStr: initValue,
            traitMod: initValue,
            dmgMod: initValue,
            heavy: initValue,
            armor: initValue,
            tough: initValue,
            hitLocs: initValue,
            cover: initValue,
            rank: initValue,
            pp: initValue,
            duration: initValue,
            price: initValue,
            weight: initValue,
        };
    }

    buildRowData(items) {
        let rowData = [];
        let usedFields = this.getDataStructure(null);
        let i = 0;
        for (const item of items) {            
            let data = {
                ...this.buildCommonRowData(item),
                ...this.getDataStructure({ display: "-", sortValue: -100 }),
            };

            console.log(i++);
            if( i == 880) {
                console.log(i);
            }
            
            this.setSystemColumnData(item.system, "price", data, usedFields);
            this.setSystemColumnData(item.system, "weight", data, usedFields);
            this.setDamageColumnData(item.system.damage, data, usedFields);
            this.setSystemColumnData(item.system, "ap", data, usedFields);
            this.setSystemColumnData(item.system, "range", data, usedFields);
            this.setSystemColumnData(item.system, "parry", data, usedFields);
            this.setSystemColumnData(item.system, "rof", data, usedFields);
            this.setSystemColumnData(item.system, "shots", data, usedFields, true);
            this.setSystemColumnData(item.system, "minStr", data, usedFields);
            this.setSystemColumnData(item.system, "armor", data, usedFields);
            this.setSystemColumnData(item.system, "toughness", data, usedFields);
            this.setSystemColumnData(item.system, "cover", data, usedFields);
            this.setSystemColumnData(item.system, "pp", data, usedFields);
            this.setSystemColumnData(item.system, "duration", data, usedFields);
            this.setSystemColumnData(item.system, "rank", data, usedFields);

            if (item.type == "weapon") {
            } else if (item.type == "armor") {
                //data.minStr.display = data.minStr.sortValue = item.system.minStr;
            }

            rowData.push(data);
        }

        return [rowData, usedFields];
    }

    setSystemColumnData(system, prop, data, usedFields, ignoreZero) {
        const val = system[prop];
        if (val || (!ignoreZero && val === 0)) {
            data[prop] = { display: val, sortValue: val };
            usedFields[prop] = true;
        } else {
            data[prop] = { display: "-", sortValue: -100 };
        }
    }

    setDamageColumnData(damage, data, usedFields) {
        if (damage) {
            let damageDice = [];
            try {
                damageDice = Roll.parse(damage);
            } catch { }

            let sortValue = 0;
            for (let i = 0; i < damageDice.length; ++i) {
                if (damageDice[i] instanceof foundry.dice.terms.OperatorTerm) continue;

                let sign = 1;
                if (i > 0 && damageDice[i-1] instanceof foundry.dice.terms.OperatorTerm) {
                    if (damageDice[i-1].operator == "-") sign = -1;
                }

                if (damageDice[i] instanceof foundry.dice.terms.Die) {
                    sortValue += damageDice[i].number * damageDice[i].faces * sign;
                }
                else if (damageDice[i] instanceof foundry.dice.terms.NumericTerm) {
                    sortValue += damageDice[i].number == 0 ? sign : damageDice[i].number * sign;
                } else {
                    sortValue += sign;
                }
            }
            data.damage = { display: damage, sortValue: sortValue };
            usedFields.damage = true;
        } else {
            data.damage = { display: "-", sortValue: -100 };
        }
    }

    setDieColumnData(system, prop, data, usedFields) {
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
            usedFields[prop] = true;
        } else {
            data[prop] = { display: "-", sortValue: -100 };
        }
    }

    getAdditionalFiltersData(browserDialog, items) {
        let itemTypes = [];
        if (items.find((i) => i.type == "ability")) itemTypes.push({ id: "ability", label: game.i18n.localize("ITEM_BROWSER.FilterAbilities") });
        if (items.find((i) => i.type == "ancestry")) itemTypes.push({ id: "ancestry", label: game.i18n.localize("ITEM_BROWSER.FilterAncestries") });
        if (items.find((i) => i.type == "armor")) itemTypes.push({ id: "armor", label: game.i18n.localize("ITEM_BROWSER.FilterArmors") });
        if (items.find((i) => i.type == "consumable")) itemTypes.push({ id: "consumable", label: game.i18n.localize("ITEM_BROWSER.FilterConsumables") });
        if (items.find((i) => i.type == "edge")) itemTypes.push({ id: "edge", label: game.i18n.localize("ITEM_BROWSER.FilterEdges") });
        if (items.find((i) => i.type == "gear")) itemTypes.push({ id: "gear", label: game.i18n.localize("ITEM_BROWSER.FilterGear") });
        if (items.find((i) => i.type == "hindrance")) itemTypes.push({ id: "hindrance", label: game.i18n.localize("ITEM_BROWSER.FilterHindrances") });
        if (items.find((i) => i.type == "power")) itemTypes.push({ id: "power", label: game.i18n.localize("ITEM_BROWSER.FilterPowers") });
        if (items.find((i) => i.type == "shield")) itemTypes.push({ id: "shield", label: game.i18n.localize("ITEM_BROWSER.FilterShields") });
        if (items.find((i) => i.type == "skill")) itemTypes.push({ id: "skill", label: game.i18n.localize("ITEM_BROWSER.FilterSkills") });
        if (items.find((i) => i.type == "weapon")) itemTypes.push({ id: "weapon", label: game.i18n.localize("ITEM_BROWSER.FilterWeapons") });
        itemTypes = itemTypes.sort((a, b) => a.label.localeCompare(b.label));
        
        itemTypes.unshift({ id: "", label: game.i18n.localize("ITEM_BROWSER.FilterAllTypes") });

        return {
            itemTypes: itemTypes,
            filters: this.filters,
        };
    }

    activateListeners(browserDialog) {
        super.addDropdownListener("type", "typeFilter", browserDialog);
        // super.addDropdownListener("edge", "edgeFilter", browserDialog);
        // super.addDropdownListener("ability", "abilityFilter", browserDialog);
        // super.addDropdownListener("pace", "paceFilter", browserDialog);
    }
}