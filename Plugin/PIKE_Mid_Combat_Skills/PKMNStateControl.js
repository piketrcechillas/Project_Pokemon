StateControl.getTurnStatePersist = function(unit) {
		var i, turnState;
		var list = unit.getTurnStateList();
		var count = list.getCount();
		
		for (i = 0; i < count; i++) {
			turnState = list.getData(i);
			if (turnState.getState().custom.persist == true) {
				return turnState.getState();
			}
		}
		
		return null;;
	}

GameOverChecker.isGameOver = function() {
		var i, count, unit;
		var list = PlayerList.getSortieList();
		var isGameOver = false;
		
		// If the player doesn't exist, game over.
		if (list.getCount() === 0 && root.getCurrentSession().isMapState(MapStateType.PLAYERZEROGAMEOVER)) {
			isGameOver = true;
		}
		else {
			list = PlayerList.getDeathList();
			count = list.getCount();	
			for (i = 0; i < count; i++) {
				unit = list.getData(i);
				if (this.isGameOverUnit(unit)) {
					// If the leader is included in the dead list, game over.
					isGameOver = true;
					break;
				}
			}
		}

		if(!this.checkAvailablePokemon()) {
			isGameOver = true;
		}
		
		return isGameOver;
	}


CheckPokemon = function(unit) {
	var i, item;
	var count = UnitItemControl.getPossessionItemCount(unit);

		
	for (i = 0; i < count; i++) {
		item = UnitItemControl.getItem(unit, i)
		if(item.getName() == enemyPokemon.getName()) {
			return true;
		}
	}

	return false;
}

