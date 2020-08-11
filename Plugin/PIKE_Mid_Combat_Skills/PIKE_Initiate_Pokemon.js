var trainerName = null;
var isWild = false;

UnitCommand.Attack._createAttackParam = function() {
		var attackParam = StructureBuilder.buildAttackParam();
		
		var pkmName = ItemControl.getEquippedWeapon(this.getCommandTarget()).getName();
		var enemyPkmName = ItemControl.getEquippedWeapon(this._posSelector.getSelectorTarget(false)).getName();

		trainerName = this._posSelector.getSelectorTarget(false).getName();

		ConfigItem.SkipControl.selectFlag(0);


		var list = PlayerList.getSortieList();
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
		
		return attackParam;
	}