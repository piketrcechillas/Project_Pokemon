EquipItem = function() {
	var content = root.getEventCommandObject().getOriginalContent();
	var unit = content.getUnit();
	var item = content.getItem();

	ItemControl.setEquippedWeapon(unit, item)
}

CheckAvailablePokemonEvent = function() {
	var list = PlayerList.getSortieList();
	var count = list.getCount();

	for(i = 0; i < count; i++) {
		unit = list.getData(i)
		if(unit.custom.pokemon && unit.getHp() > 0) {
			return 1;
		}
	}

	return 0;
}

SplitThree = function() {
	var content = root.getEventCommandObject().getOriginalContent();
	var value = content.getValue(1);
	if(value < 33) {
		return 0;
	}
	else if(value >= 33 && value < 66) {
		return 1;
	}
	else if(value >= 66) {
		return 2;
	}
}

RepairAll = function() {
	var list = PlayerList.getSortieList();
	var count = list.getCount();

	for(i = 0; i < count; i++) {
		unit = list.getData(i)
		if(unit.custom.pokemon) {
			count2 = UnitItemControl.getPossessionItemCount(unit);
			for(j = 0; j < count2; j++) {
				item = UnitItemControl.getItem(unit, j);
				item.setLimit(item.getLimitMax())
			}
		}
	}

}