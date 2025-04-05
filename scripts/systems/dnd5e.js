import { CONST, PATH } from "../module-config.js";
import { Utils } from "../utils.js";
import { BaseSystem } from "./base-system.js";

export class DnD5e extends BaseSystem {

    static ADDITIONAL_SEARCHES_TEMPLATE = `${PATH}/templates/partials/additional-searches-dnd5e.hbs`;
    static INDEX_FIELDS = ["system", "labels"];
    static ITEM_TYPES = ["background", "class", "consumable", "container", "equipment", "feat", "loot", "race", "spell", "subclass", "tool", "weapon"];
    static HEADER_CONFIG = {
        damage: {
            class: "item-cell-dnddamage",
            label: "ITEM_BROWSER.Damage",
            sort: 'data-sort-id="damage"',
        },
        healing: {
            class: "item-cell-dnddamage",
            label: "ITEM_BROWSER.Healing",
            sort: 'data-sort-id="healing"',
        },
        toHit: {
            class: "item-cell-attr",
            label: "ITEM_BROWSER.ToHit",
            sort: 'data-sort-id="toHit"',
        },
        range: {
            class: "item-cell-range",
            label: "ITEM_BROWSER.Range",
            sort: 'data-sort-id="range"',
        },
        attunement: {
            class: "item-cell-attunement",
            label: "ITEM_BROWSER.Attunement",
            sort: 'data-sort-id="attunement"',
        },
        ac: {
            class: "item-cell-ac",
            label: "ITEM_BROWSER.AC",
            sort: 'data-sort-id="ac"',
        },
        spellLevel: {
            class: "item-cell-spellLevel",
            label: "ITEM_BROWSER.Level",
            sort: 'data-sort-id="spellLevel"',
        },
        school: {
            class: "item-cell-school",
            label: "ITEM_BROWSER.School",
            sort: 'data-sort-id="school"',
        },
        castTime: {
            class: "item-cell-cast-time",
            label: "ITEM_BROWSER.CastTime",
            sort: 'data-sort-id="castTime"',
        },
        target: {
            class: "item-cell-target",
            label: "ITEM_BROWSER.Target",
            sort: 'data-sort-id="target"',
        },
        components: {
            class: "item-cell-components",
            label: "ITEM_BROWSER.Components",
            sort: 'data-sort-id="components"',
        },
        duration: {
            class: "item-cell-duration",
            label: "ITEM_BROWSER.Duration",
            sort: 'data-sort-id="duration"',
        },
        baseWeapon: {
            class: "item-cell-base-weapon",
            label: "ITEM_BROWSER.BaseWeapon",
            sort: 'data-sort-id="baseWeapon"',
        },
        equipmentType: {
            class: "item-cell-equipment-type",
            label: "ITEM_BROWSER.EquipmentType",
            sort: 'data-sort-id="equipmentType"',
        },
        rarity: {
            class: "item-cell-rarity",
            label: "ITEM_BROWSER.Rarity",
            sort: 'data-sort-id="rarity"',
        },
        price: {
            class: "item-cell-dndprice",
            label: "ITEM_BROWSER.Price",
            sort: 'data-sort-id="price"',
        },
        weight: {
            class: "item-cell-weight",
            label: "ITEM_BROWSER.Weight",
            sort: 'data-sort-id="weight"',
        },
    };

    getColumnsForType(type) {
        if (type == "background") return [];
        if (type == "class") return [];
        if (type == "consumable") return ["toHit", "attunement", "damage", "healing", "rarity", "price", "weight"];
        if (type == "container") return ["price", "weight"];
        if (type == "equipment") return ["equipmentType", "ac", "attunement", "rarity", "price", "weight"];
        if (type == "loot") return ["price", "weight"];
        if (type == "race") return [];
        if (type == "spell") return ["spellLevel", "castTime", "range", "target", "duration", "components", "school"];
        if (type == "subclass") return [];
        if (type == "tool") return ["price", "weight"];
        if (type == "weapon") return ["baseWeapon", "toHit", "damage", "range", "attunement", "rarity", "price", "weight"];
        return [];
    }

    filterItems(items) {
        let filtered = super.filterItems(items);

        //Filter by the search desc string
        if (this.searchDesc) {
            filtered = filtered.filter((i) => i.system.description.value.toLowerCase().includes(this.searchDesc.toLowerCase()));
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

            this.setPriceColumnData(item.system.price, data);
            this.setWeightColumnData(item.system.weight, data);
            this.setDamageColumnData(item, data);
            this.setToHitColumnData(item.system.magicalBonus, data, item.type);
            this.setAttunementColumnData(item.system.attunement, data);
            this.setRarityColumnData(item.system.rarity, data);
            this.setRangeColumnData(item, data);
            this.setTargetColumnData(item.system.target, data);
            this.setDurationColumnData(item.system, data);

            if (item.type == "weapon") {
                await this.setBaseWeaponColumnData(item.system.type?.baseItem, data);
            } else if (item.type == "equipment") {
                this.setACColumnData(item.system, data);
                this.setEquipmentTypeColumnData(item.system.type, data);
            } else if (item.type == "spell") {
                this.setSpellLevelColumnData(item.system.level, data);
                this.setSchoolColumnData(item.system.school, data);
                this.setComponentsColumnData(item.system, data);
                this.setCastTimeColumnData(item.system, data);
            }

            rowData.push(data);
        }

        let columns = this.getColumnsForType(type);
        for (let row of rowData) {
            row.rowHtml = this.getRowHtml(row, columns, headerData);
        }

        return rowData;
    }

    setObjectColumnData(obj, prop, data, ignoreZero) {
        const val = obj[prop];
        if (val || (!ignoreZero && val === 0)) {
            data[prop] = { display: val, sortValue: val };
        }
    }

    setPriceColumnData(price, data) {
        if (price?.value) {
            let priceString = price.value + " " + price.denomination;
            const denomMults = { cp: 1, sp: 10, ep: 50, gp: 100, pp: 1000 };
            let sortValue = price.value * (denomMults[price.denomination]);
            data.price = { display: priceString, sortValue: sortValue };
        }
    }

    setWeightColumnData(weight, data) {
        if (weight?.value) {
            let weightString = weight.value + " " + weight.units;
            const unitMults = { lb: 1, tn: 2000, kg: 2.2, t: 2200 };
            let sortValue = weight.value * (unitMults[weight.units]);
            data.weight = { display: weightString, sortValue: sortValue };
        }
    }

    setDamageColumnData(item, data) {
        if (!item.system.damage?.base) return;

        let damages = [item.system.damage.base];
        const properties = Array.from(item.system.properties);
        if (properties.includes("ver")) {
            let verseData = { ...item.system.damage.versatile };
            verseData.denomination ||= CONFIG.DND5E.dieSteps[Math.min(
                CONFIG.DND5E.dieSteps.indexOf(item.system.damage.base.denomination) + 1,
                CONFIG.DND5E.dieSteps.length - 1
            )];
            verseData.number ||= item.system.damage.base.number;
            verseData.bonus ||= item.system.damage.base.bonus;
            verseData.types = item.system.damage.base.types;
            damages.push(verseData);
        }
        let sortValue = 0;
        let display = "";
        let isHealing = false;
        for (let damage of damages) {
            if (display) {
                display += "\n";
            }
            sortValue = 0;
            const damageTypes = Array.from(damage.types);
            if (damageTypes.length) {
                let formula = "";
                if (damage.number) {
                    formula += damage.number + "d" + damage.denomination;
                }

                if (damage.custom.enabled) {
                    formula += damage.custom.formula;
                }

                if (damage.bonus) {
                    if (formula) {
                        formula += "+";
                    }
                    formula += damage.bonus;
                }

                let damageBonus = (item.system.damageBonus ?? 0) + (item.system.magicalBonus ?? 0);
                if (damageBonus) {
                    if (formula) {
                        formula += "+";
                    }
                    formula += damageBonus;
                }

                formula = game.dnd5e.dice.simplifyRollFormula(formula);
                if (formula) {
                    sortValue = new Roll(formula).evaluateSync({ maximize: true }).total;
                }

                formula += " ";
                for (let damageType of damageTypes) {
                    let damageTypeData = CONFIG.DND5E.damageTypes[damageType];
                    if (!damageTypeData) {
                        damageTypeData = CONFIG.DND5E.healingTypes[damageType];
                        isHealing = true;
                        sortValue -= damageType == "temphp" ? 50 : 0; //Make temphp less valuable than real hp
                    }

                    if (damageTypeData) {
                        formula += `<dnd5e-icon src=${damageTypeData.icon}></dnd5e-icon>`;
                    }
                }
                display += formula;
            }
        }

        if (!display) {
            return;
        }

        if (isHealing) {
            data.healing = { display: display, sortValue: sortValue };
        } else {
            data.damage = { display: display, sortValue: sortValue };
        }
    }

    setRangeColumnData(item, data) {
        let rangeString = "";
        let sortValue = 0;
        const range = item.system.range;
        if (range?.value) {
            rangeString += range.value;
            sortValue = range.value * 100; //Times 100 so that it's always bigger than reach
            if (range.long) {
                rangeString += "/" + range.long;
            }

            if (item.type == "spell") {
                rangeString += " " + range.units;
            }
        } else if (item.system.properties && Array.from(item.system.properties).includes("rch")) {
            rangeString += CONFIG.DND5E.itemProperties.rch.label;
            sortValue = 1;
        }

        if (rangeString) {
            data.range = { display: rangeString, sortValue: sortValue };
        }
    }

    setTargetColumnData(target, data) {
        if (!target?.affects && !target?.template) return;

        const pr = game.dnd5e.utils.getPluralRules();

        // Generate the template label
        let targetString = "";
        const templateConfig = CONFIG.DND5E.areaTargetTypes[target.template.type];
        if (templateConfig) {
            const parts = [];
            if (target.template.count > 1) parts.push(`${target.template.count} ×`);
            if (target.template.units in CONFIG.DND5E.movementUnits) {
                parts.push(game.dnd5e.utils.formatLength(target.template.size, target.template.units));
            }

            targetString = game.i18n.format(
                `${templateConfig.counted}.${pr.select(target.template.count || 1)}`, { number: parts.filterJoin(" ") }
            ).trim().capitalize();
        } else {
            const affectsConfig = CONFIG.DND5E.individualTargetTypes[target.affects.type];

            targetString = affectsConfig?.counted
            ? game.i18n.format(
                `${affectsConfig.counted}.${target.affects.count ? pr.select(target.affects.count) : "other"}`,
                {number: target.affects.count ? game.dnd5e.utils.formatNumber(target.affects.count) : game.i18n.localize(`DND5E.TARGET.Count.${target.template.type ? "Every" : "Any"}`)}
                ).trim().capitalize()
            : (affectsConfig?.label ?? "");
        }

        if (targetString) {
            data.target = { display: targetString, sortValue: targetString };
        }
    }

    setComponentsColumnData(system, data) {
        let componentsString = "";

        const properties = Array.from(system.properties);
        if (properties.includes("vocal")) {
            componentsString = CONFIG.DND5E.itemProperties.vocal.abbreviation;
        }

        if (properties.includes("somatic")) {
            if (componentsString) componentsString += ", ";
            componentsString += CONFIG.DND5E.itemProperties.somatic.abbreviation;
        }

        if (properties.includes("material")) {
            if (componentsString) componentsString += ", ";
            componentsString += CONFIG.DND5E.itemProperties.material.abbreviation;

            if (system.materials.consumed) {
                componentsString += "*";
            }
        }

        if (componentsString) {
            data.components = { display: componentsString, sortValue: componentsString };
        }
    }

    setSchoolColumnData(school, data) {
        let schoolString = CONFIG.DND5E.spellSchools[school]?.label;
        if (schoolString) {
            data.school = { display: schoolString, sortValue: schoolString };
        }
    }

    setDurationColumnData(system, data) {
        let duration = system.duration;
        if (duration) {
            duration.scalar = duration.units in CONFIG.DND5E.scalarTimePeriods;
            if ( duration.scalar ) {
                duration.value = duration.value.replace("@item.level", system.level);
                duration.value = game.dnd5e.dice.simplifyRollFormula(duration.value);
            } else duration.value = null;

            let durationString = "";
            if ( duration.units ) {
               durationString = CONFIG.DND5E.timePeriods[duration.units] ?? "";
              if ( duration.value ) durationString = `${duration.value} ${durationString.toLowerCase()}`;

              const properties = Array.from(system.properties);
              durationString = properties?.includes("concentration")
                ? game.i18n.format("DND5E.ConcentrationDuration", {duration: durationString}) : durationString;
            }

            if (durationString) {
                data.duration = { display: durationString, sortValue: durationString };
            }
        }
    }

    setCastTimeColumnData(system, data) {
        let timeString = "";

        timeString = [
            system.activation.value, CONFIG.DND5E.activityActivationTypes[system.activation.type]?.label
          ].filterJoin(" ");
        if (timeString) {
            data.castTime = { display: timeString, sortValue: timeString };
        }
    }

    setACColumnData(system, data) {
        const isArmor = system.type.value in CONFIG.DND5E.armorTypes;
        if (isArmor) {
            const isShield = system.type.value == "shield";
            let armorString = isShield ? "+" : "";

            let armor = system.armor;
            let ac = armor.value + (armor.magicalBonus ?? 0);
            armorString += ac;

            if (!isShield && armor.dex != 0) {
                const dexString = Utils.capitalizeFirstLetter(CONFIG.DND5E.abilities.dex.abbreviation);
                armorString += " + " + dexString;

                if (armor.dex > 0) {
                    armorString += `(${armor.dex})`;
                }
            }

            data.ac = { display: armorString, sortValue: ac };
        }
    }

    setToHitColumnData(bonus, data, type) {
        const magicalBonus = bonus ?? 0;
        if (magicalBonus == 0 && type != "weapon") return;

        let toHitString = magicalBonus < 0 ? "-" : "+";
        toHitString += magicalBonus;
        data.toHit = { display: toHitString, sortValue: magicalBonus };
    }

    setSpellLevelColumnData(level, data) {
        if (level || level == 0) {
            data.spellLevel = { display: CONFIG.DND5E.spellLevels[level], sortValue: level };
        }
    }

    setAttunementColumnData(attunement, data) {
        if (!attunement) {
            data.attunement = { display: game.i18n.localize("ITEM_BROWSER.No"), sortValue: 0 };
        } else {
            data.attunement = { display: game.i18n.localize("ITEM_BROWSER.Yes"), sortValue: 1 };
        }
    }

    async setBaseWeaponColumnData(baseWeaponType, data) {
        if (baseWeaponType) {
            let baseWeapon = await game.dnd5e.documents.Trait.getBaseItem(CONFIG.DND5E.weaponIds[baseWeaponType]);
            data.baseWeapon = { display: baseWeapon.name, sortValue: baseWeapon.name };
        }
    }

    setEquipmentTypeColumnData(equipmentType, data) {
        if (equipmentType) {
            data.equipmentType = { display: CONFIG.DND5E.equipmentTypes[equipmentType.value], sortValue: CONFIG.DND5E.equipmentTypes[equipmentType.value] };
        }
    }

    setRarityColumnData(rarity, data) {
        if (rarity) {
            const rarities = ["common", "uncommon", "rare", "veryRare", "legendary", "artifact"];
            const sortValue = rarities.indexOf(rarity);
            data.rarity = { display: CONFIG.DND5E.itemRarity[rarity], sortValue: sortValue };
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

    getAdditionalSearchesData(browserDialog, items) {
        this.searchDesc = this.searchDesc ?? "";

        return {
            searchDesc: this.searchDesc,
        };
    }

    activateListeners(browserDialog) {
        //Add a keyup listener on the search desc input so that we can filter as we type
        const searchDescSelector = browserDialog.element.querySelector('input.search-desc');
        searchDescSelector?.addEventListener("keyup", async event => {
            this.searchDesc = event.target.value;
            await browserDialog.renderItemList(event);
        });
    }
}