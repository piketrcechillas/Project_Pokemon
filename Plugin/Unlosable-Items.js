var StickyFingers = ItemControl.decreaseLimit;
ItemControl.decreaseLimit = function(unit, item) {
	if (item.custom.Unbreakable){
		var limit;
		
		// The Item which has durability 0 isn't reduced.
		if (item.getLimitMax() === 0) {
			return;
		}
		
		if (item.isWeapon()) {
			// If the weapon is broken, it doesn't reduce.
			if (item.getLimit() === WeaponLimitValue.BROKEN) {
				return;
			}
		}
		if (item.getLimit()-1 <= 0){
			item.setLimit(0);
		}
		else{
			limit = item.getLimit() - 1;
			item.setLimit(limit);
		}
	}
	else{
		var limit;
		
		// The Item which has durability 0 isn't reduced.
		if (item.getLimitMax() === 0) {
			return;
		}
		
		if (item.isWeapon()) {
			// If the weapon is broken, it doesn't reduce.
			if (item.getLimit() === WeaponLimitValue.BROKEN) {
				return;
			}
		}
		
		limit = item.getLimit() - 1;
		item.setLimit(limit);
	}
};

var RSUnbreakable = ItemControl.isItemBroken
ItemControl.isItemBroken = function(item) {
	// Check if durability of the item which has a durability is unlimited is 0.
	if (item.custom.Unbreakable){
		return false;
	}
	return item.getLimitMax() !== 0 && item.getLimit() === 0;
};

var RSUnusable = ItemControl.isItemUsable;
ItemControl.isItemUsable = function(unit, item){

	if (item.isWeapon()) {
			return false;
		}
		
		// Check if use of item is prohibited.
		if (StateControl.isBadStateFlag(unit, BadStateFlag.ITEM)) {
			return false;
		}
			
		if (item.isWand()) {
			// If the item is a wand, the class should be able to use the wand.
			if (!(unit.getClass().getClassOption() & ClassOptionFlag.WAND)) {
				return false;
			}
			
			// Check if use of a wand is prohibited.
			if (StateControl.isBadStateFlag(unit, BadStateFlag.WAND)) {
				return false;
			}
		}
		
		if (item.getItemType() === ItemType.KEY) {
			if (item.getKeyInfo().isAdvancedKey()) {
				// If it's "Class Key", the class should be able to use the key.
				if (!(unit.getClass().getClassOption() & ClassOptionFlag.KEY)) {
					return false;
				}
			}
		}
		
		// Check "Users".
		if (!this.isOnlyData(unit, item)) {
			return false;
		}
		
	if (item.getLimit() == 0 && item.custom.Unbreakable){
		return false;
	}
	return true;
};

var RSComeOn = ItemControl.lostItem;
ItemControl.lostItem = function(unit, item) {
	if (item.custom.Unbreakable && unit !== null){
		item.setLimit(WeaponLimitValue.BROKEN);
		return;
	}
	else{
		RSComeOn.call(this, unit, item);
	}
};