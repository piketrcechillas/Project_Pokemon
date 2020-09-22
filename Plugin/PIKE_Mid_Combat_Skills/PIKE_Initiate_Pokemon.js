var trainerName = null;
var isWild = false;
var inBattle = false;
var playerPokemon = null;
var enemyPokemon = null;

UnitCommand.Attack._createAttackParam = function() {
		var attackParam = StructureBuilder.buildAttackParam();
		
		var pkmName = ItemControl.getEquippedWeapon(this.getCommandTarget()).getName();
		var enemyPkmName = ItemControl.getEquippedWeapon(this._posSelector.getSelectorTarget(false)).getName();

		trainerName = this._posSelector.getSelectorTarget(false).getName();

		trainer = this.getCommandTarget()
		enemyTrainer = this._posSelector.getSelectorTarget(false);

		ConfigItem.SkipControl.selectFlag(0);


		var list = PlayerList.getAliveList();
		var count = list.getCount();
		var pkm;
		var enemyPkm;

		for(i = 0; i < count; i++) {
			unit = list.getData(i);
			root.log(unit.getName() + "/" + pkmName)
			if(unit.getName() === pkmName){
				pkm = unit;
				pkm.setInvisible(false);
			}
		}

		var pos = this._posSelector.getSelectorPos(false);

		var MapInfo = root.getCurrentSession().getCurrentMapInfo()
		var TargetList = MapInfo.getListFromUnitGroup(UnitGroup.ENEMYEVENT)

		for (i = 0; i < TargetList.getCount(); i++){
				if (TargetList.getData(i).getName() === enemyPkmName){
					enemyPkm = TargetList.getData(i)
				}
			}


		targetUnit = root.getObjectGenerator().generateUnitFromBaseUnit(enemyPkm);
		targetUnit.setInvisible(true);
		targetUnit.setMapX(pos.x);
		targetUnit.setMapY(pos.y);

		pkm.setMapX(this.getCommandTarget().getMapX())
		pkm.setMapY(this.getCommandTarget().getMapY())

		targetUnit.setInvisible(false);


		attackParam.unit = pkm
		attackParam.targetUnit = targetUnit;
		attackParam.attackStartType = AttackStartType.NORMAL;

		playerPokemon = attackParam.unit;
		enemyPokemon = attackParam.targetUnit;
		
		return attackParam;
	}


ForceBattleEventCommand._prepareEventCommandMemberData = function() {
		var eventCommandData = root.getEventCommandObject();
		trainer = eventCommandData.getForceSrc();
		enemyTrainer = eventCommandData.getForceDest();
		trainerName = enemyTrainer.getName();

		if(enemyTrainer.custom.pokemon) {
			isWild = true;
		}
		else {
			isWild = false;
		}



		if(!isWild) {
			ConfigItem.SkipControl.selectFlag(0);
			var pkmName = ItemControl.getEquippedWeapon(trainer).getName();
			var enemyPkmName = ItemControl.getEquippedWeapon(enemyTrainer).getName();


			var list = PlayerList.getAliveList();
			var count = list.getCount();
			var pkm;
			var enemyPkm;

			for(i = 0; i < count; i++) {
				unit = list.getData(i);
				root.log(unit.getName() + "/" + pkmName)
				if(unit.getName() === pkmName){
					pkm = unit;
				}
			}
			pkm.setMapX(trainer.getMapX())
			pkm.setMapY(trainer.getMapY())


			var MapInfo = root.getCurrentSession().getCurrentMapInfo()
			var TargetList = MapInfo.getListFromUnitGroup(UnitGroup.ENEMYEVENT)

			var id = enemyTrainer.custom.id;

			for (i = 0; i < TargetList.getCount(); i++){
					var temp = TargetList.getData(i)
					if (temp.getName() === enemyPkmName && temp.custom.id == id){
						enemyPkm = temp;
					}
				}
			targetUnit = root.getObjectGenerator().generateUnitFromBaseUnit(enemyPkm);
			targetUnit.setMapX(enemyTrainer.getMapX());
			targetUnit.setMapY(enemyTrainer.getMapY());
			
			this._obj = eventCommandData;
			this._unitSrc = pkm;
			this._unitDest = targetUnit;
			this._fusionData = eventCommandData.getFusionData();
			this._isBattleOnly = false;
			this._preAttack = createObject(PreAttack);
			this._lockonCursor = createObject(LockonCursor);
			
			// Initialize for times when battles cannot occur.
			this.changeCycleMode(ForceBattleMode.LIGHT);
		}
		else {
			ConfigItem.SkipControl.selectFlag(0);
			var pkmName = ItemControl.getEquippedWeapon(trainer).getName();
			var enemyPkmName = enemyTrainer.getName();


			var list = PlayerList.getAliveList();
			var count = list.getCount();
			var pkm;
			var enemyPkm;

			for(i = 0; i < count; i++) {
				unit = list.getData(i);
				root.log(unit.getName() + "/" + pkmName)
				if(unit.getName() === pkmName){
					pkm = unit;
				}
			}
			pkm.setMapX(trainer.getMapX())
			pkm.setMapY(trainer.getMapY())


			var MapInfo = root.getCurrentSession().getCurrentMapInfo()
			var TargetList = MapInfo.getListFromUnitGroup(UnitGroup.ENEMYEVENT)

			for (i = 0; i < TargetList.getCount(); i++){
					if (TargetList.getData(i).getName() === enemyPkmName){
						enemyPkm = TargetList.getData(i)
					}
				}
			targetUnit = root.getObjectGenerator().generateUnitFromBaseUnit(enemyPkm);
			targetUnit.setMapX(trainer.getMapX()+1);
			targetUnit.setMapY(trainer.getMapY());





			
			this._obj = eventCommandData;
			this._unitSrc = pkm;
			this._unitDest = targetUnit;
			this._fusionData = eventCommandData.getFusionData();
			this._isBattleOnly = false;
			this._preAttack = createObject(PreAttack);
			this._lockonCursor = createObject(LockonCursor);
			
			// Initialize for times when battles cannot occur.
			this.changeCycleMode(ForceBattleMode.LIGHT);
		}
	}


ForceBattleEventCommand._createAttackParam = function() {
		var attackParam = StructureBuilder.buildAttackParam();
		
		attackParam.unit = this._unitSrc;
		attackParam.targetUnit = this._unitDest;
		attackParam.attackStartType = AttackStartType.NORMAL;
		attackParam.forceBattleObject = this._obj;
		
		if (this._fusionData !== null && this._fusionData.getFusionType() === FusionType.ATTACK) {
			attackParam.fusionAttackData = this._fusionData;
		}

		playerPokemon = attackParam.unit;
		enemyPokemon = attackParam.targetUnit;
		
		return attackParam;
	}

