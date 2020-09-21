ItemSelectMenu._discardItem = function() {
		var index = this._itemListWindow.getItemIndex();
		
		UnitItemControl.cutItem(this._unit, index);

		var item = this._itemListWindow.getCurrentItem();
		if(item.custom.pokemon) {
			var list = PlayerList.getSortieList();
			var count = list.getCount();
			var pkmName = item.getName();

			for(i = 0; i < count; i++) {
				punit = list.getData(i);

				if(punit.getName() === pkmName){
					var generator = root.getEventGenerator();
					generator.unitRemove(punit, 0, 0);
					generator.execute();
				}
			}
		
		}
		
		this._resetItemList();
		
		this._isDiscardAction = true;
	}

ItemSelectMenu.isWorkAllowed = function(index) {
		var result = false;
		var item = this._itemListWindow.getCurrentItem();
		
		if (item.isWeapon()) {
			if (index === 0) {
				if(!inBattle)
					result = ItemControl.isWeaponAvailable(this._unit, item);
				else
					result = false;
			}
			else if (index === 1) {
				result = !item.isImportance();

				var count = UnitItemControl.getPossessionItemCount(this._unit);
				var num = 0;
		
				for (i = 0; i < count; i++) {
					tempItem = UnitItemControl.getItem(this._unit, i)
					if(tempItem.custom.pokemon) {
						num++;
					}
				}
				result = num>1;

				if(inBattle) {
					result = false;
				}
			}

		}
		else {
			if (index === 0) {
				result = this._isItemUsable(item);
			}
			else if (index === 1) {
				result = !item.isImportance();
				if(inBattle) {
					result = false;
				}
			}
		}
		
		return result;
	}