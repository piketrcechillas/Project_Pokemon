RealBattle._mainUnit = null;

RealBattle._bigAttackParam = null;
RealBattle._init = false;
RealBattle._seed = 0;

RealBattle._criticalActive = false;
RealBattle._ineffectiveActive = false;
RealBattle._effectiveActive = false;

RealBattle._criticalPassive = false;
RealBattle._ineffectivePassive = false;
RealBattle._effectivePassive = false;

RealBattle._unitCommandManager = null;


RealBattle._weaponSelectMenu = null;

RealBattle._pokemonSelectMenu = null;

RealBattle._lock = false;

RealBattle._killingUnit = null;
RealBattle._dyingUnit = null;


activeFlag = false;
passiveFlag = false;

activeState = null;
passiveState = null;

UIBattleLayout._mode = 0;
var reverse = false;

BaseListCommandManager._realBattle = null;
UnitCommand._realBattle = null;

var trainer = null;
var enemyTrainer = null;

var swap = false;



var MidCombatWeaponSelectMenu = defineObject(WeaponSelectMenu,
{
	_enemyUnit: null,	
	_enemyX: 0,			
	_enemyY: 0,			
	_weapon:null,		
	_noEquipMessageWindow:null,	
	_availableArray: null,

	setMenuUnitAndTarget: function(unit, enemyUnit, enemyX, enemyY, enemyWeapon) {

		this._enemyUnit = enemyUnit;
		this._enemyX = enemyX;
		this._enemyY = enemyY;
		this._weapon = enemyWeapon;
		this.setMenuTarget(unit);
	},
	
	drawWindowManager: function() {
		WeaponSelectMenu.drawWindowManager.call(this);

		var mapInfo = root.getCurrentSession().getCurrentMapInfo();
		posWidth = mapInfo.getMapWidth();
		posHeight = mapInfo.getMapHeight();

		var x = this.getPositionWindowX();
		var y = this.getPositionWindowY();
		var height = this._itemListWindow.getWindowHeight() + this._itemInfoWindow.getWindowHeight();
		
	},

	_setWeaponbar: function(unit) {
		var i, item;
		var count = UnitItemControl.getPossessionItemCount(unit);
		var scrollbar = this._itemListWindow.getItemScrollbar();
		var waitIndex = 0;
		
		scrollbar.resetScrollData();
		
		for (i = 0; i < count; i++) {
			item = UnitItemControl.getItem(unit, i);
			if (this._isWeaponAllowed(unit, item) && !item.custom.paralyze) {
				scrollbar.objectSet(item);
			}
			if(item.custom.paralyze){
				waitIndex = i;
			}
		}
		
		scrollbar.objectSetEnd();
	},

	getPositionWindowX: function() {
		var width = this.getTotalWindowWidth();
		return 375;
	},
	
	_isWeaponAllowed: function(unit, item) {
		if (!ItemControl.isWeaponAvailable(unit, item)) {
			return false;
		}

		if(item.custom.paralyze) {
			return false;
		}

		if(unit.custom.tempCount == 0 && !item.custom.wait) {
			return false;
		}
		
		if(unit.custom.pokemon) {
			var result = AttackChecker.isCounterAttackableWeapon(this._weapon, this._enemyX, this._enemyY, unit, item, this._enemyUnit);
			return result;
		}
		else {
			if(item.custom.pokemon) {
				return true;
			}
			else {
				return false;
			}
		}
	}
}
);



var MidCombatPokemonSelectMenu = defineObject(WeaponSelectMenu,
{
	_enemyUnit: null,	
	_enemyX: 0,			
	_enemyY: 0,			
	_weapon:null,		
	_noEquipMessageWindow:null,	
	_availableArray: null,

	setMenuUnitAndTarget: function(unit, enemyUnit, enemyX, enemyY, enemyWeapon) {

		this._enemyUnit = enemyUnit;
		this._enemyX = enemyX;
		this._enemyY = enemyY;
		this._weapon = enemyWeapon;
		this.setMenuTarget(unit);
	},
	
	drawWindowManager: function() {
		WeaponSelectMenu.drawWindowManager.call(this);

		var mapInfo = root.getCurrentSession().getCurrentMapInfo();
		posWidth = mapInfo.getMapWidth();
		posHeight = mapInfo.getMapHeight();

		var x = 800;
		var y = this.getPositionWindowY();
		var height = this._itemListWindow.getWindowHeight() + this._itemInfoWindow.getWindowHeight();
		
	},

	_setWeaponbar: function(unit) {
		var i, item;
		var count = UnitItemControl.getPossessionItemCount(unit);
		var scrollbar = this._itemListWindow.getItemScrollbar();
		var waitIndex = 0;
		
		scrollbar.resetScrollData();
		
		for (i = 0; i < count; i++) {
			item = UnitItemControl.getItem(unit, i);
			if (this._isWeaponAllowed(unit, item) && !item.custom.paralyze) {
				scrollbar.objectSet(item);
			}
			if(item.custom.paralyze){
				waitIndex = i;
			}
		}
		
		scrollbar.objectSetEnd();
	},
	
	_isWeaponAllowed: function(unit, item) {

		if (!ItemControl.isWeaponAvailable(unit, item)) {
			return false;
		}
		


		if(item.custom.pokemon) {
			if(ItemControl.getEquippedWeapon(unit) != item)
				return true;
			else if(unit.custom.emergency)
				return true;
			else 
				return false;
			}

		else {
			return false;
			}
		}

}
);


AttackChecker.isCounterAttackableWeapon= function(enemyWeapon, unitx, unity, counterUnit, counterWeapon, enemyUnit) {
		var indexArray;
		
		if (!Calculator.isCounterattackAllowed(enemyUnit, counterUnit)) {
			return false;
		}
		
		if (enemyWeapon !== null && enemyWeapon.isOneSide()) {
			return false;
		}
		
		if (counterWeapon === null) {
			return false;
		}
		
		if (counterWeapon.isOneSide()) {
			return false;
		}
		
		indexArray = IndexArray.createIndexArray(counterUnit.getMapX(), counterUnit.getMapY(), counterWeapon);
		
		var result = IndexArray.findPos(indexArray, unitx, unity);
		return result;
};



RealBattle._moveBattle = function() {
		this._checkBattleContinue();
	
		return MoveResult.CONTINUE;
	}

RealBattle._moveBattleStart = function() {
		if (this._battleTable.moveBattleStart() !== MoveResult.CONTINUE) {


			if (!this._attackFlow.validBattle()) {
				// If the battle cannot start, immediately end.
				this._processModeBattleEnd();
				return MoveResult.CONTINUE;
			}
			
			if(!this._init){
				if(!isWild) {
					var generator = root.getEventGenerator();
					var message = "PKMN Trainer " + trainerName + " wants to battle!";
					generator.messageTerop(message, 2, true)

	
					var message2 = "Let's win this, " + this._order.getActiveUnit().getName() + "!";
					generator.messageTerop(message2, 2, true)
					generator.execute();
					this._init = true;
				}
				else {
					var generator = root.getEventGenerator();
					var message = "A wild " + this._order.getPassiveUnit().getName() + " appears!";
					generator.messageTerop(message, 2, true)

					var message2 = "Let's win this, " + this._order.getActiveUnit().getName() + "!";
					generator.messageTerop(message2, 2, true)
					generator.execute();
					this._init = true;
				}
			}
			else {
				var generator = root.getEventGenerator();
				var message = "What will you do?";
				generator.messageTerop(message, 2, true)
				generator.execute();
			}

			this._weaponSelectMenu = createObject(MidCombatWeaponSelectMenu);
			this._pokemonSelectMenu = createObject(MidCombatPokemonSelectMenu);


			var turnType = root.getCurrentSession().getTurnType()
			var unit, targetUnit
			if(!reverse){
				unit = this._order.getActiveUnit();
				targetUnit = this._order.getPassiveUnit();}
			else {
				unit = this._order.getPassiveUnit();
				targetUnit = this._order.getActiveUnit();}

			this._mainUnit = unit;

			this._unitCommandManager = createObject(UnitCommand);
			this._unitCommandManager.setListCommandUnit(unit);
			this._unitCommandManager._commandScrollbar = createScrollbarObject(ListCommandScrollbar, this);
			this._unitCommandManager._commandScrollbar.setActive(true);
			this._unitCommandManager.rebuildCommand();
			this._unitCommandManager._playCommandOpenSound();
			this._unitCommandManager.setParentObject(this);

			this._weaponSelectMenu.setMenuUnitAndTarget(unit, targetUnit, targetUnit.getMapX(), targetUnit.getMapY(), ItemControl.getEquippedWeapon(unit));
			this._pokemonSelectMenu.setMenuUnitAndTarget(trainer, enemyTrainer,  enemyTrainer.getMapX(),  enemyTrainer.getMapY(), ItemControl.getEquippedWeapon(enemyTrainer));
			this.changeCycleMode(RealBattleMode.COMMAND);

		
		}
		
		return MoveResult.CONTINUE;
	}

RealBattle._moveWeaponSelect= function() {
		var weapon, filter, indexArray;

		var turnType = root.getCurrentSession().getTurnType()
		var targetUnit;

		if(!reverse) {
			targetUnit = this._order.getActiveUnit();
			enemyUnit = this._order.getPassiveUnit()
		}
		else {
			targetUnit = this._order.getPassiveUnit();
			enemyUnit = this._order.getActiveUnit();
		}



		var input = this._weaponSelectMenu.moveWindowManager();
		
		if (input === ScrollbarInput.SELECT) {
				this._uiBattleLayout._mode = 0;
				weapon = this._weaponSelectMenu.getSelectWeapon();

				filter = FilterControl.getReverseFilter(targetUnit.getUnitType());
				
				ItemControl.setEquippedWeapon(targetUnit, weapon);

				enemyWpn = UnitItemControl.getItem(enemyUnit, this._seed);

				if(!ItemControl.isWeaponAvailable(enemyUnit,enemyWpn)) {
					while(!ItemControl.isWeaponAvailable(enemyUnit,enemyWpn)) {
						this._seed = Math.floor(Math.random() * 4);
						enemyWpn = UnitItemControl.getItem(enemyUnit, this._seed);
					}
					ItemControl.setEquippedWeapon(enemyUnit, enemyWpn);
				}
				else {
					ItemControl.setEquippedWeapon(enemyUnit, enemyWpn);
				}

				if(StateControl.getTurnStatePersist(targetUnit) != null) {
					state = StateControl.getTurnStatePersist(targetUnit);
					if(state.custom.paralyze){
						var chance = Math.floor(Math.random()*100)

						if(chance < 25) {
							var parawpn = UnitItemControl.getParalyzeWeapon(targetUnit)
							ItemControl.setEquippedWeapon(targetUnit, parawpn);
						}
					}
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


				

				if(turnType == TurnType.ENEMY && this._order.getActiveUnit().custom.tempCount == 0) {
					var count = UnitItemControl.getPossessionItemCount(this._order.getActiveUnit());
	
		
					for (i = 0; i < count; i++) {
						item = UnitItemControl.getItem(this._order.getActiveUnit(), i);
						if (item.custom.wait) {
							ItemControl.setEquippedWeapon(this._order.getActiveUnit(), item);
							break;
						}
					}
				}

				var activeSpd = ParamBonus.getMov(this._order.getActiveUnit());
				var passiveSpd = ParamBonus.getMov(this._order.getPassiveUnit());

				if(StateControl.getTurnStatePersist(this._order.getActiveUnit()) != null){
					state = StateControl.getTurnStatePersist(this._order.getActiveUnit()) 
					if(state.custom.paralyze) {
						activeSpd = Math.floor(activeSpd/2);
					}
				}

				if(StateControl.getTurnStatePersist(this._order.getPassiveUnit()) != null){
					state = StateControl.getTurnStatePersist(this._order.getPassiveUnit()) 
					if(state.custom.paralyze) {
						passiveSpd = Math.floor(passiveSpd/2);
					}
				}
					
					root.log("Item?:" + ItemControl.getEquippedWeapon(this._order.getActiveUnit()).getName())

				

				if(activeSpd >= passiveSpd) { 
					this._bigAttackParam = StructureBuilder.buildAttackParam();
					this._bigAttackParam.unit = this._order.getActiveUnit();
					this._bigAttackParam.targetUnit = this._order.getPassiveUnit(); 
				}
				else if(activeSpd < passiveSpd) { 
					this._bigAttackParam = StructureBuilder.buildAttackParam();
					this._bigAttackParam.targetUnit = this._order.getActiveUnit();
					this._bigAttackParam.unit = this._order.getPassiveUnit();
					reverse = !reverse;
					var temp = activeFlag;
					activeFlag = passiveFlag;
					passiveFlag = temp;
				}	
			
		
				
				this._bigAttackParam.attackStartType = AttackStartType.NORMAL;

				BattlerChecker.setUnit(this._bigAttackParam.unit, this._bigAttackParam.targetUnit);

				
				var infoBuilder = createObject(NormalAttackInfoBuilder);
				var orderBuilder = createObject(NormalAttackOrderBuilder);
				var attackInfo = infoBuilder.createAttackInfo(this._bigAttackParam);
				var attackOrder = orderBuilder.createAttackOrder(attackInfo);

				
			
				this._attackFlow.setAttackInfoAndOrder(attackInfo, attackOrder, this._parentCoreAttack);
				
				this._order = this._attackFlow.getAttackOrder();
				this._attackInfo = this._attackFlow.getAttackInfo();
				this._resetBattleMemberData(this._parentCoreAttack);
				
				var magRight = AttributeControl.calculateMagnification(this._order.getActiveUnit(), this._order.getPassiveUnit());
				var magLeft = AttributeControl.calculateMagnification(this._order.getPassiveUnit(), this._order.getActiveUnit());

				if(magRight<1) {
					this._ineffectiveActive = true;
				}
				else if(magRight>1) {
					this._effectiveActive = true;
				}

				if(magLeft<1) {
					this._ineffectivePassive = true;
				}
				else if(magLeft>1) {
					this._effectivePassive = true;
				}


				
				this._processModeActionStart();

		}

		if(input == ScrollbarInput.CANCEL) {

				this.changeCycleMode(RealBattleMode.COMMAND);
			
		}
		
		return MoveResult.CONTINUE;
}


RealBattle._movePokemonSelect= function() {
		var weapon, filter, indexArray;
		var targetUnit, enemyUnit, oldUnit

		if(!reverse) {
			enemyUnit = this._order.getPassiveUnit()
			oldUnit = this._order.getActiveUnit();
		}
		else {
			oldUnit = this._order.getPassiveUnit()
			enemyUnit = this._order.getActiveUnit();
		}

		if(this._lock) {
			oldUnit = this._dyingUnit;
			enemyUnit = this._killingUnit;
		}

		var input = this._pokemonSelectMenu.moveWindowManager();
		
		if (input === ScrollbarInput.SELECT) {

				trainer.custom.emergency = false
				this._uiBattleLayout._mode = 0;
				weapon = this._pokemonSelectMenu.getSelectWeapon();

				ItemControl.setEquippedWeapon(trainer, weapon);

				root.log("CURRENT PKM:" + ItemControl.getEquippedWeapon(trainer).getName())

				var pkmName = weapon.getName();

				root.log("Pokemon's Name:" + pkmName)

				var list = PlayerList.getSortieList();
				var count = list.getCount();
				
				for(i = 0; i < count; i++) {
					unit = list.getData(i);
					if(unit.getName() === pkmName){
						targetUnit = unit;
					}
				}

				this._mainUnit = targetUnit;

				targetUnit.setMapX(trainer.getMapX());
				targetUnit.setMapY(trainer.getMapY());
				playerPokemon = targetUnit;



				var parawpn = UnitItemControl.getParalyzeWeapon(targetUnit)
				ItemControl.setEquippedWeapon(targetUnit, parawpn);
				swap = true;


				enemyWpn = UnitItemControl.getItem(enemyUnit, this._seed);

				if(!ItemControl.isWeaponAvailable(enemyUnit,enemyWpn)) {
					while(!ItemControl.isWeaponAvailable(enemyUnit,enemyWpn)) {
						this._seed = Math.floor(Math.random() * 4);
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
					this._bigAttackParam = StructureBuilder.buildAttackParam();
					this._bigAttackParam.unit = targetUnit;
					this._bigAttackParam.targetUnit = enemyUnit; 
				}
				else if(activeSpd < passiveSpd) { 
					reverse = true;
					this._bigAttackParam = StructureBuilder.buildAttackParam();
					this._bigAttackParam.targetUnit = targetUnit;
					this._bigAttackParam.unit = enemyUnit;
				}	
			
		
				
				this._bigAttackParam.attackStartType = AttackStartType.NORMAL;

				BattlerChecker.setUnit(this._bigAttackParam.unit, this._bigAttackParam.targetUnit);


				var generator = root.getEventGenerator();
				message = "You did well, " + oldUnit.getName() + ".";
				message2 = "Your turn, " + targetUnit.getName() + "!";
				generator.messageTerop(message, 2, true);
				generator.messageTerop(message2, 2, true);
				generator.execute()

				
				var infoBuilder = createObject(NormalAttackInfoBuilder);
				var orderBuilder = createObject(NormalAttackOrderBuilder);
				var attackInfo = infoBuilder.createAttackInfo(this._bigAttackParam);
				var attackOrder = orderBuilder.createAttackOrder(attackInfo);

				
			
				this._attackFlow.setAttackInfoAndOrder(attackInfo, attackOrder, this._parentCoreAttack);
				
				this._order = this._attackFlow.getAttackOrder();
				this._attackInfo = this._attackFlow.getAttackInfo();
				this._resetBattleMemberData(this._parentCoreAttack);


				this._criticalActive = false;
				this._ineffectiveActive = false;
				this._effectiveActive = false;

				this._criticalPassive = false;
				this._ineffectivePassive = false;
				this._effectivePassive = false;

				
				if(this._lock) {
					this._lock = false;
					this.changeCycleMode(RealBattleMode.BATTLESTART)
					return MoveResult.CONTINUE;
				}
				

				this._processModeActionStart();

		}

		if(input == ScrollbarInput.CANCEL) {
			if(!this._lock) {
				this.changeCycleMode(RealBattleMode.COMMAND);
			}
		}
		
		return MoveResult.CONTINUE;
}

RealBattle._drawPokemonSelect = function() {
	this._pokemonSelectMenu.drawWindowManager();
}




RealBattle._changeBattle = function() {
		var battler = this.getActiveBattler();
		
		// Set to true since the screen should scroll according to the position of the motion when it starts moving.
		// This value may be changed to false by battler.startBattler.
		// One such case is when the first frame is the start of a magic loop.
		this._isMotionBaseScroll = true;

		battler.startBattler();
		//this._attackFlow.finalizeAttack();
	}

RealBattle._completeBattleMemberData = function(coreAttack) {
	    inBattle = true;
		this._createBattler();
	
		this._autoScroll.setScrollX(this.getActiveBattler().getFocusX());
		
		this._uiBattleLayout.setBattlerAndParent(this._battlerRight, this._battlerLeft, this);
		
		this._battleTable.setBattleObject(this);
		this._battleTable.enterBattleStart();
		this.changeCycleMode(RealBattleMode.BATTLESTART);
	}

RealBattle._resetBattleMemberData = function(coreAttack) {

		this._seed = Math.floor(Math.random() * 4)
		this._createBattler();
	
		this._autoScroll.setScrollX(this.getActiveBattler().getFocusX());
		this._uiBattleLayout.setBattlerAndParent(this._battlerRight, this._battlerLeft, this);
		this._battleTable = createObject(RealBattleTable);
		this._battleTable.setBattleObject(this);
		this._battleTable.enterBattleStart();
	}


RealBattle._moveActionEnd = function() {
		

		if (this._battleTable.moveActionEnd() !== MoveResult.CONTINUE) {
			this._checkNextAttack();
		}
		
		

		return MoveResult.CONTINUE;
	}

RealBattle._checkNextAttack = function() {

		var result, battler;
		var battlerPrev = this.getActiveBattler();

		if(this.getActiveBattler().getUnit() == this._bigAttackParam.unit && this._order.isCurrentCritical()){
			this._criticalActive = true;
		}

		if(this.getActiveBattler().getUnit() ==  this._bigAttackParam.targetUnit && this._order.isCurrentCritical()){
			this._criticalPassive = true;
		}

		
		this._attackFlow.executeAttackPocess();
		
		result = this._attackFlow.checkNextAttack();
		if (result === AttackFlowResult.DEATH) {
			battler = this.getActiveBattler();
			if (DamageControl.isLosted(battler.getUnit())) {
				battler.lostBattler();
			}
			
			battler = this.getPassiveBattler();
			if (DamageControl.isLosted(battler.getUnit())) {
				battler.lostBattler();
			}
		}
		else if (result === AttackFlowResult.CONTINUE) {


			battler = this.getActiveBattler();
			
			// If battler and battlerPrev are identical, it means that the unit to attack is identical at the previous time and this time.
			if (!battler.checkForceScroll(battler === battlerPrev)) {
				this._processModeActionStart();
			}
			
			// Continue the battle.
			return true;
		}


		if(result !== AttackFlowResult.DEATH) {


			
			
			var infoBuilder = createObject(NormalAttackInfoBuilder);
			var orderBuilder = createObject(NormalAttackOrderBuilder);
			var attackInfo = infoBuilder.createAttackInfo(this._bigAttackParam);
			var attackOrder = orderBuilder.createAttackOrder(attackInfo);

			
			
			this._attackFlow.setAttackInfoAndOrder(attackInfo, attackOrder, this._parentCoreAttack);
				
			this._order = this._attackFlow.getAttackOrder();
			this._attackInfo = this._attackFlow.getAttackInfo();
			this._prepareBattleMemberData(this._parentCoreAttack);
			this._completeBattleMemberData(this._parentCoreAttack);

			this.burnDamage();

			this._commentator(this.getActiveBattler(), this.getPassiveBattler());


			

		}

		else {

			this._deathCommentator(this.getActiveBattler(), this.getPassiveBattler());

			this._processModeBattleEnd();
			
		}
			
		
		return false;
	}


RealBattle.burnDamage = function() {
				var activeUnit = this.getActiveBattler().getUnit();
				var list = activeUnit.getTurnStateList();
				var count = list.getCount();
					
				for (i = 0; i < count; i++) {
					turnState = list.getData(i);
					if (turnState.getState().custom.damage === true) {
						var damageB = Math.floor(ParamBonus.getMhp(activeUnit)/8)
						root.log("damage:" + damageB)
						DamageControl.reduceHp(activeUnit, damageB)
						this._uiBattleLayout.setDamageBurn(this.getActiveBattler(), damageB, false, false, turnState.getState(), true);
						if(DamageControl.isLosted(activeUnit)) {
							activeUnit.setHp(1);
							}
						}
				}

				var passiveUnit = this.getPassiveBattler().getUnit();
				var list = passiveUnit.getTurnStateList();
				var count = list.getCount();
				
				for (i = 0; i < count; i++) {
					turnState = list.getData(i);
					if (turnState.getState().custom.damage === true) {
						var damageB = Math.floor(ParamBonus.getMhp(passiveUnit)/8)
						root.log("damage:" + damageB)
						DamageControl.reduceHp(passiveUnit, damageB)
						this._uiBattleLayout.setDamageBurn(this.getPassiveBattler(), damageB, false, false, turnState.getState(), true);
						if(DamageControl.isLosted(passiveUnit)) {
							passiveUnit.setHp(1);
							}
					}
				}
				
			StateControl.decreaseTurn(PlayerList.getSortieList());
			StateControl.decreaseTurn(EnemyList.getAliveList());

}

RealBattle.moveBattleCycle = function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (mode === RealBattleMode.BATTLESTART) {
			result = this._moveBattleStart();
		}
		else if (mode === RealBattleMode.BATTLE) {
			result = this._moveBattle();
		}
		else if (mode === RealBattleMode.WEAPONSELECT) {
			result = this._moveWeaponSelect();
		}
		else if (mode === RealBattleMode.POKEMONSELECT) {
			result = this._movePokemonSelect();
		}
		else if (mode === RealBattleMode.COMMAND) {
			result = this._moveCommand();
		}
		else if (mode === RealBattleMode.ACTIONSTART) {
			result = this._moveActionStart();
		}
		else if (mode === RealBattleMode.ACTIONEND) {
			result = this._moveActionEnd();
		}
		else if (mode === RealBattleMode.BATTLEEND) {
			result = this._moveBattleEnd();
		}
		else if (mode === RealBattleMode.IDLE) {
			result = this._moveIdle();
		}
		else if (mode === RealBattleMode.DELAY) {
			result = this._moveDelay();
		}
		
		this._moveAnimation();
		
		return result;
	}

RealBattle.drawBattleCycle = function() {
		var mode = this.getCycleMode();
		
		if (this._isBattleLayoutVisible) {
			this._uiBattleLayout.drawBattleLayout();
		}
		
		if (mode === RealBattleMode.BATTLESTART) {
			this._drawBattleStart();
		}
		else if (mode === RealBattleMode.WEAPONSELECT) {
			this._drawWeaponSelect();
		}
		else if (mode === RealBattleMode.POKEMONSELECT) {
			this._drawPokemonSelect();
		}
		else if(mode === RealBattleMode.COMMAND) {
			this._drawCommand();
		}
		else if (mode === RealBattleMode.ACTIONSTART) {
			this._drawActionStart();
		}
		else if (mode === RealBattleMode.ACTIONEND) {
			this._drawActionEnd();
		}
		else if (mode === RealBattleMode.BATTLEEND) {
			this._drawBattleEnd();
		}
	}

RealBattle._drawWeaponSelect= function() {
		this._weaponSelectMenu.drawWindowManager();
}

RealBattle._moveCommand = function() {
	var input = this._unitCommandManager.moveListCommandManager();

	if(this.getCycleMode() === RealBattleMode.RUN) {
		if(!reverse){
			unit = this._order.getActiveUnit();
			targetUnit = this._order.getPassiveUnit();}
		else {
			unit = this._order.getPassiveUnit();
			targetUnit = this._order.getActiveUnit();
		}

		DamageControl.setDeathState(targetUnit);
		this.endBattle();
		return MoveResult.END;
	}

	return MoveResult.CONTINUE;
}

RealBattle._drawCommand = function() {
	this._unitCommandManager.drawListCommandManager();
}

RealBattle.endBattle = function() {
		this.resetPokemonPos();
		reverse = false
		ConfigItem.SkipControl.selectFlag(2);
		MediaControl.musicStop(MusicStopType.BACK);
		MediaControl.resetSoundList();

		this._uiBattleLayout.endBattleLayout();

		actionCount = 0;
		// Prevent to play the animation sound with backBattleCycle after the battle ends.
		this._parentCoreAttack = null;
		inBattle = false;
	}

RealBattle.resetPokemonPos = function() {

	var y = 0;

	var editor = root.getDataEditor();
	var list = PlayerList.getSortieList()
	var count = list.getCount();

	for(i = 0; i < count; i++) {
		unitTmp = list.getData(i) 
		if(unitTmp != null && unitTmp.custom.pokemon) { 
			stateList = unit.getTurnStateList();
			stateCount = stateList.getCount();
			for(j = 0; j < stateCount; j++) {
				state = stateList.getData(j).getState();
				if(!state.custom.persist) {
					editor.deleteTurnStateData(stateList, state);
				}
			}

			root.log("Unit:" + unitTmp.getName());
			unitTmp.setMapX(i-1);
			unitTmp.setMapY(y);	

		}
	}





}

RealBattle._commentator = function(battlerPrev, battler) {
	var activeUnit = battlerPrev.getUnit();
	var passiveUnit = battler.getUnit();
	var weaponActive = ItemControl.getEquippedWeapon(activeUnit);
	var weaponPassive = ItemControl.getEquippedWeapon(passiveUnit);


	this._generator = root.getEventGenerator();

	if(!weaponActive.custom.paralyze) {
		message = activeUnit.getName() + " used " + weaponActive.getName() + ".";
		this._generator.messageTerop(message, 2, true)
	}
	else {
		if(!swap) {
			message = activeUnit.getName() + " is paralyzed and cannot take action.";
			this._generator.messageTerop(message, 2, true) 
		}
		else {
			swap = false;
		}
	}

	if(this._criticalActive && this._order.isCurrentHit()) {
		messageExC = "It's a critical hit!";
		this._generator.messageTerop(messageExC, 2, true)
	}

	if(this._ineffectiveActive && this._order.isCurrentHit()) {
		messageEx = "It's not very effective...";
		this._generator.messageTerop(messageEx, 2, true)
	}
	else if(this._effectiveActive  && this._order.isCurrentHit()) {
		messageEx = "It's super effective!";
		this._generator.messageTerop(messageEx, 2, true)
	}

	if(weaponActive.custom.defense == -1) {
		messageDef = passiveUnit.getName() + "'s defense fell!";
		this._generator.messageTerop(messageDef, 2, true)
	}

	else if(weaponActive.custom.attack == -1) {
		messageDef = passiveUnit.getName() + "'s attack fell!";
		this._generator.messageTerop(messageDef, 2, true)
	}

	else if(weaponActive.custom.accuracy == -1) {
		messageDef = passiveUnit.getName() + "'s accuracy fell!";
		this._generator.messageTerop(messageDef, 2, true)
	}



	if(StateControl.getTurnStatePersist(passiveUnit) != null & !passiveFlag) {
		passiveFlag = true;
		
		state = StateControl.getTurnStatePersist(passiveUnit)
		passiveState = state.custom.type 
		messageState = passiveUnit.getName() + " is " + state.custom.type + "!";
		this._generator.messageTerop(messageState, 2, true)
	}

	
	

	if(!weaponPassive.custom.paralyze) {
		message2 = passiveUnit.getName() + " used " + weaponPassive.getName() + ".";
		this._generator.messageTerop(message2, 2, true)
	}
	else {
		if(!swap) {
			message = passiveUnit.getName() + " is paralyzed and cannot take action.";
			this._generator.messageTerop(message, 2, true)
		}
		else {
			swap = false;
		}
	}

	if(this._criticalPassive && this._order.isCurrentHit()) {
		messageExC2 = "It's a critical hit!";
		this._generator.messageTerop(messageExC2, 2, true)
	}

	if(this._ineffectivePassive  && this._order.isCurrentHit()) {
		messageEx2 = "It's not very effective...";
		this._generator.messageTerop(messageEx2, 2, true)
	}
	else if(this._effectivePassive  && this._order.isCurrentHit()) {
		messageEx2 = "It's super effective!";
		this._generator.messageTerop(messageEx2, 2, true)
	}

	if(weaponPassive.custom.defense == -1) {
		messageDef2 = activeUnit.getName() + "'s defense fell!";
		this._generator.messageTerop(messageDef2, 2, true)
	}

	else if(weaponPassive.custom.attack == -1) {
		messageDef2 = activeUnit.getName() + "'s attack fell!";
		this._generator.messageTerop(messageDef2, 2, true)
	}
	else if(weaponPassive.custom.accuracy == -1) {
		messageDef2 = activeUnit.getName() + "'s accuracy fell!";
		this._generator.messageTerop(messageDef2, 2, true)
	}


	if(StateControl.getTurnStatePersist(activeUnit) != null & !activeFlag) {
		activeFlag = true;
		state = StateControl.getTurnStatePersist(activeUnit)
		activeState = state.custom.type
		messageState = activeUnit.getName() + " is " + state.custom.type + "!";
		this._generator.messageTerop(messageState, 2, true)
	}	





	if(StateControl.getTurnStatePersist(activeUnit) != null & activeFlag) {
		state = StateControl.getTurnStatePersist(activeUnit)
		messageState = activeUnit.getName() + " is still " + state.custom.type + "!";
		this._generator.messageTerop(messageState, 2, true)
	}

	else if(StateControl.getTurnStatePersist(activeUnit) == null & activeFlag) {
		activeFlag = false;
		state = StateControl.getTurnStatePersist(activeUnit)
		mes =  ( activeState==null ) ? "paralyzed" : activeState 
		messageState = activeUnit.getName() + " is no longer " + mes + "!";
		this._generator.messageTerop(messageState, 2, true)
		activeState = null;
	}


		if(StateControl.getTurnStatePersist(passiveUnit) != null & passiveFlag) {
		state = StateControl.getTurnStatePersist(passiveUnit)
		messageState = passiveUnit.getName() + " is still " + state.custom.type + "!";
		this._generator.messageTerop(messageState, 2, true)
	}

	else if(StateControl.getTurnStatePersist(passiveUnit) == null & passiveFlag) {
		passiveFlag = false;
		state = StateControl.getTurnStatePersist(passiveUnit)
		mes = ( passiveState==null )? "paralyzed" : passiveState
		messageState = passiveUnit.getName() + " is no longer " + mes + "!";
		this._generator.messageTerop(messageState, 2, true)
		passiveState = null;
	}






	this._generator.execute();

	this._criticalActive = false;
	this._ineffectiveActive = false;
	this._effectiveActive = false;

	this._criticalPassive = false;
	this._ineffectivePassive = false;
	this._effectivePassive = false;
}

RealBattle._deathCommentator = function(battlerPrev, battler) {


	var activeUnit = battlerPrev.getUnit();
	var passiveUnit = battler.getUnit();
	var weaponActive = ItemControl.getEquippedWeapon(activeUnit).getName();
	var weaponPassive = ItemControl.getEquippedWeapon(passiveUnit).getName();

	this._generator = root.getEventGenerator();
	

	root.log("name:" + this._bigAttackParam.unit.getName())

	if(DamageControl.isLosted(this._bigAttackParam.unit)) {
		message2 = passiveUnit.getName() + " used " + weaponPassive + ".";
		this._generator.messageTerop(message2, 2, true)

		if(this._criticalActive) {
			messageExC2 = "It's a critical hit!";
			this._generator.messageTerop(messageExC2, 2, true)
		}

		if(this._ineffectiveActive) {
			messageEx2 = "It's not very effective...";
			this._generator.messageTerop(messageEx2, 2, true)
		}
		else if(this._effectiveActive) {
			messageEx2 = "It's super effective!";
			this._generator.messageTerop(messageEx2, 2, true)
		}

		message = activeUnit.getName() + " used " + weaponActive + ".";
		this._generator.messageTerop(message, 2, true)

		if(this._criticalPassive) {
			messageExC = "It's a critical hit!";
			this._generator.messageTerop(messageExC, 2, true)
		}

		if(this._ineffectivePassive) {
			messageEx = "It's not very effective...";
			this._generator.messageTerop(messageEx, 2, true)
		}
		else if(this._effectivePassive) {
			messageEx = "It's super effective!";
			this._generator.messageTerop(messageEx, 2, true)
		}

		message3 = passiveUnit.getName() + " fainted.";
		this._generator.messageTerop(message3, 2, true)
	}

	else if(DamageControl.isLosted(this._bigAttackParam.targetUnit)) {
		message = activeUnit.getName() + " used " + weaponActive + ".";
		this._generator.messageTerop(message, 2, true)

		if(this._criticalActive) {
			messageExC2 = "It's a critical hit!";
			this._generator.messageTerop(messageExC2, 2, true)
		}

		if(this._ineffectiveActive) {
			messageEx = "It's not very effective...";
			this._generator.messageTerop(messageEx, 2, true)
		}
		else if(this._effectiveActive) {
			messageEx = "It's super effective!";
			this._generator.messageTerop(messageEx, 2, true)
		}


		message3 = passiveUnit.getName() + " fainted.";
		this._generator.messageTerop(message3, 2, true)
	}


	this._generator.execute();


	this._criticalActive = false;
	this._ineffectiveActive = false;
	this._effectiveActive = false;

	this._criticalPassive = false;
	this._ineffectivePassive = false;
	this._effectivePassive = false;
}

var RealBattleMode = {
	BATTLESTART: 0,
	BATTLE: 1,
	ACTIONSTART: 2,
	ACTIONEND: 3,
	BATTLEEND: 4,
	IDLE: 5,
	DELAY: 6,
	WEAPONSELECT: 7,
	COMMAND: 8,
	RUN: 9
};

AttackChecker.isCounterattack = function(unit, targetUnit) {
		var weapon, indexArray;
		
		if (!Calculator.isCounterattackAllowed(unit, targetUnit)) {
			return false;
		}
		
		weapon = ItemControl.getEquippedWeapon(unit);
		if (weapon !== null && weapon.isOneSide()) {
			// If the attacker is equipped with "One Way" weapon, no counterattack occurs.
			return false;
		}
		
		// Get the equipped weapon of those who is attacked.
		weapon = ItemControl.getEquippedWeapon(targetUnit);
		
		// If no weapon is equipped, cannot counterattack.
		if (weapon === null) {
			return false;
		}
		
		// If "One Way" weapon is equipped, cannot counterattack.
		if (weapon.isOneSide()) {
			return false;
		}
		
		indexArray = IndexArray.createIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), weapon);

		//return IndexArray.findUnit(indexArray, unit);
		return true;
	}

AttackEvaluator.HitCritical.isHit = function(virtualActive, virtualPassive, attackEntry) {
		// Calculate with probability if it hits.
		if(ItemControl.getEquippedWeapon(virtualActive.unitSelf).custom.paralyze){
			return false;
		}


		return this.calculateHit(virtualActive, virtualPassive, attackEntry);
	}

AttackEvaluator.HitCritical._checkStateAttack = function(virtualActive, virtualPassive, attackEntry) {
		var i, count, skill, state;
		var arr = SkillControl.getDirectSkillArray(virtualActive.unitSelf, SkillType.STATEATTACK, '');
		
		// Check the "State Attack" skill.
		count = arr.length;
		for (i = 0; i < count; i++) {
			skill = arr[i].skill;
			state = this._getState(skill);
			
			if (StateControl.isStateBlocked(virtualPassive.unitSelf, virtualActive.unitSelf, state)) {
				// Don't activate because the state is disabled.
				continue;
			}
			
			if (!SkillRandomizer.isSkillInvoked(virtualActive.unitSelf, virtualPassive.unitSelf, skill)) {
				// The activation rate of the skill wasn't satisfied.
				continue;
			}
			
			// Skill was activated at Active, so add in skillArrayActive.
			if (skill.isSkillDisplayable()) {
				attackEntry.skillArrayActive.push(skill);
			}
			
			// State is received at Passive, so add in stateArrayPassive.
			attackEntry.stateArrayPassive.push(state);
			
			// Record the state through the entire battle.
			virtualPassive.stateArray.push(state);
		}
		
		// Check "Optional State" of weapons.
		state = StateControl.checkStateInvocation(virtualActive.unitSelf, virtualPassive.unitSelf, virtualActive.weapon);
		if (state !== null) {
			if(state.custom.persist && StateControl.getTurnStatePersist(virtualPassive.unitSelf) == null) {
				attackEntry.stateArrayPassive.push(state);
				virtualPassive.stateArray.push(state);
			}
			else if(state.custom.persist && StateControl.getTurnStatePersist(virtualPassive.unitSelf) != null) {

			}
			else if(!state.custom.persist) {
				attackEntry.stateArrayPassive.push(state);
				virtualPassive.stateArray.push(state);
			}
		}
	}


CombinationCollector.Weapon.collectCombination = function(misc) {
		var i, weapon, filter, rangeMetrics;
		var unit = misc.unit;
		var itemCount = UnitItemControl.getPossessionItemCount(unit);
		
		for (i = 0; i < itemCount; i++) {
			weapon = UnitItemControl.getItem(unit, i);
			if (weapon === null) {
				continue;
			}
			
			// If it's not a weapon, or cannot equip with a weapon, don't continue.
			if (!weapon.isWeapon() || !this._isWeaponEnabled(unit, weapon, misc) || weapon.custom.engage) {
				continue;
			}
			
			misc.item = weapon;
			
			rangeMetrics = StructureBuilder.buildRangeMetrics();
			rangeMetrics.startRange = weapon.getStartRange();
			rangeMetrics.endRange = weapon.getEndRange();
			
			filter = this._getWeaponFilter(unit);
			this._checkSimulator(misc);
			this._setUnitRangeCombination(misc, filter, rangeMetrics);
		}
	}


RealBattle._changeBattle = function() {
		var battler = this.getActiveBattler();

		
		
		// Set to true since the screen should scroll according to the position of the motion when it starts moving.
		// This value may be changed to false by battler.startBattler.
		// One such case is when the first frame is the start of a magic loop.
		this._isMotionBaseScroll = true;
		
		battler.startBattler();


	}

UIBattleLayout._showDamageAnime = function(battler, isCritical, isFinish) {
		var pos, effect, isRight;
		var anime = null;
		var isNoDamage = this._realBattle.getAttackOrder().getPassiveDamage() === 0;
		var offsetPos = EnemyOffsetControl.getOffsetPos(battler);
		
		if (root.getAnimePreference().isEffectDefaultStyle()) {
			isRight = this._realBattle.getActiveBattler() === this._realBattle.getBattler(true);
		}
		else {
			isRight = this._realBattle.getPassiveBattler() === this._realBattle.getBattler(true);
		}
		
		anime = WeaponEffectControl.getDamageAnime(this._realBattle.getActiveBattler().getUnit(), isCritical, true);
		if (anime !== null) {
			pos = battler.getEffectPos(anime);
			effect = this._realBattle.createEffect(anime, pos.x + offsetPos.x, pos.y + offsetPos.y, isRight, false);
			effect.setAsync(this._isDamageEffectAsync());
		}
		
		if (isNoDamage) {
			anime = root.queryAnime('realnodamage');
		}
		else if (isCritical) {
			anime = root.queryAnime('realcriticalhit');
		}
		else {
			anime = null;
		}
		
		if (anime !== null) {
			pos = battler.getEffectPos(anime);
			effect = this._realBattle.createEffect(anime, pos.x + offsetPos.x, pos.y + offsetPos.y + this._getTextAnimeOffsetY(), isRight, false);
			effect.setAsync(false);
		}
		
		if (!isNoDamage && this._isDamagePopupDisplayable()) {
			this._showDamagePopup(battler, this._realBattle.getAttackOrder().getPassiveFullDamage(), isCritical);
		}
	}
	
UIBattleLayout._isDamageEffectAsync = function() {
		// If "Weapon Effects" is set, the battle tempo gets better by returning true with this method.
		return false;
	}

RealBattle._processModeActionStart = function() {
		
		if (this._battleTable.enterActionStart() === EnterResult.NOTENTER) {
			this._changeBattle();
			this.changeCycleMode(RealBattleMode.BATTLE);
		}
		else {
			this.changeCycleMode(RealBattleMode.ACTIONSTART);
		}
	}

UIBattleLayout.setDamageBurn = function(battler, damage, isCritical, isFinish, state, isRight) {
		var gauge;
		var xScroll = this._realBattle.getAutoScroll().getScrollX();
		var yScroll = 0;

		this._drawEffectCustom(xScroll, yScroll, true, state, isRight, battler)
		
		if (battler === this._battlerRight) {
			gauge = this._gaugeRight;
		}
		else {
			gauge = this._gaugeLeft;
		}
		
		if (damage >= 0) {
			gauge.startMove(damage * -1);
			//this._showDamageAnime(battler, isCritical, isFinish);
		}
		else {
			// If damage is minus, it means that recovery should be done.
			// However, func always requests positive number, so times -1. 
			gauge.startMove(damage * -1);
			//this._showRecoveryAnime(battler);
		}
	}

UIBattleLayout._drawEffectCustom = function(xScroll, yScroll, isFront, state, isRight, battler) {
		var i, effect;

		anime = state.getRealAnime();
		var pos = battler.getEffectPos(anime);
		effect = this._realBattle.createEffect(anime, pos.x, pos.y, isRight, false);
		effect.setAsync(true);
		effect.drawEffect(xScroll, yScroll, isFront);

		
	}


UnitItemControl.getParalyzeWeapon = function(unit) {
	var i, item;
	var count = UnitItemControl.getPossessionItemCount(unit);

		
	for (i = 0; i < count; i++) {
		item = UnitItemControl.getItem(unit, i)
		if(item.custom.paralyze) {
			return item;
		}
	}
}




GameOverChecker.checkAvailablePokemon = function() {
	var list = PlayerList.getSortieList();
	var count = list.getCount();

	for(i = 0; i < count; i++) {
		unit = list.getData(i)
		if(unit.custom.pokemon && unit.getHp() > 0) {
			return true;
		}
	}

	return false;

}

RealBattle._moveBattleEnd = function() {
		if (this._battleTable.moveBattleEnd() !== MoveResult.CONTINUE) {
			var unit;
			unit = this._order.getPassiveUnit();



			root.log("ProcessEnd:" + unit.getName() + "/" + unit.getHp())

			if(unit.getHp() == 0 && unit == this._mainUnit) {
				if(GameOverChecker.checkAvailablePokemon()) {
					this._dyingUnit = unit
					this._killingUnit = this._order.getActiveUnit();
					this._lock = true;
					trainer.custom.emergency = true

					root.log("CURRENT POKEMON!:" + ItemControl.getEquippedWeapon(trainer).getName() + "/" + unit.getName())

					this._pokemonSelectMenu = createObject(MidCombatPokemonSelectMenu);
					this._pokemonSelectMenu.setMenuUnitAndTarget(trainer, enemyTrainer,  enemyTrainer.getMapX(),  enemyTrainer.getMapY(), ItemControl.getEquippedWeapon(enemyTrainer));
					this.changeCycleMode(RealBattleMode.POKEMONSELECT);
				
					return MoveResult.CONTINUE;
				}
				else {
					this.endBattle();
					return MoveResult.END;
				}
			}
			else {
				this.endBattle();
				return MoveResult.END;
			}
		
		}
		
		return MoveResult.CONTINUE;
}
