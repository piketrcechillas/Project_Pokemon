UnitCommand.getPositionX = function() {
		var width = this.getCommandScrollbar().getScrollbarWidth();
		return 400;
}


UnitCommand.getPositionY = function() {
		var height = this.getCommandScrollbar().getScrollbarHeight();
		return 100;
	}
	
UnitCommand.Item.getPositionX = function() {
		var width = this.getCommandScrollbar().getScrollbarWidth();
		return 350;
}





StateRecoveryItemUse.getItemAnimePos = function(itemUseParent, animeData) {
	if(!inBattle) {
		return this.getUnitBasePos(itemUseParent, animeData);
	}
	else {
		x = 450
		y = 250
		pos = LayoutControl.getMapAnimationPos(x, y, animeData);
		return pos;
	}
}


RecoveryItemUse.getItemAnimePos = function(itemUseParent, animeData) {
	if(!inBattle) {
		return null;
	}
	else {
		x = 450
		y = 250
		pos = LayoutControl.getMapAnimationPos(x, y, animeData);
		return pos;
	}
}


RecoveryItemUse.enterMainUseCycle = function(itemUseParent) {
		var generator;
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var recoveryInfo = itemTargetInfo.item.getRecoveryInfo();
		var type = itemTargetInfo.item.getRangeType();
		var plus = Calculator.calculateRecoveryItemPlus(itemTargetInfo.unit, itemTargetInfo.targetUnit, itemTargetInfo.item);
		
		this._dynamicEvent = createObject(DynamicEvent);
		generator = this._dynamicEvent.acquireEventGenerator();
		
		if (type !== SelectionRangeType.SELFONLY) {
			generator.locationFocus(itemTargetInfo.targetUnit.getMapX(), itemTargetInfo.targetUnit.getMapY(), true);
		}
		
		if(!inBattle) {
			generator.hpRecovery(itemTargetInfo.targetUnit, this._getItemRecoveryAnime(itemTargetInfo),
				recoveryInfo.getRecoveryValue() + plus, recoveryInfo.getRecoveryType(), itemUseParent.isItemSkipMode());
		}
		else {
			generator.hpRecovery(itemTargetInfo.targetUnit, this._getItemRecoveryAnime(itemTargetInfo),
				recoveryInfo.getRecoveryValue() + plus, recoveryInfo.getRecoveryType(), true);
		}
		
		return this._dynamicEvent.executeDynamicEvent();
	}


ItemTitleFlowEntry.drawFlowEntry = function() {
		var x, y;
		var itemTargetInfo = this._itemUseParent.getItemTargetInfo();
		var textui = root.queryTextUI('itemuse_title');
		var color = textui.getColor();
		var font = textui.getFont();
		var pic = textui.getUIImage();
		var text = itemTargetInfo.item.getName();
		var width = (TitleRenderer.getTitlePartsCount(text, font) + 2) * TitleRenderer.getTitlePartsWidth();
		
		if(!inBattle) {
			x = LayoutControl.getUnitCenterX(itemTargetInfo.unit, width, 0);
			y = LayoutControl.getUnitBaseY(itemTargetInfo.unit, TitleRenderer.getTitlePartsHeight()) - 20;
		}
		else {
			x = 390
			y = 300
		}
		
		TextRenderer.drawTitleText(x, y, text, color, font, TextFormat.CENTER, pic);
	}
