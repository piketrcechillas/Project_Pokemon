MapCommand.Item = defineObject(UnitListCommand,
{
	_itemUse: null,
	_itemSelectMenu: null,
	_itemSelection: null,
	
	openCommand: function() {
		this._prepareCommandMemberData();
		this._completeCommandMemberData();
	},
	
	moveCommand: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (mode === ItemCommandMode.TOP) {
			result = this._moveTop();
		}
		else if (mode === ItemCommandMode.SELECTION) {
			result = this._moveSelection();
		}
		else if (mode === ItemCommandMode.USE) {
			result = this._moveUse();
		}
		
		return result;
	},
	
	drawCommand: function() {
		var mode = this.getCycleMode();
		
		if (mode === ItemCommandMode.TOP) {
			this._drawTop();
		}
		else if (mode === ItemCommandMode.SELECTION) {
			this._drawSelection();
		}
		else if (mode === ItemCommandMode.USE) {
			this._drawUse();
		}
	},
	
	isCommandDisplayable: function() {
		return true;
	},
	
	getCommandName: function() {
		return "Item/Pokemon";
	},
	
	isRepeatMoveAllowed: function() {
		return DataConfig.isUnitCommandMovable(RepeatMoveType.ITEM);
	},
	
	_prepareCommandMemberData: function() {
		this._itemUse = null;
		this._itemSelection = null;
		this._itemSelectMenu = createObject(ItemSelectMenu);
	},
	
	_completeCommandMemberData: function() {
		this._itemSelectMenu.setMenuTarget(globalUnit);
		this.changeCycleMode(ItemCommandMode.TOP);
	},
	
	_moveTop: function() {
		var item;
		var unit = globalUnit;
		var result = this._itemSelectMenu.moveWindowManager();
		
		if (result === ItemSelectMenuResult.USE) {
			item = this._itemSelectMenu.getSelectItem();
			this._itemSelection = ItemPackageControl.getItemSelectionObject(item);
			if (this._itemSelection !== null) {
				if (this._itemSelection.enterItemSelectionCycle(unit, item) === EnterResult.NOTENTER) {
					this._useItem();
					this.changeCycleMode(ItemCommandMode.USE);
				}
				else {
					this.changeCycleMode(ItemCommandMode.SELECTION);
				}
			}
		}
		else if (result === ItemSelectMenuResult.CANCEL) {
			// Rebuild the command. This is because the weapons equipped on the unit may have been changed or items may have been discarded.
			this.rebuildCommand();
			
			// If the item is discarded, it's supposed that action has occurred.
			if (this._itemSelectMenu.isDiscardAction()) {
				this.changeCycleMode(ItemCommandMode.TOP);
				return MoveResult.CONTINUE;
			}
			
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	_moveSelection: function() {
		if (this._itemSelection.moveItemSelectionCycle() !== MoveResult.CONTINUE) {
			if (this._itemSelection.isSelection()) {
				this._useItem();
				this.changeCycleMode(ItemCommandMode.USE);
			}
			else {
				this._itemSelectMenu.setMenuTarget(globalUnit);
				this.changeCycleMode(ItemCommandMode.TOP);
			}
		}
		
		return MoveResult.CONTINUE;
	},
	
	_moveUse: function() {
		if (this._itemUse.moveUseCycle() !== MoveResult.CONTINUE) {
			this.changeCycleMode(ItemCommandMode.TOP);
			return MoveResult.CONTINUE;
		}
		
		return MoveResult.CONTINUE;
	},
	
	_drawTop: function() {
		this._itemSelectMenu.drawWindowManager();
	},
	
	_drawSelection: function() {
		this._itemSelection.drawItemSelectionCycle();
	},
	
	_drawUse: function() {
		this._itemUse.drawUseCycle();
	},
	
	_useItem: function() {
		var itemTargetInfo;
		var item = this._itemSelectMenu.getSelectItem();
		
		this._itemUse = ItemPackageControl.getItemUseParent(item);
		itemTargetInfo = this._itemSelection.getResultItemTargetInfo();
		
		itemTargetInfo.unit = globalUnit;
		itemTargetInfo.item = item;
		itemTargetInfo.isPlayerSideCall = true;
		this._itemUse.enterUseCycle(itemTargetInfo);
	}
}
);


