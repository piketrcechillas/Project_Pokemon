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