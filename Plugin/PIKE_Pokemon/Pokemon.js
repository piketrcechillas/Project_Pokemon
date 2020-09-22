var caught = false;
var shake = -1;
var globalAnimeData = null;

var alias1 = ItemPackageControl.getCustomItemSelectionObject;
ItemPackageControl.getCustomItemSelectionObject = function(item, keyword) {
	var result = alias1.call(this, item, keyword);
	
	if (keyword === "Pokeball") {
		return PokeballSelection;
	}
	
	return result;
};


var alias2 = ItemPackageControl.getCustomItemUseObject;
ItemPackageControl.getCustomItemUseObject = function(item, keyword) {
	var result = alias2.call(this, item, keyword);

	if (keyword === "Pokeball") {
		return PokeballItemUse;
	}
	
	return result;
};

var alias3 = ItemPackageControl.getCustomItemInfoObject;
ItemPackageControl.getCustomItemInfoObject = function(item, keyword) {
	var result = alias3.call(this, item, keyword);
	
	if (keyword === "Pokeball") {
		return PokeballInfo;
	}
	
	return result;
};

var alias4 = ItemPackageControl.getCustomItemAvailabilityObject;
ItemPackageControl.getCustomItemAvailabilityObject = function(item, keyword) {
	var result = alias4.call(this, item, keyword);
	
	if (keyword === "Pokeball") {
		return PokeballAvailability;
	}
	
	return result;
}

var PokeballSelection = defineObject(BaseItemSelection , {})


var PokeballItemUse = defineObject(BaseItemUse,
{
	_itemUseParent: null,
	_animeData: null,
	
	enterMainUseCycle: function(itemUseParent) {
		this._itemUseParent = itemUseParent;
		
		this.mainAction();
		
		return EnterResult.NOTENTER;
	},
	
	mainAction: function() {

		var animeid = 0;
		var i, count, list, state, arr;
		var itemTargetInfo = this._itemUseParent.getItemTargetInfo();
		var item = itemTargetInfo.item;
		var unit = enemyPokemon;
		
		var generator = root.getEventGenerator();

		if(shake == 0) {
			var message = "Aww! It appeared to be caught..."
			generator.messageTerop(message, 2, true)
		}
		else if (shake == 1) {
			var message = "Arg! Almost had it!"
			generator.messageTerop(message, 2, true)
		}
		else if (shake == 2) {
			var message = "Shoot! It was so close, too..."
			generator.messageTerop(message, 2, true)
		}
		if(caught) {
			var message = "Congratulations!! " + unit.getName() + " was caught."
			generator.messageTerop(message, 2, true)
			

			var list = root.getBaseData().getWeaponList();

			for(i = 0; i < list.getCount(); i++) {
				var weapon = list.getData(i);
				if(weapon.getName() === unit.getName()) {
					generator.unitItemChange(trainer, weapon, IncreaseType.INCREASE, true);
				}
			}

			var generator2 = root.getEventGenerator();
			generator2.unitAssign(unit, UnitType.PLAYER)
			generator2.execute();
		}

		generator.execute();

		shake = -1;
	},
	
	getItemAnimePos: function(itemUseParent, animeData) {
		x = 500
		y = 250
		pos = LayoutControl.getMapAnimationPos(x, y, animeData);
		return pos;
	}
}
);

var PokeballAvailability = defineObject(BaseItemAvailability,
{
	isItemAllowed: function(unit, targetUnit, item) {
		var count = UnitItemControl.getPossessionItemCount(unit);
		var num = 0;
		
		for (i = 0; i < count; i++) {
			tempItem = UnitItemControl.getItem(unit, i)
				if(tempItem.custom.pokemon) {
					num++;
				}
			}

		if(num > 6) {
			return false;
		}

		if(inBattle && isWild &&!CheckPokemon(unit)) {
			return true;
		}
		else {
			return false;
		}
	}
}
);

var PokeballInfo = defineObject(BaseItemInfo,
{
	drawItemInfoCycle: function(x, y) {
		ItemInfoRenderer.drawKeyword(x, y, "Pokeball");
		y += ItemInfoRenderer.getSpaceY();
		
	},
	
	getInfoPartsCount: function() {
		return 1;
	}
}
);

ItemMainFlowEntry._animeData = null;

ItemMainFlowEntry.enterFlowEntry = function(itemUseParent) {
	root.log("PASS 2")
	var item = itemUseParent.getItemTargetInfo().item

	if(item.getItemType() == ItemType.CUSTOM) {
			var unit = enemyPokemon;
			var mhp = ParamBonus.getMhp(unit);
			var hp = unit.getHp()
			var multiplier = item.custom.multiplier;
			var rate = unit.custom.rate

			var props = Math.floor(  ((3*mhp - 2*hp)/(3*mhp)) * multiplier * rate)

	 		var beta = 1048560 / Math.sqrt(Math.sqrt(16711680/props)) - 10000

			var shakeone = Math.random()*65536;
			var list = root.getBaseData().getEffectAnimationList(false);

			root.log("Beta: " + beta) 

			root.log("Shakeone: " + shakeone)

			if(shakeone >= beta) {
				var list = root.getBaseData().getEffectAnimationList(false);
				this._animeData = list.getDataFromId(0);
				shake = 0;
			}
			else {
				var shaketwo = Math.random()*65536;
				root.log("Shaketwo: " + shaketwo)
				if(shaketwo >= beta) {
					this._animeData = list.getDataFromId(1);
					shake = 1;
				}
				else {
					var shakethree = Math.random()*65536;
					root.log("Shakethree: " + shakethree)
					if(shakethree >= beta) {
						this._animeData = list.getDataFromId(2);
						shake = 2;
					}
					else {
						this._animeData = list.getDataFromId(3);
						caught = true;
					}
				}
			}
		}

		this._prepareMemberData(itemUseParent);
		return this._completeMemberData(itemUseParent);
	}


ItemMainFlowEntry._completeMemberData = function(itemUseParent) {
		var item = itemUseParent.getItemTargetInfo().item
		if(item.getItemType() !== ItemType.CUSTOM) {
			var animeData = itemUseParent.getItemTargetInfo().item.getItemAnime();
		}
		else {
			var animeData = this._animeData
		}
		var pos = itemUseParent.getItemUseObject().getItemAnimePos(itemUseParent, animeData);
		
		if (pos === null || itemUseParent.isItemSkipMode()) {
			return this._changeMainUse() ? EnterResult.OK : EnterResult.NOTENTER;
		}
		
		if (animeData !== null) {
			this._dynamicAnime.startDynamicAnime(animeData, pos.x, pos.y);
			this.changeCycleMode(ItemMainMode.ANIME);
			return EnterResult.OK;
		}
		
		return this._changeMainUse();
	}