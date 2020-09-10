AllUnitList.getDeathList = function(list) {
		var funcCondition = function(unit) {
			return unit.getHp() == 0;
		};
		
		return this.getList(list, funcCondition);
	}

ResurrectionItemUse.mainAction = function() {

		var type = this._item.getResurrectionInfo().getResurrectionType();
		
		if (Miscellaneous.isPrepareScene()) {
			type = ResurrectionType.MAX;
		}
		else {
			this._targetUnit.setSortieState(SortieType.SORTIE);
		}
		
		this._targetUnit.setAliveState(AliveType.ALIVE);
		this._targetUnit.setInvisible(false);
		this._targetUnit.setWait(false);
		
		// Enable to move with the enemy turn by deactivating acted.
		this._targetUnit.setOrderMark(OrderMarkType.FREE);
		
		this._changeHp(type);
	}