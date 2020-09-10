PosAttackWindow.drawInfoBottom = function(xBase, yBase) {
		var x = xBase;
		var y = yBase + 90;
		var textui = this.getWindowTextUI();
		var color = ColorValue.KEYWORD;
		var font = textui.getFont();
		
		//StatusRenderer.drawAttackStatus(x, y, this._statusArray, color, font, 20);
	}

PosAttackWindow.setPosTarget = function(unit, item, targetUnit, targetItem, isSrc) {
		var isCalculation = false;
		if (item !== null && item.isWeapon()) {
			if (isSrc) {
				// If the player has launched an attack, the status can be obtained without conditions.
				this._statusArray = AttackChecker.getAttackStatusInternal(unit, item, targetUnit);
				isCalculation = true;
			}
			else {
				if (AttackChecker.isCounterattack(targetUnit, unit)) {
					this._statusArray = AttackChecker.getAttackStatusInternal(unit, item, targetUnit);
					isCalculation = true;
				}
				else {
					this._statusArray = AttackChecker.getNonStatus();	
				}
			}
		}
		else {
			this._statusArray = AttackChecker.getNonStatus();
		}
		
		
		var count = UnitItemControl.getPossessionItemCount(unit);


		for(i = 0; i < count; i++) {
			var curr = UnitItemControl.getItem(unit, i);
			if(curr.custom.pokemon){
				this.setPosInfo(unit, curr, isSrc);	
				break;	
			}
		}
		
		//var attackCount = unit.custom.count
		this._roundAttackCount = 0;
	}

PosAttackWindow.drawInfo = function(xBase, yBase) {
		var textui, color, font, pic, x, y, text;
		
		PosBaseWindow.drawInfo.call(this, xBase, yBase);
		
		textui = root.queryTextUI('attacknumber_title');
		color = textui.getColor();
		font = textui.getFont();
		pic = textui.getUIImage();
		x = xBase + 10;
		y = yBase + this.getWindowHeight() - 40;
		text = StringTable.AttackMenu_AttackCount + StringTable.SignWord_Multiple + this._roundAttackCount;
		//TextRenderer.drawFixedTitleText(x, y, text, color, font, TextFormat.CENTER, pic, 4);
	}


WeaponSelectMenu._isWeaponAllowed = function(unit, item) {
		var indexArray;

		
		if (!ItemControl.isWeaponAvailable(unit, item)) {
			return false;
		}

		if (!item.custom.pokemon) {
			return false;
		}

		if (ItemControl.getEquippedWeapon(unit) != item) {
			return false;
		}

		
	
		indexArray = AttackChecker.getAttackIndexArray(unit, item, true);
		
		return indexArray.length !== 0;
	}

StringTable.AttackMenu_AttackCount = "Action Count "


UIBattleLayout._drawLevel = function(unit, isRight) {
	textui = root.queryTextUI('support_title');
	color = textui.getColor();
	font = textui.getFont();
	pic = textui.getUIImage();


	var dx = this._getIntervalX();
		
		if (isRight) {
			x = 407 + dx;
			y = 340;
		}
		else {
			x = 115 + dx;
			y = 340;
		}
		
	text = "Lv. " + unit.getLv();
	TextRenderer.drawFixedTitleText(x, y, text, color, font, TextFormat.CENTER, pic, 2);

}

UIBattleLayout._drawMain = function() {
		var battler;
		var rightUnit = this._battlerRight.getUnit();
		var leftUnit = this._battlerLeft.getUnit();
		var xScroll = this._realBattle.getAutoScroll().getScrollX();
		var yScroll = 0;
		
		this._drawBackground(xScroll, yScroll);
		
		this._drawColor(EffectRangeType.MAP);
		
		battler = this._realBattle.getActiveBattler();
		if (battler === this._battlerRight) {
			this._drawBattler(xScroll, yScroll, this._battlerLeft, true);
			this._drawColor(EffectRangeType.MAPANDCHAR);
			this._drawBattler(xScroll, yScroll, this._battlerRight, true);
		}
		else {
			this._drawBattler(xScroll, yScroll, this._battlerRight, true);
			this._drawColor(EffectRangeType.MAPANDCHAR);
			this._drawBattler(xScroll, yScroll, this._battlerLeft, true);
		}
		
		this._drawCustomPicture(xScroll, yScroll);
		
		this._drawColor(EffectRangeType.ALL);
		
		this._drawEffect(xScroll, yScroll, false);
		
		this._drawFrame(true);
		this._drawFrame(false);
		
		this._drawNameArea(rightUnit, true);
		this._drawNameArea(leftUnit, false);
		
		this._drawWeaponArea(rightUnit, true);
		this._drawWeaponArea(leftUnit, false);
		
		this._drawFaceArea(rightUnit, true);
		this._drawFaceArea(leftUnit, false);
		
		this._drawInfoArea(rightUnit, true);
		this._drawInfoArea(leftUnit, false);
		
		this._drawHpArea(rightUnit, true);
		this._drawHpArea(leftUnit, false);
		
		this._drawEffect(xScroll, yScroll, true);

		this._drawLevel(rightUnit, true);
		this._drawLevel(leftUnit, false);

		this._drawStatusIcon(rightUnit, true);
		this._drawStatusIcon(leftUnit, false);
	}

UIBattleLayout._getAttackStatus = function(unit, targetUnit, isSrc) {
		var arr, isCounterattack;
		
		if (isSrc) {
			if(!ItemControl.getEquippedWeapon(unit).custom.paralyze && this._mode == 0) {
				arr = AttackChecker.getAttackStatusInternal(unit, BattlerChecker.getRealBattleWeapon(unit), targetUnit);
			}
			else {
				arr = AttackChecker.getNonStatus();
			}
		}
		else {
			isCounterattack = this._realBattle.getAttackInfo().isCounterattack;
			if (isCounterattack && this._mode == 0) {
				arr = AttackChecker.getAttackStatusInternal(targetUnit, BattlerChecker.getRealBattleWeapon(targetUnit), unit);
			}
			else {
				arr = AttackChecker.getNonStatus();
			}
		}
		
		return arr;
	}

UIBattleLayout._drawStatusIcon = function(unit, isRight) {
	if(StateControl.getTurnStatePersist(unit) != null) {
		state = StateControl.getTurnStatePersist(unit);
		graphicsHandle = state.getIconResourceHandle();
		var dx = this._getIntervalX();

		if(isRight) {
			x = 470 + dx;
			y = 385;
			GraphicsRenderer.drawImage(x, y, graphicsHandle, GraphicsType.ICON);
		}
		else {
			x = 130 + dx;
			y = 385;
			GraphicsRenderer.drawImage(x, y, graphicsHandle, GraphicsType.ICON);
		}

	}
}

ItemListScrollbar.drawScrollContent = function(x, y, object, isSelect, index) {
		var isAvailable, color;
		var textui = this.getParentTextUI();
		var font = textui.getFont();
		
		if (object === null) {
			return;
		}
		
		if (this._availableArray !== null) {
			isAvailable = this._availableArray[index];
		}
		else {
			isAvailable = true;
		}
		color = this._getTextColor(object, isSelect, index);
		
		if(!object.custom.paralyze) {
			if (isAvailable) {
				ItemRenderer.drawItem(x, y, object, color, font, true);
			}
			else {
				// Draw it tinted if items cannot be used.
				ItemRenderer.drawItemAlpha(x, y, object, color, font, true, 120);
			}
		}
	}


BaseItemSelection.getResultItemTargetInfo = function() {
		var itemTargetInfo = StructureBuilder.buildItemTargetInfo();
		
		// The caller sets the unit and the item.
		if(!inBattle) {
			itemTargetInfo.targetUnit = this._targetUnit;
			itemTargetInfo.targetPos = this._targetPos;
			itemTargetInfo.targetClass = this._targetClass;
			itemTargetInfo.targetItem = this._targetItem;
			itemTargetInfo.targetMetamorphoze = this._targetMetamorphoze;
		}
		else {
			this._targetPos = createPos(450, 250);
			itemTargetInfo.targetUnit = playerPokemon;
			itemTargetInfo.targetPos = this._targetPos;
			itemTargetInfo.targetClass = playerPokemon.getClass();
			itemTargetInfo.targetItem = this._targetItem;
			itemTargetInfo.targetMetamorphoze = this._targetMetamorphoze;
		}
		
		return itemTargetInfo;
	}


UnitCommand.Item.isCommandDisplayable = function() {
	return true;
}


UnitCommand.Item._completeCommandMemberData = function() {
		this._itemSelectMenu.setMenuTarget(globalUnit);
		this.changeCycleMode(ItemCommandMode.TOP);
}


UnitCommand.Item._moveTop = function() {
		var item;
		var unit = globalUnit;
		var result = this._itemSelectMenu.moveWindowManager();
		
		if (result === ItemSelectMenuResult.USE) {
			item = this._itemSelectMenu.getSelectItem();
			this._itemSelection = ItemPackageControl.getItemSelectionObject(item);
			if (this._itemSelection !== null) {
				if(!inBattle) {
					if (this._itemSelection.enterItemSelectionCycle(unit, item) === EnterResult.NOTENTER) {
						this._useItem();
						this.changeCycleMode(ItemCommandMode.USE);
					}
					else {
						this.changeCycleMode(ItemCommandMode.SELECTION);
					}
				}
				else {
					this._useItem();
					this.changeCycleMode(ItemCommandMode.USE);
				}
			}
		}
		else if (result === ItemSelectMenuResult.CANCEL) {
			// Rebuild the command. This is because the weapons equipped on the unit may have been changed or items may have been discarded.
			this.rebuildCommand();
			
			// If the item is discarded, it's supposed that action has occurred.
			if (this._itemSelectMenu.isDiscardAction()) {
				this.endCommandAction();
			}
			
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	}

UnitCommand.Item._moveSelection = function() {
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
	}

UnitCommand.Item._moveUse = function() {
		if (this._itemUse.moveUseCycle() !== MoveResult.CONTINUE) {
			this.endCommandAction();
			if(inBattle && !caught) {
				this._realBattleModeChanger();
			}
			if(caught) {
				this._realBattle = this._listCommandManager.getParentObject();
				this._realBattle.changeCycleMode(RealBattleMode.RUN)
			}
			caught = false;
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	}


UnitCommand.Item._realBattleModeChanger = function() {
				swap = true;	
				this._realBattle = this._listCommandManager.getParentObject();

				var targetUnit = playerPokemon;
				var enemyUnit = enemyPokemon;

				var parawpn = UnitItemControl.getParalyzeWeapon(targetUnit)
				ItemControl.setEquippedWeapon(targetUnit, parawpn);
				swap = true;


				enemyWpn = UnitItemControl.getItem(enemyUnit, this._seed);

				if(!ItemControl.isWeaponAvailable(enemyUnit,enemyWpn)) {
					while(!ItemControl.isWeaponAvailable(enemyUnit,enemyWpn)) {
						this._realBattle._seed = Math.floor(Math.random() * 4);
						enemyWpn = UnitItemControl.getItem(enemyUnit, this._seed);
					}
					ItemControl.setEquippedWeapon(enemyUnit, enemyWpn);
				}
				else {
					ItemControl.setEquippedWeapon(enemyUnit, enemyWpn);
				}



				if(StateControl.getTurnStatePersist(enemyUnit) != null) {
					state = StateControl.getTurnStatePersist(enemyUnit);
					if(state.custom.paralyze){
						var chance = Math.floor(Math.random()*100)

						if(chance < 25) {
							var parawpn = UnitItemControl.getParalyzeWeapon(enemyUnit)
							ItemControl.setEquippedWeapon(enemyUnit, parawpn);
						}
					}
				}



				var activeSpd = ParamBonus.getMov(targetUnit);
				var passiveSpd = ParamBonus.getMov(enemyUnit);

				if(StateControl.getTurnStatePersist(targetUnit) != null){
					state = StateControl.getTurnStatePersist(targetUnit) 
					if(state.custom.paralyze) {
						activeSpd = Math.floor(activeSpd/2);
					}
				}

				if(StateControl.getTurnStatePersist(enemyUnit) != null){
					state = StateControl.getTurnStatePersist(enemyUnit) 
					if(state.custom.paralyze) {
						passiveSpd = Math.floor(passiveSpd/2);
					}
				}

				if(activeSpd >= passiveSpd) { 
					reverse = false
					this._realBattle._bigAttackParam = StructureBuilder.buildAttackParam();
					this._realBattle._bigAttackParam.unit = targetUnit;
					this._realBattle._bigAttackParam.targetUnit = enemyUnit; 
				}
				else if(activeSpd < passiveSpd) { 
					reverse = true;
					this._realBattle._bigAttackParam = StructureBuilder.buildAttackParam();
					this._realBattle._bigAttackParam.targetUnit = targetUnit;
					this._realBattle._bigAttackParam.unit = enemyUnit;
				}	
			
		
				
				this._realBattle._bigAttackParam.attackStartType = AttackStartType.NORMAL;

				BattlerChecker.setUnit(this._realBattle._bigAttackParam.unit, this._realBattle._bigAttackParam.targetUnit);
				
				var infoBuilder = createObject(NormalAttackInfoBuilder);
				var orderBuilder = createObject(NormalAttackOrderBuilder);
				var attackInfo = infoBuilder.createAttackInfo(this._realBattle._bigAttackParam);
				var attackOrder = orderBuilder.createAttackOrder(attackInfo);

				
			
				this._realBattle._attackFlow.setAttackInfoAndOrder(attackInfo, attackOrder, this._realBattle._parentCoreAttack);
				
				this._realBattle._order = this._realBattle._attackFlow.getAttackOrder();
				this._realBattle._attackInfo = this._realBattle._attackFlow.getAttackInfo();
				this._realBattle._resetBattleMemberData(this._realBattle._parentCoreAttack);


				this._realBattle._criticalActive = false;
				this._realBattle._ineffectiveActive = false;
				this._realBattle._effectiveActive = false;

				this._realBattle._criticalPassive = false;
				this._realBattle._ineffectivePassive = false;
				this._realBattle._effectivePassive = false;

				
				if(this._realBattle._lock) {
					this._realBattle._lock = false;
					this._realBattle.changeCycleMode(RealBattleMode.BATTLESTART)
					return MoveResult.CONTINUE;
				}
				

				this._realBattle._processModeActionStart();
}

UnitCommand.Item._useItem = function() {
		var itemTargetInfo;
		var item = this._itemSelectMenu.getSelectItem();
		
		this._itemUse = ItemPackageControl.getItemUseParent(item);
		itemTargetInfo = this._itemSelection.getResultItemTargetInfo();
		
		itemTargetInfo.unit = globalUnit;
		itemTargetInfo.item = item;
		itemTargetInfo.isPlayerSideCall = true;
		this._itemUse.enterUseCycle(itemTargetInfo);
	}

UnitCommand.Item.getCommandName = function() {
	if(inBattle) {
		return "Item"
	}
	else {
		return "Item/Pokemon"
	}
}



UnitCommand.Trade.isCommandDisplayable = function() {
	return false
}

UnitCommand.Wait.isCommandDisplayable = function() {
	var unit = this.getCommandTarget();
	return !unit.custom.pokemon
}


UnitCommand.Attack.isCommandDisplayable = function() {
	var unit = this.getCommandTarget();
	return !unit.custom.pokemon&&AttackChecker.isUnitAttackable(this.getCommandTarget());
}



UnitCommand.Fight = defineObject(UnitListCommand,
{	
	_realBattle: null,
	openCommand: function() {
		this._realBattle = this._listCommandManager.getParentObject();
		this._realBattle.changeCycleMode(RealBattleMode.WEAPONSELECT)
	},
	
	moveCommand: function() {
		return false;
	},
	
	drawCommand: function() {
	},
	
	isCommandDisplayable: function() {
		var unit = this.getCommandTarget();
		return unit.custom.pokemon
	},
	
	getCommandName: function() {
		return "Fight";
	},
	
	isRepeatMoveAllowed: function() {
		return false;
	}
}
);

UnitCommand.Pokemon = defineObject(UnitListCommand,
{	
	_realBattle: null,
	openCommand: function() {
		this._realBattle = this._listCommandManager.getParentObject();
		this._realBattle.changeCycleMode(RealBattleMode.POKEMONSELECT)
	},
	
	moveCommand: function() {
		return false;
	},
	
	drawCommand: function() {
	},
	
	isCommandDisplayable: function() {
		var unit = this.getCommandTarget();
		return unit.custom.pokemon
	},
	
	getCommandName: function() {
		return "Pokemon";
	},
	
	isRepeatMoveAllowed: function() {
		return false;
	}
}
);

UnitCommand.Run = defineObject(UnitListCommand,
{	
	_realBattle: null,
	openCommand: function() {
		this._realBattle = this._listCommandManager.getParentObject();
		this._realBattle.changeCycleMode(RealBattleMode.RUN)
	},
	
	moveCommand: function() {
		return false;
	},
	
	drawCommand: function() {
	},
	
	isCommandDisplayable: function() {
		var unit = this.getCommandTarget();
		return unit.custom.pokemon && isWild
	},
	
	getCommandName: function() {
		return "Run";
	},
	
	isRepeatMoveAllowed: function() {
		return false;
	}
}
);

UnitCommand.configureCommands = function(groupArray) {
		this._appendTalkEvent(groupArray);
		groupArray.appendObject(UnitCommand.Attack);
		groupArray.appendObject(UnitCommand.PlaceCommand);
		groupArray.appendObject(UnitCommand.Occupation);
		groupArray.appendObject(UnitCommand.Treasure);
		groupArray.appendObject(UnitCommand.Village);
		groupArray.appendObject(UnitCommand.Shop);
		groupArray.appendObject(UnitCommand.Gate);
		this._appendUnitEvent(groupArray);
		groupArray.appendObject(UnitCommand.Quick);
		groupArray.appendObject(UnitCommand.Steal);
		groupArray.appendObject(UnitCommand.Wand);
		groupArray.appendObject(UnitCommand.Information);
		this._appendMetamorphozeCommand(groupArray);
		this._appendFusionCommand(groupArray);
		groupArray.appendObject(UnitCommand.Trade);
		groupArray.appendObject(UnitCommand.Stock);
		groupArray.appendObject(UnitCommand.MetamorphozeCancel);
		groupArray.appendObject(UnitCommand.Wait);
		groupArray.appendObject(UnitCommand.Fight);
		groupArray.appendObject(UnitCommand.Item);
		groupArray.appendObject(UnitCommand.Pokemon);
		groupArray.appendObject(UnitCommand.Run);
	}

BaseListCommandManager.setParentObject = function(realBattle) {
	this._realBattle = realBattle;
}

BaseListCommandManager.getParentObject = function() {
	return this._realBattle;
}

ItemControl.isWeaponAvailable = function(unit, item) {
		if (item === null) {
			return false;
		}
		
		// If item is not weapon, cannot equip.
		if (!item.isWeapon()) {
			return false;
		}
		
		// Check "Weapon Level".
		if (!this._isWeaponLevel(unit, item)) {
			return false;
		}
		
		// Check if "Fighters" etc. are matched.
		if (!this._compareTemplateAndCategory(unit, item)) {
			return false;
		}
		
		// Check if it's included in the list of class, "Equipable Weapons".
		if (!this.isWeaponTypeAllowed(unit.getClass().getEquipmentWeaponTypeReferenceList(), item)) {
			return false;
		}
		
		// Check "Users".
		if (!this.isOnlyData(unit, item)) {
			return false;
		}
		
		if (item.getWeaponCategoryType() === WeaponCategoryType.MAGIC) {
			// Check if "Magic attack" is prohibited.
			if (StateControl.isBadStateFlag(unit, BadStateFlag.MAGIC)) {
				return false;
			}
		}
		else {
			// Check if "Physical attack" is prohibited.
			if (StateControl.isBadStateFlag(unit, BadStateFlag.PHYSICS)) {
				return false;
			}
		}

		var list = PlayerList.getSortieList();
		var count = list.getCount();
		var pkmName = item.getName();

		for(i = 0; i < count; i++) {
			punit = list.getData(i);

			if(punit.getName() === pkmName){
				if(punit.getHp() == 0) {
					return false;
				}
			}
		}
		
	
		return true;
	}

