UnitRangePanel._setLight = function(isWeapon) {
		this._mapChipLight.setLightType(MapLightType.MOVE);
		
		var core = this._simulator.getSimulationIndexArray();



		var newArray = HexaController._redraw(core, this._unit);


		this._mapChipLight.setIndexArray(newArray);


		if (isWeapon) {
			this._mapChipLightWeapon.setLightType(MapLightType.RANGE);

			var coreWeapon = this._simulator.getSimulationWeaponIndexArray()

			var newWeaponArray = HexaController._redraw(coreWeapon, this._unit);

			this._mapChipLightWeapon.setIndexArray(newWeaponArray);
		}
		else{
			this._mapChipLightWeapon.endLight();
		}
	}

MapChipLight.drawLight = function() {
		if (this._type === MapLightType.NORMAL) {
			root.drawFadeLight(this._indexArray, this._getColor(), this._getAlpha());
		}
		else if (this._type === MapLightType.MOVE) {
			root.drawWavePanel(this._indexArray, this._getMoveImage(), 0);
		}
		else if (this._type === MapLightType.RANGE) {
			root.drawWavePanel(this._indexArray, this._getRangeImage(), 0);
		}
	}


HexaController = {
	_redraw: function(indexArray, unit) {
		var x = unit.getMapX();
		var y = unit.getMapY();
		var newArray = []
		for(i = 0; i < indexArray.length; i++) {
			index = indexArray[i];
			xInd = CurrentMap.getX(index);
			yInd = CurrentMap.getY(index);
			z = xInd+yInd;
			if(z%2==1 && yInd - y <= ParamBonus.getMov(unit)/2 && yInd - y >= (-1)*ParamBonus.getMov(unit)/2){
				newArray.push(index);
			}
		}

		return newArray;
	},

	_redrawAttack: function(indexArray, unit) {

	}
}


AttackChecker.getAttackIndexArray =  function(unit, weapon, isSingleCheck) {
		var i, index, x, y, targetUnit;
		var indexArrayNew = [];
		var indexArray = IndexArray.createIndexArray(unit.getMapX(), unit.getMapY(), weapon);
		var count = indexArray.length;
		
		for (i = 0; i < count; i++) {
			index = indexArray[i];
			x = CurrentMap.getX(index);
			y = CurrentMap.getY(index);
			targetUnit = PosChecker.getUnitFromPos(x, y);
			if (targetUnit !== null && unit !== targetUnit) {
				if (FilterControl.isReverseUnitTypeAllowed(unit, targetUnit)) {
					indexArrayNew.push(index);
					if (isSingleCheck) {
						return indexArrayNew;
					}
				}
			}
		}
		
		return indexArrayNew;
	}

 SimulateMove.moveUnit = function() {
		var x, y;
		var dx = this._dxSpeedValue;
		var dy = this._dySpeedValue;
		var chipWidth = GraphicsFormat.MAPCHIP_WIDTH;
		var chipHeight = GraphicsFormat.MAPCHIP_HEIGHT;
		
		if (this._isMoveFinal) {
			return MoveResult.END;
		}
		
		if (DataConfig.isHighPerformance()) {
			dx /= 2;
			dy /= 2;
		}
		
		this._controlScroll(dx, dy);
		
		this._xPixel += XPoint[this._unit.getDirection()] * dx;
		this._yPixel += YPoint[this._unit.getDirection()] * dy;
		
		if ((this._xPixel % chipWidth) === 0 && (this._yPixel % chipHeight) === 0) {
			this._playMovingSound();
			this._moveCount++;
			if (this._moveCount === this._moveMaxCount) {
				x = Math.floor(this._xPixel / chipWidth);
				y = Math.floor(this._yPixel / chipHeight);
				this._unit.setMapX(x);
				this._unit.setMapY(y); 
				this._endMove(this._unit);
				return MoveResult.END;
			}
			else {
				this._unit.setDirection(this._moveCource[this._moveCount]);
			}
		}
		
		this._unitCounter.moveUnitCounter();
		
		return MoveResult.CONTINUE;
	}