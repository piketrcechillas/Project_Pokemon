EquipItem = function() {
	var content = root.getEventCommandObject().getOriginalContent();
	var unit = content.getUnit();
	var item = content.getItem();

	ItemControl.setEquippedWeapon(unit, item)
}