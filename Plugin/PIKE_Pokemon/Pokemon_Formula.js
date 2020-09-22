DamageCalculator.calculateDamage = function(active, passive, weapon, isCritical, activeTotalStatus, passiveTotalStatus, trueHitValue) {
		var pow, def, damage;
		
		if (this.isHpMinimum(active, passive, weapon, isCritical, trueHitValue)) {
			return -1;
		}
		
		pow = this.calculateAttackPower(active, passive, weapon, isCritical, activeTotalStatus, trueHitValue);
		def = this.calculateDefense(active, passive, weapon, isCritical, passiveTotalStatus, trueHitValue);

		var weaponPow;

		root.log("PKMFAINT?" + pkmFainted)

		if(pkmFainted && weapon.custom.retaliate) {
			root.log("DOUBLE!")
			weaponPow = weapon.getPow()*2;
		}
		else {
			root.log("NOT DOUBLE!")
			weaponPow = weapon.getPow();
		}
		
		var random = ((Math.random()*(100-85)+1) + 85)/100;

		damage = Math.floor( ((((2*active.getLv() + 10)/250) * weaponPow * (pow/def))-3)*random)


		if (this.isHalveAttack(active, passive, weapon, isCritical, trueHitValue)) {
			if (!this.isHalveAttackBreak(active, passive, weapon, isCritical, trueHitValue)) {
				damage = Math.floor(damage / 2);
			}
		}
		
		if (this.isCritical(active, passive, weapon, isCritical, trueHitValue)) {
			damage = Math.floor(damage * this.getCriticalFactor());
		}

		if(weapon.custom.nonattack) {
			damage = 0
		}
		
		return this.validValue(active, passive, weapon, damage);
	}

DamageCalculator.isHalveAttack = function(active, passive, weapon, isCritical, trueHitValue) {
		var weaponPassive = ItemControl.getEquippedWeapon(passive);
		
		if (weaponPassive !== null && weaponPassive.getWeaponOption() === WeaponOption.HALVEATTACK) {
			return true;
		}


		var list = active.getTurnStateList();
		var count = list.getCount();
					
		for (i = 0; i < count; i++) {
			turnState = list.getData(i);
			if (turnState.getState().custom.burn === true) {
				return true;				
			}
		}

		
		return SkillControl.getBattleSkillFromValue(passive, active, SkillType.BATTLERESTRICTION, BattleRestrictionValue.HALVEATTACK) !== null;
	}

